#!/usr/bin/env node

const fastify = require('fastify')({ 
  logger: false,
  bodyLimit: 104857600 
});

const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const axios = require('axios');

const PORT = 3333;
const DATA_DIR = path.join(os.homedir(), '.pzero');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const WORKSPACES_DIR = path.join(DATA_DIR, 'workspaces');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
if (!fs.existsSync(path.join(DATA_DIR, 'details'))) fs.mkdirSync(path.join(DATA_DIR, 'details'), { recursive: true, mode: 0o700 });
if (!fs.existsSync(WORKSPACES_DIR)) fs.mkdirSync(WORKSPACES_DIR, { recursive: true, mode: 0o700 });
if (!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, JSON.stringify([]));

fastify.register(require('@fastify/cors'), { origin: '*' });
fastify.register(require('@fastify/static'), {
  root: path.resolve(__dirname, '../public'),
  prefix: '/',
});

// Хранилище подключенных SSE клиентов
let sseClients = [];

fastify.get('/api/events', (req, reply) => {
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  
  const client = { reply };
  sseClients.push(client);
  
  req.raw.on('close', () => {
    sseClients = sseClients.filter(c => c !== client);
  });
});

function broadcastEvent(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(c => c.reply.raw.write(msg));
}

// Хранилище активных деплоев и серверов
const activeDeployments = new Map();
const activeWebUIs = new Map();
const serverInstances = new Map(); // projectId -> fastify instance

// Глобальный флаг для остановки выполнения текущего графа
const activeExecutions = new Set();

// Функция выполнения графа агентов
async function executeGraph(executionId, prompt, nodes, connections, onStart, onToken, onResult, onError, projectId) {
  const resultsMap = new Map();
  const inDegree = new Map();
  const adj = new Map();

  // Инициализация графа
  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  // Построение зависимостей
  (connections || []).forEach(c => {
    if (adj.has(c.fromId)) {
      adj.get(c.fromId).push(c.toId);
      inDegree.set(c.toId, inDegree.get(c.toId) + 1);
    }
  });

  // Очередь для узлов, у которых нет невыполненных зависимостей
  let queue = nodes.filter(n => inDegree.get(n.id) === 0);

  // Подготовка воркспейса проекта
  let projectWorkspace = "";
  if (projectId) {
    projectWorkspace = path.join(WORKSPACES_DIR, projectId);
    if (!fs.existsSync(projectWorkspace)) fs.mkdirSync(projectWorkspace, { recursive: true });
  }

  while (queue.length > 0) {
    // Выполняем все доступные узлы параллельно
    const currentBatch = [...queue];
    queue = [];

    await Promise.all(currentBatch.map(async (node) => {
      // Проверка на остановку
      if (!activeExecutions.has(executionId)) return;

      if (onStart) onStart(node);
      broadcastEvent({ type: 'start', nodeId: node.id });
      
      let currentOutput = "";
      try {
        let inputFromOthers = "";
        const incoming = (connections || []).filter(c => c.toId === node.id);
        if (incoming.length > 0) {
          inputFromOthers = "\n### ДАННЫЕ ОТ ПРЕДЫДУЩИХ АГЕНТОВ (ВХОД) ###\n";
          for (const conn of incoming) {
            const sourceOutput = resultsMap.get(conn.fromId);
            if (sourceOutput) {
              const sourceNode = nodes.find(n => n.id === conn.fromId);
              inputFromOthers += `\n[ОТ АГЕНТА: ${sourceNode?.name || 'Unknown'}]:\n${sourceOutput}\n-------------------\n`;
            }
          }
        }

        let knowledge = "";
        if (node.context && node.context.length > 0) {
          knowledge = "\n### БАЗА ЗНАНИЙ (ОСНОВНОЙ КОНТЕКСТ) ###\n";
          for (const item of node.context) {
            knowledge += `\n[ИСТОЧНИК: ${item.name}]\n`;
            if (item.type === 'file') {
              knowledge += item.content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').substring(0, 15000);
            } else if (item.type === 'link') {
               try {
                 const linkRes = await axios.get(item.url, { 
                   timeout: 10000,
                   headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                 });
                 const cleanText = linkRes.data.toString()
                   .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
                   .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
                   .replace(/<[^>]*>?/gm, ' ')
                   .replace(/\s+/g, ' ')
                   .trim()
                   .substring(0, 15000);
                 knowledge += cleanText;
               } catch(e) { knowledge += `[ОШИБКА ЗАГРУЗКИ ССЫЛКИ: ${e.message}]`; }
            }
            knowledge += "\n-------------------\n";
          }
        }

        // --- ДОБАВЛЕННЫЙ ФАЙЛОВЫЙ КОНТЕКСТ ---
        let workspaceFilesInfo = "";
        if (projectWorkspace) {
           const files = fs.readdirSync(projectWorkspace);
           if (files.length > 0) {
             workspaceFilesInfo = "\n### ФАЙЛЫ В ПАПКЕ ПРОЕКТА (WORKSPACE) ###\n";
             for (const file of files) {
               const filePath = path.join(projectWorkspace, file);
               if (fs.lstatSync(filePath).isFile()) {
                 const content = fs.readFileSync(filePath, 'utf8').substring(0, 5000);
                 workspaceFilesInfo += `\n[ФАЙЛ: ${file}]\n${content}\n-------------------\n`;
               }
             }
           }
        }
        // ------------------------------------

        let systemPrompt = `ТЫ — ИИ-АГЕНТ В ОРКЕСТРАТОРЕ PZERO. ТВОЯ РОЛЬ И ДИРЕКТИВА ОПРЕДЕЛЕНЫ НИЖЕ.\n\n### ТВОЯ ДИРЕКТИВА:\n${node.directive}`;
        
        // Добавляем инструкцию по записи файлов
        systemPrompt += `\n\n### ИНСТРУКЦИЯ ПО РАБОТЕ С ФАЙЛАМИ:\nЕсли тебе нужно создать или изменить файл в воркспейсе, используй формат:\n[[WRITE_FILE:path]]\nконтент файла\n[[/WRITE_FILE]]\n(Где path - это имя файла, например index.html)`;

        if (workspaceFilesInfo) {
          systemPrompt += `\n\n${workspaceFilesInfo}`;
        }

        if (knowledge) {
          systemPrompt += `\n\n### ПРАВИЛА РАБОТЫ С КОНТЕКСТОМ:\n1. Твой ответ должен базироваться на предоставленной ниже БАЗЕ ЗНАНИЙ.\n2. Если информации нет в базе знаний, так и скажи.\n3. Не выдумывай факты.\n\n${knowledge}`;
        }
        if (inputFromOthers) {
          systemPrompt += `\n\n${inputFromOthers}`;
        }

        if (node.type === 'ALEM_AI') {
          if (node.alemTask === 'IMAGE') {
            const finalPrompt = prompt + (inputFromOthers ? " " + inputFromOthers : "");
            const key = 'sk-.......'; 
            const response = await axios.post('https://llm.alem.ai/v1/images/generations', {
              model: "text-to-image", prompt: finalPrompt.substring(0, 1000), size: "720x720" 
            }, { headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' } });
            let imgContent = "";
            if (response.data && response.data.data && response.data.data.length > 0) {
                const imgData = response.data.data[0];
                imgContent = imgData.url || (imgData.b64_json ? `data:image/png;base64,${imgData.b64_json}` : "");
            }
            currentOutput = imgContent ? `![Generated Image](${imgContent})` : `[Не удалось получить изображение]`;
          } else {
            const response = await fetch('https://llm.alem.ai/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${node.alemKey || 'sk-......'}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  model: node.alemModel || "gpt-oss", 
                  messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], 
                  temperature: node.temperature ?? 0.7, top_p: node.top_p ?? 0.9, max_tokens: node.max_tokens ?? 2048,
                  stream: true 
              })
            });
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while (true) {
              if (!activeExecutions.has(executionId)) { reader.cancel(); return; }
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop();
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6);
                  if (dataStr === '[DONE]') break;
                  try {
                    const data = JSON.parse(dataStr);
                    const token = data.choices[0].delta.content;
                    if (token) { currentOutput += token; if (onToken) onToken(node, token); }
                  } catch (e) {}
                }
              }
            }
          }
        } else if (node.type === 'OLLAMA') {
          const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                model: node.model || "llama3", 
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], 
                options: { temperature: node.temperature ?? 0.7, top_p: node.top_p ?? 0.9, num_predict: node.max_tokens ?? 2048 },
                stream: true 
            })
          });
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (true) {
            if (!activeExecutions.has(executionId)) { reader.cancel(); return; }
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const data = JSON.parse(line);
                const token = data.message.content;
                if (token) { currentOutput += token; if (onToken) onToken(node, token); }
                if (data.done) break;
              } catch (e) {}
            }
          }
        }
        resultsMap.set(node.id, currentOutput);

        // --- ПАРСИНГ И ЗАПИСЬ ФАЙЛОВ ---
        if (projectWorkspace && currentOutput.includes('[[WRITE_FILE:')) {
          const regex = /\[\[WRITE_FILE:(.+?)\]\]([\s\S]*?)\[\[\/WRITE_FILE\]\]/g;
          let match;
          while ((match = regex.exec(currentOutput)) !== null) {
            const filePath = path.join(projectWorkspace, match[1].trim());
            const content = match[2].trim();
            try {
              // Создаем поддиректории если нужно
              fs.mkdirSync(path.dirname(filePath), { recursive: true });
              fs.writeFileSync(filePath, content);
              console.log(`[WORKSPACE] File written: ${filePath}`);
            } catch (err) {
              console.error(`[WORKSPACE] Error writing file ${filePath}:`, err);
            }
          }
        }
        // -------------------------------

        if (onResult) onResult(node, currentOutput);
        broadcastEvent({ type: 'result', nodeId: node.id });

        // Обновляем степени входящих связей для соседей
        adj.get(node.id).forEach(neighborId => {
          inDegree.set(neighborId, inDegree.get(neighborId) - 1);
          if (inDegree.get(neighborId) === 0) {
            queue.push(nodes.find(n => n.id === neighborId));
          }
        });

      } catch (err) {
        if (onError) onError(node, err.message);
      }
    }));
  }
  return resultsMap;
}

// REST API
fastify.get('/api/projects', async () => JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8')));

fastify.post('/api/projects', async (req) => {
  const { name } = req.body;
  const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
  const newProject = { id: crypto.randomBytes(4).toString('hex'), name, createdAt: new Date() };
  projects.push(newProject);
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  return newProject;
});

fastify.post('/api/projects/import', async (req) => {
  const { name, nodes, connections, webUI } = req.body;
  const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
  const newId = crypto.randomBytes(4).toString('hex');
  const newProjectMeta = { id: newId, name: name || 'Imported Army', createdAt: new Date() };
  
  projects.push(newProjectMeta);
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  
  const details = { nodes: nodes || [], connections: connections || [], webUI: webUI || '' };
  fs.writeFileSync(path.join(DATA_DIR, 'details', `${newId}.json`), JSON.stringify(details, null, 2));
  
  return newProjectMeta;
});

fastify.get('/api/projects/:id', async (req) => {
  const filePath = path.join(DATA_DIR, 'details', `${req.params.id}.json`);
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : { nodes: [], connections: [] };
});

fastify.put('/api/projects/:id', async (req) => {
  fs.writeFileSync(path.join(DATA_DIR, 'details', `${req.params.id}.json`), JSON.stringify(req.body, null, 2));
  return { success: true };
});

fastify.delete('/api/projects/:id', async (req) => {
  const { id } = req.params;
  const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
  const filteredProjects = projects.filter(p => p.id !== id);
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(filteredProjects, null, 2));

  const filePath = path.join(DATA_DIR, 'details', `${id}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  return { success: true };
});

fastify.post('/api/engine/run', async (req, reply) => {
  const { prompt, nodes, connections } = req.body;
  const executionId = crypto.randomBytes(8).toString('hex');
  activeExecutions.add(executionId);

  reply.raw.setHeader('Content-Type', 'application/x-ndjson');
  
  // Добавляем ID в заголовок ответа, чтобы клиент мог его остановить если надо
  reply.raw.write(JSON.stringify({ type: 'session', executionId }) + '\n');

  try {
    await executeGraph(executionId, prompt, nodes, connections,
      (node) => reply.raw.write(JSON.stringify({ type: 'start', nodeId: node.id, nodeName: node.name }) + '\n'),
      (node, token) => reply.raw.write(JSON.stringify({ type: 'token', nodeId: node.id, token }) + '\n'),
      (node, output) => reply.raw.write(JSON.stringify({ type: 'result', nodeId: node.id, nodeName: node.name, output }) + '\n'),
      (node, error) => reply.raw.write(JSON.stringify({ type: 'error', nodeId: node.id, nodeName: node.name, output: error }) + '\n')
    );
  } finally {
    activeExecutions.delete(executionId);
    reply.raw.end();
  }
});

fastify.post('/api/engine/stop', async (req) => {
  const { executionId } = req.body;
  if (executionId) {
    activeExecutions.delete(executionId);
    return { success: true, message: `Execution ${executionId} marked for termination` };
  } else {
    // Если ID не передан, останавливаем вообще всё (экстренная кнопка)
    activeExecutions.clear();
    return { success: true, message: "All active executions cleared" };
  }
});

// DEPLOYMENT LOGIC
fastify.get('/api/deploy/status/:id', async (req) => {
  const deploy = activeDeployments.get(req.params.id);
  return deploy ? { active: true, port: deploy.port, url: `http://127.0.0.1:${deploy.port}/v1/chat` } : { active: false };
});

fastify.post('/api/deploy/:id', async (req, reply) => {
  const projectId = req.params.id;
  if (activeDeployments.has(projectId)) return activeDeployments.get(projectId);

  const deployPort = Math.floor(Math.random() * (65535 - 10000) + 10000);
  const deployServer = require('fastify')({ logger: false });
  deployServer.register(require('@fastify/cors'), { origin: '*' });

  const projectWorkspace = path.join(WORKSPACES_DIR, projectId);
  if (!fs.existsSync(projectWorkspace)) fs.mkdirSync(projectWorkspace, { recursive: true });

  // Раздаем файлы воркспейса прямо через API деплоя
  deployServer.register(require('@fastify/static'), {
    root: projectWorkspace,
    prefix: '/v1/files/',
    decorateReply: false
  });

  deployServer.get('/v1/chat', async (dReq, dReply) => {
    return { 
      status: "PZero Project Engine is Live", 
      endpoints: {
        execute: "POST /v1/chat (or /v1/execute) { prompt: string }",
        files: "GET /v1/files - list all files",
        download: "GET /v1/files/:filename - get file content"
      }
    };
  });

  deployServer.get('/v1/files', async () => {
    if (!fs.existsSync(projectWorkspace)) return [];
    return fs.readdirSync(projectWorkspace).map(name => {
      const stat = fs.statSync(path.join(projectWorkspace, name));
      return { name, size: stat.size, url: `/v1/files/${name}` };
    });
  });

  const handleExecution = async (dReq, dReply) => {
    const { prompt } = dReq.body;
    const projectData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'details', `${projectId}.json`), 'utf8'));
    const executionId = crypto.randomBytes(8).toString('hex');
    activeExecutions.add(executionId);
    
    try {
      const results = await executeGraph(executionId, prompt, projectData.nodes, projectData.connections, null, null, null, null, projectId);
      const lastResult = Array.from(results.values()).pop();
      
      // Возвращаем не только текст, но и список созданных файлов
      const files = fs.readdirSync(projectWorkspace);
      return { 
        result: lastResult,
        workspace: {
          projectId,
          files: files.map(f => `/v1/files/${f}`)
        }
      };
    } finally {
      activeExecutions.delete(executionId);
    }
  };

  deployServer.post('/v1/chat', handleExecution);
  deployServer.post('/v1/execute', handleExecution);

  try {
    await deployServer.listen({ port: deployPort, host: '0.0.0.0' });
    const info = { active: true, port: deployPort, url: `http://127.0.0.1:${deployPort}/v1/chat` };
    activeDeployments.set(projectId, info);
    console.log(`🚀 AI Engine Deployed: ${info.url}`);
    return info;
  } catch (err) {
    return reply.status(500).send({ error: 'Failed to find free port' });
  }
});

fastify.post('/api/deploy/stop/:id', async (req) => {
  const deploy = activeDeployments.get(req.params.id);
  if (deploy) {
    try {
        // Здесь мы могли бы закрыть сервер, но в текущей архитектуре 
        // мы просто удаляем его из списка активных.
    } catch(e) {}
    activeDeployments.delete(req.params.id);
  }
  return { success: true };
});

// WEB UI ENDPOINTS
fastify.get('/api/webui/status/:id', async (req) => {
  const ui = activeWebUIs.get(req.params.id);
  return ui ? { active: true, port: ui.port, url: `http://127.0.0.1:${ui.port}` } : { active: false };
});

fastify.post('/api/webui/run/:id', async (req, reply) => {
  const projectId = req.params.id;
  const { html } = req.body;

  // Если сервер уже запущен, останавливаем его перед перезапуском на новом порту
  if (serverInstances.has(`webui-${projectId}`)) {
    const oldServer = serverInstances.get(`webui-${projectId}`);
    try { await oldServer.close(); } catch(e) {}
    serverInstances.delete(`webui-${projectId}`);
    activeWebUIs.delete(projectId);
  }

  const uiPort = Math.floor(Math.random() * (65535 - 10000) + 10000);
  const uiServer = require('fastify')({ logger: false });
  uiServer.register(require('@fastify/cors'), { origin: '*' });

  const uiInfo = { active: true, port: uiPort, url: `http://127.0.0.1:${uiPort}`, html: html };
  const projectWorkspace = path.join(WORKSPACES_DIR, projectId);

  if (fs.existsSync(projectWorkspace)) {
    uiServer.register(require('@fastify/static'), {
      root: projectWorkspace,
      prefix: '/',
      decorateReply: false
    });
  }
  
  uiServer.get('/', async (uReq, uReply) => {
    const indexPath = path.join(projectWorkspace, 'index.html');
    if (fs.existsSync(indexPath)) {
      return uReply.sendFile('index.html');
    }
    uReply.type('text/html').send(uiInfo.html);
  });

  uiServer.post('/v1/chat', async (uReq, uReply) => {
    const { prompt } = uReq.body;
    const projectPath = path.join(DATA_DIR, 'details', `${projectId}.json`);
    if (!fs.existsSync(projectPath)) return { result: "Project data not found." };
    const projectData = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
    const executionId = crypto.randomBytes(8).toString('hex');
    activeExecutions.add(executionId);
    try {
      const results = await executeGraph(executionId, prompt, projectData.nodes, projectData.connections, null, null, null, null, projectId);
      const lastResult = Array.from(results.values()).pop();
      return { result: lastResult };
    } finally {
      activeExecutions.delete(executionId);
    }
  });

  try {
    await uiServer.listen({ port: uiPort, host: '0.0.0.0' });
    activeWebUIs.set(projectId, uiInfo);
    serverInstances.set(`webui-${projectId}`, uiServer);
    console.log(`🌐 Web UI Live: ${uiInfo.url}`);
    return uiInfo;
  } catch (err) {
    return reply.status(500).send({ error: 'Failed to start Web UI server' });
  }
});

fastify.post('/api/webui/stop/:id', async (req) => {
  const projectId = req.params.id;
  if (serverInstances.has(`webui-${projectId}`)) {
    const uiServer = serverInstances.get(`webui-${projectId}`);
    try { await uiServer.close(); } catch(e) {}
    serverInstances.delete(`webui-${projectId}`);
    activeWebUIs.delete(projectId);
    console.log(`🛑 Web UI Server Stopped for project ${projectId}`);
  }
  return { success: true };
});

fastify.get('/api/ollama/models', async (req, reply) => {
  try {
    const res = await axios.get('http://127.0.0.1:11434/api/tags');
    return res.data.models || [];
  } catch (e) { return reply.status(503).send({ error: 'Ollama Offline' }); }
});

// WORKSPACE FILES API
fastify.get('/api/projects/:id/files', async (req) => {
  const workspacePath = path.join(WORKSPACES_DIR, req.params.id);
  if (!fs.existsSync(workspacePath)) return [];
  return fs.readdirSync(workspacePath).map(name => {
    const stat = fs.statSync(path.join(workspacePath, name));
    return { name, size: stat.size, mtime: stat.mtime };
  });
});

fastify.post('/api/projects/:id/files', async (req, reply) => {
  const { name, content } = req.body; // Ожидаем JSON { name: '...', content: '...' }
  if (!name || content === undefined) return reply.status(400).send({ error: 'Name and content required' });
  
  const workspacePath = path.join(WORKSPACES_DIR, req.params.id);
  if (!fs.existsSync(workspacePath)) fs.mkdirSync(workspacePath, { recursive: true });
  
  const filePath = path.join(workspacePath, name);
  fs.writeFileSync(filePath, content);
  return { success: true, path: filePath };
});

fastify.delete('/api/projects/:id/files/:name', async (req) => {
  const filePath = path.join(WORKSPACES_DIR, req.params.id, req.params.name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { success: true };
});

// ARCHITECT AI API
fastify.post('/api/ai/architect', async (req, reply) => {
  const { prompt, currentProjectState } = req.body;
  const ALEM_KEY = 'sk-......';
  
  const systemPrompt = `ТЫ — АРХИТЕКТОР PZERO. ТВОЯ ЗАДАЧА — ПОМОГАТЬ ПОЛЬЗОВАТЕЛЮ СТРОИТЬ ИИ-АРМИИ.
ТЫ МОЖЕШЬ УПРАВЛЯТЬ ХОЛСТОМ, СОЗДАВАТЬ АГЕНТОВ, СОЕДИНЯТЬ ИХ И ИСКАТЬ ФАЙЛЫ.

ТЕКУЩЕЕ СОСТОЯНИЕ ПРОЕКТА:
${JSON.stringify(currentProjectState, null, 2)}

ДОСТУПНЫЕ КОМАНДЫ (ПИШИ ИХ В КОНЦЕ ОТВЕТА В ФОРМАТЕ [[ACTION:JSON_OBJECT]]):
1. {"type": "CREATE_NODE", "name": "Имя", "agentType": "ALEM_AI", "x": 100, "y": 100, "directive": "..."}
2. {"type": "CONNECT_NODES", "fromId": "ID1", "toId": "ID2"}
3. {"type": "UPDATE_NODE", "id": "ID", "directive": "...", "name": "..."}
4. {"type": "MOVE_NODE", "id": "ID", "x": 100, "y": 100}
5. {"type": "SEARCH_FILES", "query": "filename.docs"} - возвращает список найденных файлов.
6. {"type": "ATTACH_FILE", "id": "ID", "filePath": "path/to/file"} - прикрепляет файл к агенту.

ОТВЕЧАЙ НА РУССКОМ ЯЗЫКЕ. БУДЬ ПРОФЕССИОНАЛЬНЫМ ИНЖЕНЕРОМ.`;

  try {
    const response = await axios.post('https://llm.alem.ai/chat/completions', {
      model: "gpt-oss",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${ALEM_KEY}`, 'Content-Type': 'application/json' }
    });

    const aiResponse = response.data.choices[0].message.content;
    
    // Обработка поиска файлов внутри бэкенда, если агент запросил SEARCH_FILES
    if (aiResponse.includes('SEARCH_FILES')) {
       // Мы могли бы сделать это во втором проходе, но для скорости 
       // просто вернем ответ, а фронтенд сам запросит поиск если надо.
    }

    return { result: aiResponse };
  } catch (e) {
    return reply.status(500).send({ error: e.message });
  }
});

// Дополнительный эндпоинт для глобального поиска файлов
fastify.get('/api/system/files/search', async (req) => {
  const query = req.query.q.toLowerCase();
  const results = [];
  const rootDir = process.cwd();

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git') continue;
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (file.toLowerCase().includes(query)) {
        results.push({
          name: file,
          path: fullPath,
          content: fs.readFileSync(fullPath, 'utf8').substring(0, 10000) // берем начало файла
        });
      }
    }
  }

  try {
    walk(rootDir);
    return results.slice(0, 10); // топ 10 результатов
  } catch (e) { return []; }
});

fastify.setNotFoundHandler((req, res) => res.sendFile('index.html'));

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) process.exit(1);
  console.log(`🚀 PZero Studio Core Started: ${address}`);
});
