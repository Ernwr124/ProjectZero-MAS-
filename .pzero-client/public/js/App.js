import { AgentLogos } from './components/LogoSelector.js';
import { AgentNode } from './components/AgentCard.js';
import { ConnectionManager } from './engine/ConnectionManager.js';
import { Navbar } from './components/Navbar.js';
import { ProjectCard } from './components/ProjectCard.js';
import { Modal } from './components/Modal.js';
import { Inspector } from './components/Inspector.js';
import { DashboardHeader, DashboardAction } from './components/Dashboard.js';
import { Toolbar } from './components/Toolbar.js';
import { Alert } from './components/Alert.js';
import { Console } from './components/Console.js';
import { WebUIModal } from './components/WebUIModal.js';
import { ArchitectUI } from './components/Architect.js';

export class App {
    constructor() {
        this.dashboard = document.getElementById('view-dashboard');
        this.army = document.getElementById('view-army');
        this.currentProjectId = null;
        this.nodes = [];
        this.connections = null;
        this.currentNode = null;
        this.zoomLevel = 1;
        this.canvasPos = { x: 0, y: 0 };
        this.isPanning = false;
        this.selectedNodes = new Set();
        this.confirmResolver = null;
        this.deployInfo = { active: false, url: '' };
        this.webUIInfo = { active: false, url: '', code: '' };

        this.renderStaticComponents();
        this.init();
        this.setupCanvasControls();
        this.setupKeyboardControls();
        this.setupConsoleResize();
        this.setupEventListeners();
        this.setupArchitect();

        setInterval(() => { if (this.currentProjectId) this.saveProject(); }, 30000);
    }

    setupArchitect() {
        const chat = document.getElementById('architect-chat');
        const sendBtn = document.getElementById('architect-send');
        const input = document.getElementById('architect-input');

        // Глобальный обработчик для новой кнопки в Navbar (она создается динамически при смене роута)
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#architect-toggle-nav');
            if (btn && chat) {
                chat.classList.toggle('-translate-x-full');
                if (!chat.classList.contains('-translate-x-full')) input?.focus();
            }
        });
        
        const sendMessage = async () => {
            const val = input.value.trim();
            if (!val) return;
            
            this.addArchitectMessage('user', val);
            input.value = '';

            try {
                const projectState = {
                    nodes: this.nodes.map(n => ({ id: n.id, name: n.name, type: n.type, x: n.x, y: n.y })),
                    connections: this.connections ? this.connections.connections.map(c => ({ fromId: c.from.id, toId: c.to.id })) : []
                };

                const res = await fetch('/api/ai/architect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: val, currentProjectState: projectState })
                });
                const data = await res.json();
                
                this.addArchitectMessage('ai', data.result);
                this.parseArchitectActions(data.result);
            } catch (e) {
                this.addArchitectMessage('ai', 'Ошибка связи с ядром Архитектора.');
            }
        };

        if (sendBtn) sendBtn.onclick = sendMessage;
        if (input) input.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(); };
    }

    addArchitectMessage(role, text) {
        const container = document.getElementById('architect-messages');
        if (!container) return;
        
        const msg = document.createElement('div');
        msg.className = role === 'user' ? 'text-zinc-300 bg-zinc-800/50 p-3 rounded-xl ml-8' : 'text-emerald-400 bg-emerald-950/20 p-3 rounded-xl mr-8 border border-emerald-900/30';
        msg.innerHTML = marked.parse(text.replace(/\[\[ACTION:[\s\S]*?\]\]/g, ''));
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    async parseArchitectActions(text) {
        const regex = /\[\[ACTION:([\s\S]*?)\]\]/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            try {
                const action = JSON.parse(match[1].trim());
                await this.executeArchitectAction(action);
            } catch (e) { console.error('Failed to parse AI Action', e); }
        }
    }

    async executeArchitectAction(action) {
        console.log('Executing AI Action:', action);
        switch (action.type) {
            case 'CREATE_NODE':
                const newNode = new AgentNode(null, { 
                    name: action.name || 'New Agent', 
                    x: action.x || 100, 
                    y: action.y || 100,
                    type: action.agentType || 'ALEM_AI',
                    directive: action.directive || ''
                });
                this.nodes.push(newNode);
                const canvas = document.getElementById('army-canvas');
                if (canvas) {
                    canvas.appendChild(newNode.render((n) => this.openInspector(n), () => { if(this.connections) this.connections.draw(); this.saveProject(); }, (e, n, pt) => this.onPortMouseDown(e, n, pt)));
                    // Эффект появления
                    newNode.element.style.opacity = '0';
                    newNode.element.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        newNode.element.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        newNode.element.style.opacity = '1';
                        newNode.element.style.transform = 'scale(1)';
                    }, 50);
                }
                break;

            case 'CONNECT_NODES':
                const from = this.nodes.find(n => n.id === action.fromId);
                const to = this.nodes.find(n => n.id === action.toId);
                if (from && to && this.connections) {
                    this.connections.addConnection(from, to);
                }
                break;

            case 'UPDATE_NODE':
                const node = this.nodes.find(n => n.id === action.id);
                if (node) {
                    if (action.name) {
                        node.name = action.name;
                        const label = node.element.querySelector('.node-name-text');
                        if (label) label.innerText = action.name;
                    }
                    if (action.directive) node.directive = action.directive;
                    if (this.currentNode && this.currentNode.id === node.id) this.openInspector(node);
                }
                break;

            case 'MOVE_NODE':
                const mNode = this.nodes.find(n => n.id === action.id);
                if (mNode) {
                    mNode.x = action.x; mNode.y = action.y;
                    mNode.element.style.left = `${action.x}px`;
                    mNode.element.style.top = `${action.y}px`;
                    if (this.connections) this.connections.draw();
                }
                break;

            case 'SEARCH_FILES':
                const res = await fetch(`/api/system/files/search?q=${encodeURIComponent(action.query)}`);
                const files = await res.json();
                if (files.length > 0) {
                    const fileList = files.map(f => `- ${f.name} (путь: ${f.path})`).join('\n');
                    this.addArchitectMessage('ai', `Я нашел следующие файлы на вашем устройстве:\n${fileList}\n\nКакой из них мне подключить?`);
                } else {
                    this.addArchitectMessage('ai', `К сожалению, я не нашел файлов по запросу "${action.query}".`);
                }
                break;

            case 'ATTACH_FILE':
                const targetNode = this.nodes.find(n => n.id === action.id);
                if (targetNode) {
                    const fRes = await fetch(`/api/system/files/search?q=${encodeURIComponent(action.filePath)}`);
                    const fData = await fRes.json();
                    const file = fData.find(f => f.path === action.filePath || f.name === action.filePath);
                    if (file) {
                        if (!targetNode.context) targetNode.context = [];
                        targetNode.context.push({ type: 'file', name: file.name, content: file.content });
                        if (this.currentNode && this.currentNode.id === targetNode.id) this.renderContextList();
                        this.addArchitectMessage('ai', `Файл **${file.name}** успешно подключен к агенту **${targetNode.name}**.`);
                    }
                }
                break;
        }
        this.saveProject();
    }

    setupEventListeners() {
        // Подключаемся к SSE бродкастам от сервера для синхронизации анимаций
        this.eventSource = new EventSource('/api/events');
        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const node = this.nodes.find(n => n.id === data.nodeId);
                if (!node) return;

                if (data.type === 'start') {
                    node.element.classList.add('is-working');
                } else if (data.type === 'result' || data.type === 'error') {
                    node.element.classList.remove('is-working');
                }
            } catch (e) {}
        };
    }

    renderStaticComponents() {
        const overlay = document.getElementById('overlay-container');
        if (overlay) overlay.innerHTML = Modal() + '<div id="alert-container"></div>' + WebUIModal() + ArchitectUI();
        
        const dashContent = document.getElementById('dashboard-content');
        if (dashContent) {
            dashContent.innerHTML = DashboardHeader() + DashboardAction() + '<div id="projects-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-wind mt-12" style="animation-delay: 0.1s; opacity: 0;"></div>';
        }

        const insContainer = document.getElementById('inspector-container');
        if (insContainer) insContainer.innerHTML = Inspector();

        const consoleWrap = document.getElementById('console-wrapper');
        if (consoleWrap) consoleWrap.innerHTML = Console();
    }

    async startDeployment() {
        if (!this.currentProjectId) return;
        try {
            const res = await fetch(`/api/deploy/${this.currentProjectId}`, { method: 'POST' });
            const data = await res.json();
            this.deployInfo = { active: true, url: data.url };
            this.updateToolbar();
            this.addLog('SYSTEM', `ДВИЖОК РАЗВЕРНУТ: ${data.url}`, 'text-emerald-400');
        } catch (e) {
            this.addLog('CRITICAL', 'Ошибка при развертывании движка.', 'text-red-500');
        }
    }

    async stopDeployment() {
        if (!this.currentProjectId) return;
        await fetch(`/api/deploy/stop/${this.currentProjectId}`, { method: 'POST' });
        this.deployInfo = { active: false, url: '' };
        this.updateToolbar();
        this.addLog('SYSTEM', 'ДВИЖОК ОСТАНОВЛЕН.', 'text-zinc-500');
    }

    async updateDeploymentStatus() {
        if (!this.currentProjectId) return;
        const res = await fetch(`/api/deploy/status/${this.currentProjectId}`);
        const data = await res.json();
        this.deployInfo = { active: data.active, url: data.url || '' };
        this.updateToolbar();
    }

    showWebUI() {
        const overlay = document.getElementById('webui-overlay');
        const box = document.getElementById('webui-box');
        const editor = document.getElementById('webui-editor');
        if (!overlay || !box) return;
        
        if (editor && this.webUIInfo.code) {
            editor.value = this.webUIInfo.code;
        }

        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('opacity-100');
            overlay.classList.remove('opacity-0');
            box.classList.add('scale-100', 'opacity-100');
            box.classList.remove('scale-95', 'opacity-0');
        }, 10);
        this.updateWebUIStatus();
    }

    hideWebUI() {
        const overlay = document.getElementById('webui-overlay');
        const box = document.getElementById('webui-box');
        const editor = document.getElementById('webui-editor');
        if (!overlay || !box) return;

        if (editor) this.webUIInfo.code = editor.value;

        overlay.classList.add('opacity-0');
        overlay.classList.remove('opacity-100');
        box.classList.add('scale-95', 'opacity-0');
        box.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => { overlay.classList.add('hidden'); }, 500);
        this.saveProject();
    }

    async runWebUI() {
        if (!this.currentProjectId) return;
        const editor = document.getElementById('webui-editor');
        const code = editor ? editor.value : this.webUIInfo.code;
        this.webUIInfo.code = code;

        try {
            const res = await fetch(`/api/webui/run/${this.currentProjectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: code })
            });
            const data = await res.json();
            this.webUIInfo.active = true;
            this.webUIInfo.url = data.url;
            this.updateWebUIStatus();
            this.addLog('SYSTEM', `WEB UI ОБНОВЛЕН: ${data.url}`, 'text-emerald-400');
        } catch (e) {
            this.addLog('CRITICAL', 'Ошибка при обновлении WEB UI.', 'text-red-500');
        }
    }

    async stopWebUI() {
        if (!this.currentProjectId) return;
        try {
            await fetch(`/api/webui/stop/${this.currentProjectId}`, { method: 'POST' });
            this.webUIInfo.active = false;
            this.webUIInfo.url = '';
            this.updateWebUIStatus();
            this.addLog('SYSTEM', 'WEB UI СЕРВЕР ОСТАНОВЛЕН.', 'text-zinc-500');
        } catch (e) {}
    }

    async updateWebUIStatus() {
        if (!this.currentProjectId) return;
        try {
            const res = await fetch(`/api/webui/status/${this.currentProjectId}`);
            const data = await res.json();
            const bar = document.getElementById('webui-status-bar');
            const link = document.getElementById('webui-url');
            const stopBtn = document.getElementById('webui-stop-btn');

            if (data.active) {
                this.webUIInfo.active = true;
                this.webUIInfo.url = data.url;
                if (bar) bar.classList.remove('hidden');
                if (stopBtn) stopBtn.classList.remove('hidden');
                if (link) {
                    link.innerText = data.url;
                    link.onclick = () => window.open(data.url, '_blank');
                }
            } else {
                this.webUIInfo.active = false;
                if (bar) bar.classList.add('hidden');
                if (stopBtn) stopBtn.classList.add('hidden');
            }
        } catch (e) {}
    }

    updateToolbar() {
        const toolbarWrap = document.querySelector('.toolbar-container');
        if (toolbarWrap) {
            toolbarWrap.innerHTML = Toolbar({ deployActive: this.deployInfo.active, deployUrl: this.deployInfo.url });
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        this.addLog('SYSTEM', 'URL скопирован в буфер обмена.', 'text-emerald-400');
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', async (e) => {
            if (e.key === 'Escape') { 
                // Esc теперь просто снимает выбор с агента, но не закрывает панель
                this.nodes.forEach(n => n.element.classList.remove('selected'));
                this.currentNode = null;
            }
            
            if (e.key === 'Backspace') {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                const toDelete = this.selectedNodes.size > 0 ? Array.from(this.selectedNodes) : (this.currentNode ? [this.currentNode] : []);
                if (toDelete.length > 0) {
                    toDelete.forEach(node => {
                        const idx = this.nodes.indexOf(node);
                        if (idx > -1) {
                            if (this.connections) this.connections.connections = this.connections.connections.filter(c => c.from !== node && c.to !== node);
                            node.element.remove();
                            this.nodes.splice(idx, 1);
                        }
                    });
                    if (this.connections) this.connections.draw();
                    this.selectedNodes.clear();
                    this.currentNode = null;
                    this.saveProject();
                }
            }

            if (e.key === 'Enter' && document.activeElement.id === 'console-input') {
                this.sendTestCommand(document.activeElement.value);
            }
        });
    }

    setupCanvasControls() {
        const armyView = document.getElementById('view-army');
        if (!armyView) return;

        const selectionBox = document.createElement('div');
        selectionBox.id = 'selection-box';
        armyView.appendChild(selectionBox);

        armyView.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = -e.deltaY * 0.0015;
                const newZoom = Math.min(Math.max(this.zoomLevel + delta, 0.1), 5);
                const rect = armyView.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const canvasX = (mouseX - this.canvasPos.x) / this.zoomLevel;
                const canvasY = (mouseY - this.canvasPos.y) / this.zoomLevel;
                this.zoomLevel = newZoom;
                this.canvasPos.x = mouseX - canvasX * this.zoomLevel;
                this.canvasPos.y = mouseY - canvasY * this.zoomLevel;
                this.updateCanvasTransform();
            }
        }, { passive: false });

        armyView.addEventListener('mousedown', (e) => {
            if (e.target !== armyView && e.target.id !== 'army-canvas') return;
            
            if (e.ctrlKey || e.button === 1) {
                this.isPanning = true;
                this.startPanMouse = { x: e.clientX, y: e.clientY };
                this.startPanPos = { ...this.canvasPos };
                armyView.style.cursor = 'grabbing';
            } else if (e.button === 0) {
                this.isSelecting = true;
                this.selectionStart = { x: e.clientX, y: e.clientY };
                selectionBox.style.display = 'block';
                if (!e.shiftKey) {
                    this.selectedNodes.forEach(n => n.element.classList.remove('selected'));
                    this.selectedNodes.clear();
                    this.currentNode = null;
                }
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.startPanMouse.x;
                const dy = e.clientY - this.startPanMouse.y;
                this.canvasPos.x = this.startPanPos.x + dx;
                this.canvasPos.y = this.startPanPos.y + dy;
                this.updateCanvasTransform();
            } else if (this.isSelecting) {
                const rect = armyView.getBoundingClientRect();
                const curX = e.clientX; const curY = e.clientY;
                const left = Math.min(this.selectionStart.x, curX); const top = Math.min(this.selectionStart.y, curY);
                const width = Math.abs(this.selectionStart.x - curX); const height = Math.abs(this.selectionStart.y - curY);
                selectionBox.style.left = `${left - rect.left}px`; selectionBox.style.top = `${top - rect.top}px`;
                selectionBox.style.width = `${width}px`; selectionBox.style.height = `${height}px`;
                this.nodes.forEach(node => {
                    const nRect = node.element.getBoundingClientRect();
                    const isInside = (nRect.left < Math.max(this.selectionStart.x, curX) && nRect.right > Math.min(this.selectionStart.x, curX) && nRect.top < Math.max(this.selectionStart.y, curY) && nRect.bottom > Math.min(this.selectionStart.y, curY));
                    if (isInside) { node.element.classList.add('selected'); this.selectedNodes.add(node); }
                    else if (!e.shiftKey) { node.element.classList.remove('selected'); this.selectedNodes.delete(node); }
                });
            }
        });

        window.addEventListener('mouseup', () => {
            this.isPanning = false; this.isSelecting = false;
            selectionBox.style.display = 'none';
            if (armyView) armyView.style.cursor = 'grab';
        });
    }

    updateCanvasTransform() {
        const canvas = document.getElementById('army-canvas');
        if (canvas) canvas.style.transform = `translate(${this.canvasPos.x}px, ${this.canvasPos.y}px) scale(${this.zoomLevel})`;
    }

    init() {
        window.onpopstate = () => this.handleRoute();
        this.handleRoute();
        this.setupInspectorEvents();
    }

    setupInspectorEvents() {
        const inputs = [
            { id: 'node-name', field: 'name' }, 
            { id: 'node-type', field: 'type' }, 
            { id: 'node-directive', field: 'directive' }, 
            { id: 'node-model', field: 'model' }, 
            { id: 'alem-task', field: 'alemTask' }, 
            { id: 'alem-model', field: 'alemModel' }, 
            { id: 'alem-key', field: 'alemKey' },
            { id: 'node-temp', field: 'temperature' },
            { id: 'node-topp', field: 'top_p' },
            { id: 'node-max-tokens', field: 'max_tokens' }
        ];
        inputs.forEach(inp => {
            const el = document.getElementById(inp.id);
            if (el) {
                el.addEventListener('input', (e) => {
                    if (this.currentNode) {
                        let val = e.target.value;
                        if (inp.id === 'node-temp' || inp.id === 'node-topp') val = parseFloat(val);
                        if (inp.id === 'node-max-tokens') val = parseInt(val) || 2048;

                        this.currentNode[inp.field] = val;

                        if (inp.id === 'node-temp') document.getElementById('val-temp').innerText = val.toFixed(1);
                        if (inp.id === 'node-topp') document.getElementById('val-topp').innerText = val.toFixed(2);

                        if (inp.id === 'node-name') {
                            const newName = e.target.value || 'Agent';
                            this.currentNode.name = newName;
                            const label = this.currentNode.element.querySelector('.node-name-text');
                            if (label) label.innerText = newName;
                        }
                        if (inp.id === 'node-type') this.updateDynamicInspector();
                        this.saveProject();
                    }
                });
            }
        });
    }

    onIconChange(key) {
        if (!this.currentNode) return;
        this.currentNode.icon = key;
        const iconLabel = this.currentNode.element.querySelector('.node-icon-label');
        if (iconLabel) {
            iconLabel.innerHTML = AgentLogos[key] || AgentLogos['bot'];
        }
        
        // Update UI buttons in inspector
        document.querySelectorAll('.icon-btn').forEach(btn => {
            if (btn.dataset.icon === key) {
                btn.classList.add('border-zinc-300', 'bg-zinc-800', 'text-zinc-100');
                btn.classList.remove('border-zinc-800', 'bg-zinc-900', 'text-zinc-400');
            } else {
                btn.classList.remove('border-zinc-300', 'bg-zinc-800', 'text-zinc-100');
                btn.classList.add('border-zinc-800', 'bg-zinc-900', 'text-zinc-400');
            }
        });
        
        this.saveProject();
    }

    onNodeTypeChange() {
        if (!this.currentNode) return;
        this.currentNode.type = document.getElementById('node-type').value;
        this.updateDynamicInspector();
        this.saveProject();
    }

    async updateDynamicInspector() {
        const ollamaSec = document.getElementById('ollama-config');
        const alemSec = document.getElementById('alem-config');
        if (!ollamaSec || !alemSec) return;
        ollamaSec.classList.add('hidden'); alemSec.classList.add('hidden');
        if (this.currentNode.type === 'OLLAMA') {
            ollamaSec.classList.remove('hidden'); await this.checkOllamaStatus();
        } else if (this.currentNode.type === 'ALEM_AI') {
            alemSec.classList.remove('hidden');
            document.getElementById('alem-task').value = this.currentNode.alemTask || 'LLM';
            document.getElementById('alem-model').value = this.currentNode.alemModel || 'gpt-oss';
            document.getElementById('alem-key').value = this.currentNode.alemKey || '';
        }
        this.renderContextList();
    }

    renderContextList() {
        const list = document.getElementById('context-list');
        if (!list || !this.currentNode) return;
        const context = this.currentNode.context || [];
        list.innerHTML = context.map((item, index) => `
            <div class="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-800 rounded-lg group/item shadow-sm">
                <span class="text-[8px] font-bold mono truncate text-zinc-500 uppercase flex-1 mr-2">${item.name}</span>
                <button onclick="window.app.removeContextItem(${index})" class="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all text-xs">&times;</button>
            </div>
        `).join('');
    }

    removeContextItem(index) {
        if (!this.currentNode || !this.currentNode.context) return;
        this.currentNode.context.splice(index, 1);
        this.renderContextList();
        this.saveProject();
    }

    async addContextLink() {
        if (!this.currentNode) return;
        const url = await this.askConfirmation('Введите URL-адрес для базы знаний:', 'input');
        if (url && url.trim().length > 0) {
            let cleanUrl = url.trim();
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                cleanUrl = 'https://' + cleanUrl;
            }
            if (!this.currentNode.context) this.currentNode.context = [];
            const name = cleanUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('?')[0];
            this.currentNode.context.push({ type: 'link', name: name, url: cleanUrl });
            this.renderContextList();
            this.saveProject();
        }
    }

    handleFileContext(input) {
        if (!input.files || !input.files[0] || !this.currentNode) return;
        const file = input.files[0];
        const reader = new FileReader();
        const processFile = (content) => {
            if (!this.currentNode.context) this.currentNode.context = [];
            this.currentNode.context.push({ type: 'file', name: file.name, content: content });
            this.renderContextList(); this.saveProject();
        };
        if (file.name.endsWith('.docx')) {
            reader.onload = async (e) => {
                const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
                processFile(result.value);
            };
            reader.readAsArrayBuffer(file);
        } else if (file.name.endsWith('.pdf')) {
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const strings = content.items.map(item => item.str);
                        text += strings.join(' ') + '\n';
                    }
                    processFile(text);
                } catch (err) {
                    console.error('PDF parsing error', err);
                    processFile('[Ошибка чтения PDF файла]');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            reader.onload = (e) => processFile(e.target.result);
            reader.readAsText(file);
        }
        input.value = '';
    }

    async checkOllamaStatus() {
        const statusDiv = document.getElementById('ollama-status');
        const modelSec = document.getElementById('ollama-model-section');
        try {
            const res = await fetch('/api/ollama/models');
            const models = await res.json();
            if (statusDiv) statusDiv.innerHTML = `<span class="text-[7px] font-black uppercase text-emerald-600">Online</span>`;
            if (modelSec) modelSec.classList.remove('hidden');
            const mSelect = document.getElementById('node-model');
            if (mSelect) {
                mSelect.innerHTML = models.map(m => `<option value="${m.name}" ${this.currentNode.model === m.name ? 'selected' : ''}>${m.name.toUpperCase()}</option>`).join('');
                if (!this.currentNode.model && models.length > 0) this.currentNode.model = models[0].name;
            }
        } catch (err) {
            if (statusDiv) statusDiv.innerHTML = `<span class="text-[7px] font-black uppercase text-red-600">Offline</span>`;
            if (modelSec) modelSec.classList.add('hidden');
        }
    }

    processStreamLine(line) {
        try {
            const data = JSON.parse(line);
            const node = this.nodes.find(n => n.id === data.nodeId);
            
            if (data.type === 'start') {
                if (node) node.element.classList.add('is-working');
                const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
                const logs = document.getElementById('console-logs');
                if (logs) {
                    const logDiv = document.createElement('div');
                    logDiv.className = 'text-blue-400 mono mb-3 animate-wind p-3 bg-white/5 rounded-xl border border-white/5';
                    logDiv.innerHTML = `<div class="text-[8px] opacity-50 mb-1 tracking-widest">${time} | AGENT_CORE: ${data.nodeName.toUpperCase()}</div><div class="streaming-content italic text-zinc-300"></div>`;
                    logs.appendChild(logDiv);
                    logs.scrollTop = logs.scrollHeight;
                    this.currentStreamingLog = logDiv.querySelector('.streaming-content');
                }
            } else if (data.type === 'token') {
                if (this.currentStreamingLog) {
                    this.currentStreamingLog.innerText += data.token;
                    const logs = document.getElementById('console-logs');
                    if (logs && (logs.scrollHeight - logs.scrollTop < 150)) logs.scrollTop = logs.scrollHeight;
                }
            } else if (data.type === 'result' || data.type === 'error') {
                if (node) node.element.classList.remove('is-working');
                if (this.currentStreamingLog) {
                    if (data.type === 'result') {
                        this.currentStreamingLog.classList.remove('italic', 'text-zinc-500', 'text-zinc-300');
                        this.currentStreamingLog.innerHTML = `<div class="markdown-body text-zinc-100">${marked.parse(data.output)}</div>`;
                    } else {
                        this.currentStreamingLog.innerHTML = `<span class="text-red-500 font-bold">${data.output}</span>`;
                    }
                }
                const logs = document.getElementById('console-logs');
                if (logs) logs.scrollTop = logs.scrollHeight;
                this.currentStreamingLog = null;
            }
        } catch (e) { console.warn("Failed to parse stream line:", line); }
    }

    renderLayout(view, projectName = '') {
        const container = document.getElementById('nav-container');
        if (container) container.innerHTML = Navbar({ view, projectName });
        
        const insContainer = document.getElementById('inspector-container');
        if (insContainer) {
            if (view === 'army') insContainer.classList.remove('hidden');
            else insContainer.classList.add('hidden');
        }
    }

    async handleRoute() {
        const path = window.location.pathname.replace(/^\/|\/$/g, '');
        if (path === '' || path === 'index.html') this.showDashboard(); else this.showArmy(path);
    }

    async showDashboard() {
        this.renderLayout('dashboard');
        if(this.dashboard) this.dashboard.classList.remove('hidden');
        if(this.army) this.army.classList.add('hidden');
        this.currentProjectId = null;
        try {
            const res = await fetch('/api/projects');
            const projects = await res.json();
            const list = document.getElementById('projects-list');
            if (list) list.innerHTML = projects.map(p => ProjectCard(p)).join('');
        } catch(e) { console.error(e); }
    }

    async showArmy(id) {
        this.currentProjectId = id;
        if(this.dashboard) this.dashboard.classList.add('hidden');
        if(this.army) this.army.classList.remove('hidden');
        this.zoomLevel = 1; this.canvasPos = { x: 0, y: 0 }; this.updateCanvasTransform();
        
        const regRes = await fetch('/api/projects');
        const projects = await regRes.json();
        const projectMeta = projects.find(p => p.id === id);
        if (!projectMeta) return this.goHome();
        this.renderLayout('army', projectMeta.name);

        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        const canvas = document.getElementById('army-canvas');
        if (canvas) {
            canvas.innerHTML = '';
            const toolbarWrap = document.createElement('div');
            toolbarWrap.className = 'toolbar-container';
            this.army.appendChild(toolbarWrap);
            this.updateDeploymentStatus();
            this.updateWebUIStatus();

            this.webUIInfo.code = data.webUI || '';

            this.connections = new ConnectionManager('army-canvas');
            this.nodes = [];
            if (data.nodes) {
                data.nodes.forEach(nData => {
                    const node = new AgentNode(nData.id, nData);
                    node.model = nData.model || '';
                    node.alemTask = nData.alemTask || 'LLM';
                    node.alemModel = nData.alemModel || 'gpt-oss';
                    node.alemKey = nData.alemKey || '';
                    node.icon = nData.icon || 'bot';
                    node.context = nData.context || [];
                    node.temperature = nData.temperature ?? 0.7;
                    node.top_p = nData.top_p ?? 0.9;
                    node.max_tokens = nData.max_tokens ?? 2048;
                    this.nodes.push(node);
                    canvas.appendChild(node.render((n) => this.openInspector(n), () => { if(this.connections) this.connections.draw(); this.saveProject(); }, (e, n, pt) => this.onPortMouseDown(e, n, pt)));
                });
            }
            if (data.connections) {
                setTimeout(() => {
                    data.connections.forEach(conn => {
                        const from = this.nodes.find(n => n.id === conn.fromId);
                        const to = this.nodes.find(n => n.id === conn.toId);
                        if (from && to && this.connections) this.connections.addConnection(from, to);
                    });
                }, 100);
            }
        }
    }

    async saveProject() {
        if (!this.currentProjectId) return;
        const nodesData = this.nodes.map(n => ({
            id: n.id, name: n.name, x: n.x, y: n.y, type: n.type, directive: n.directive,
            model: n.model || '', alemTask: n.alemTask || 'LLM', 
            alemModel: n.alemModel || 'gpt-oss', alemKey: n.alemKey || '',
            icon: n.icon || 'bot', context: n.context || [],
            temperature: n.temperature, top_p: n.top_p, max_tokens: n.max_tokens
        }));
        const connectionsData = this.connections ? this.connections.connections.map(c => ({ fromId: c.from.id, toId: c.to.id })) : [];
        const webUI = this.webUIInfo.code;

        try {
            await fetch(`/api/projects/${this.currentProjectId}`, { 
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nodes: nodesData, connections: connectionsData, webUI }) 
            });
        } catch (e) {}
    }

    async downloadProject() {
        if (!this.currentProjectId) return;
        try {
            const res = await fetch(`/api/projects/${this.currentProjectId}`);
            const data = await res.json();
            
            // Получаем метаданные (имя проекта)
            const projectsRes = await fetch('/api/projects');
            const projects = await projectsRes.json();
            const projectMeta = projects.find(p => p.id === this.currentProjectId);
            
            const exportData = {
                name: projectMeta ? projectMeta.name : 'Exported Army',
                nodes: data.nodes || [],
                connections: data.connections || [],
                webUI: data.webUI || ''
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportData.name.replace(/\s+/g, '_')}_pzero.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.addLog('SYSTEM', 'ПРОЕКТ ЭКСПОРТИРОВАН В JSON.', 'text-emerald-400');
        } catch (e) {
            console.error(e);
            this.addLog('CRITICAL', 'Ошибка при экспорте проекта.', 'text-red-500');
        }
    }

    async importProject(input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const projectData = JSON.parse(e.target.result);
                const res = await fetch('/api/projects/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectData)
                });
                const newProject = await res.json();
                this.showDashboard();
                this.addLog('SYSTEM', `ПРОЕКТ "${newProject.name}" ИМПОРТИРОВАН.`, 'text-emerald-400');
            } catch (err) {
                console.error(err);
                alert('Ошибка при импорте: неверный формат JSON');
            }
        };
        reader.readAsText(file);
        input.value = '';
    }

    onPortMouseDown(e, node, portType) {
        if (portType !== 'out') {
            // Если кликнули по входному порту, даем возможность удалять связи при клике (опционально)
            // Но мы уберем авто-удаление, чтобы можно было вешать много связей
            return;
        }
        
        const armyView = document.getElementById('view-army');
        const rect = armyView.getBoundingClientRect();
        const startPos = node.getPortPos('out');

        const onMouseMove = (moveEvent) => {
            const tx = (moveEvent.clientX - rect.left - this.canvasPos.x) / this.zoomLevel;
            const ty = (moveEvent.clientY - rect.top - this.canvasPos.y) / this.zoomLevel;
            if (this.connections) this.connections.updateTempLine(startPos, { x: tx, y: ty });
        };

        const onMouseUp = (upEvent) => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (this.connections) this.connections.clearTempLine();

            let closestPort = null;
            let minDistance = 30;
            const allPorts = document.querySelectorAll('.port[data-port-type="in"]');
            allPorts.forEach(portEl => {
                const pRect = portEl.getBoundingClientRect();
                const px = pRect.left + pRect.width / 2;
                const py = pRect.top + pRect.height / 2;
                const dist = Math.hypot(upEvent.clientX - px, upEvent.clientY - py);
                if (dist < minDistance) { minDistance = dist; closestPort = portEl; }
            });

            if (closestPort) {
                const targetNode = this.nodes.find(n => n.id === closestPort.dataset.nodeId);
                if (targetNode && targetNode !== node && this.connections) {
                    // Проверяем, нет ли уже такой связи, чтобы не дублировать
                    const exists = this.connections.connections.some(c => c.from.id === node.id && c.to.id === targetNode.id);
                    if (!exists) {
                        this.connections.addConnection(node, targetNode);
                        this.saveProject();
                    }
                }
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    addAgentNode() {
        const agentCount = this.nodes.length + 1;
        const node = new AgentNode(null, { name: `AGENT ${agentCount}` });
        this.nodes.push(node);
        const canvas = document.getElementById('army-canvas');
        if (canvas) {
            canvas.appendChild(node.render((n) => this.openInspector(n), () => { if(this.connections) this.connections.draw(); this.saveProject(); }, (e, n, pt) => this.onPortMouseDown(e, n, pt)));
            this.saveProject();
        }
    }

    async deleteProject(id, event) {
        if (event) event.stopPropagation();
        const confirmed = await this.askConfirmation('Вы действительно хотите уничтожить этот проект?');
        if (confirmed) {
            try {
                await fetch(`/api/projects/${id}`, { method: 'DELETE' });
                this.showDashboard();
            } catch (err) { console.error('Ошибка удаления:', err); }
        }
    }

    navigateToProject(id) { window.history.pushState({}, '', '/' + id + '/'); this.handleRoute(); }
    goHome() { window.history.pushState({}, '', '/'); this.handleRoute(); }
    
    showModal() { 
        const modal = document.getElementById('modalOverlay');
        const box = document.getElementById('modal-box');
        if (!modal || !box) return;
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('opacity-100');
            modal.classList.remove('opacity-0');
            box.classList.add('scale-100', 'opacity-100');
            box.classList.remove('scale-95', 'opacity-0');
            document.getElementById('projectNameInput').value = '';
            document.getElementById('projectNameInput').focus();
        }, 10);
    }

    hideModal() { 
        const modal = document.getElementById('modalOverlay');
        const box = document.getElementById('modal-box');
        if (!modal || !box) return;
        modal.classList.add('opacity-0');
        modal.classList.remove('opacity-100');
        box.classList.add('scale-95', 'opacity-0');
        box.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => { modal.classList.add('hidden'); }, 500);
    }
    async createProject() {
        const name = document.getElementById('projectNameInput').value;
        await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
        this.hideModal(); this.showDashboard();
    }

    openInspector(node) {
        this.nodes.forEach(n => n.element.classList.remove('selected'));
        this.selectedNodes.clear();
        this.currentNode = node;
        node.element.classList.add('selected');
        document.getElementById('node-name').value = node.name || '';
        document.getElementById('node-type').value = node.type || 'OLLAMA';
        document.getElementById('node-directive').value = node.directive || '';
        
        document.getElementById('node-temp').value = node.temperature ?? 0.7;
        document.getElementById('val-temp').innerText = (node.temperature ?? 0.7).toFixed(1);
        document.getElementById('node-topp').value = node.top_p ?? 0.9;
        document.getElementById('val-topp').innerText = (node.top_p ?? 0.9).toFixed(2);
        document.getElementById('node-max-tokens').value = node.max_tokens ?? 2048;

        // Highlight active icon
        const activeIcon = node.icon || 'bot';
        document.querySelectorAll('.icon-btn').forEach(btn => {
            if (btn.dataset.icon === activeIcon) {
                btn.classList.add('border-zinc-300', 'bg-zinc-800', 'text-zinc-100');
                btn.classList.remove('border-zinc-800', 'bg-zinc-900', 'text-zinc-400');
            } else {
                btn.classList.remove('border-zinc-300', 'bg-zinc-800', 'text-zinc-100');
                btn.classList.add('border-zinc-800', 'bg-zinc-900', 'text-zinc-400');
            }
        });
        
        this.updateDynamicInspector();
    }

    closeInspector() {
        if (this.currentNode) this.currentNode.element.classList.remove('selected');
        this.currentNode = null;
    }

    setupConsoleResize() {
        window.addEventListener('mousedown', (e) => {
            if (e.target.id === 'console-resizer') {
                this.isResizingConsole = true;
                this.startY = e.clientY;
                const panel = document.getElementById('console-panel');
                if (panel) {
                    this.startHeight = parseInt(panel.style.height) || 200;
                    document.body.style.cursor = 'ns-resize';
                }
            }
        });
        window.addEventListener('mousemove', (e) => {
            if (!this.isResizingConsole) return;
            const deltaY = this.startY - e.clientY;
            const newHeight = Math.min(Math.max(this.startHeight + deltaY, 100), window.innerHeight * 0.8);
            const panel = document.getElementById('console-panel');
            if (panel) panel.style.height = `${newHeight}px`;
        });
        window.addEventListener('mouseup', () => { this.isResizingConsole = false; document.body.style.cursor = 'default'; });
    }

    async sendTestCommand(val) {
        if (!val || !val.trim()) return;
        this.addLog('USER', val, 'text-zinc-100');
        const input = document.getElementById('console-input');
        if (input) input.value = '';
        
        // Создаем новый AbortController для возможности отмены запроса
        this.abortController = new AbortController();
        this.currentExecutionId = null;

        try {
            const payload = {
                prompt: val,
                nodes: this.nodes.map(n => ({
                    id: n.id, name: n.name, type: n.type, model: n.model, 
                    alemTask: n.alemTask, alemModel: n.alemModel || 'gpt-oss',
                    alemKey: n.alemKey, directive: n.directive, context: n.context || [],
                    temperature: n.temperature ?? 0.7, top_p: n.top_p ?? 0.9, max_tokens: n.max_tokens ?? 2048
                })),
                connections: this.connections ? this.connections.connections.map(c => ({ fromId: c.from.id, toId: c.to.id })) : []
            };

            const res = await fetch('/api/engine/run', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload),
                signal: this.abortController.signal
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    if (buffer.trim()) this.processStreamLine(buffer);
                    break;
                }
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.trim()) {
                        // Первым делом ищем ID сессии для возможности отмены
                        if (line.includes('"type":"session"')) {
                            const sessionData = JSON.parse(line);
                            this.currentExecutionId = sessionData.executionId;
                        }
                        this.processStreamLine(line);
                    }
                }
            }
        } catch (err) { 
            if (err.name === 'AbortError') {
                this.addLog('SYSTEM', 'Процесс прерван пользователем.', 'text-zinc-500');
            } else {
                console.error(err);
                this.addLog('CRITICAL', 'Сбой связи с ядром.', 'text-red-500'); 
            }
            this.nodes.forEach(n => n.element.classList.remove('is-working'));
        } finally {
            this.abortController = null;
            this.currentExecutionId = null;
        }
    }

    runArmy() {
        const panel = document.getElementById('console-panel');
        if (panel) panel.classList.remove('translate-y-full');
        const text = document.getElementById('status-text');
        if (text) text.innerText = 'System_Active';
        const pulse = document.getElementById('status-pulse');
        if (pulse) pulse.classList.replace('bg-zinc-600', 'bg-emerald-500');
        this.addLog('SYSTEM', 'АРМИЯ ГОТОВА К ПРИЕМУ КОМАНД.', 'text-emerald-400');
    }

    async killArmy() {
        // 1. Останавливаем сетевой запрос на фронте
        if (this.abortController) {
            this.abortController.abort();
        }

        // 2. Посылаем сигнал на бэкенд для жесткой остановки циклов
        if (this.currentExecutionId) {
            try {
                await fetch('/api/engine/stop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ executionId: this.currentExecutionId })
                });
            } catch (e) { console.error("Failed to stop backend execution", e); }
        } else {
            // Если ID нет, пробуем остановить всё
            fetch('/api/engine/stop', { method: 'POST' }).catch(() => {});
        }

        // 3. Убираем анимацию работы у всех нод
        this.nodes.forEach(n => n.element.classList.remove('selected', 'is-working'));

        // 4. Очищаем логи терминала
        const logs = document.getElementById('console-logs');
        if (logs) logs.innerHTML = '<div class="text-zinc-500">[SYSTEM]: Процессы принудительно остановлены. Память очищена.</div>';

        // 5. Обновляем статус
        const text = document.getElementById('status-text');
        if (text) text.innerText = 'System_Idle';
        const pulse = document.getElementById('status-pulse');
        if (pulse) pulse.classList.replace('bg-emerald-500', 'bg-zinc-600');
        
        this.currentExecutionId = null;
    }

    closeConsole() {
        const panel = document.getElementById('console-panel');
        if (panel) panel.classList.add('translate-y-full');
    }

    async askConfirmation(message, type = 'action') {
        const container = document.getElementById('alert-container');
        if (!container) return false;
        container.innerHTML = Alert(message, type);
        return new Promise((resolve) => { this.confirmResolver = resolve; });
    }

    resolveConfirm(result) {
        const container = document.getElementById('alert-container');
        if (container) container.innerHTML = '';
        if (this.confirmResolver) { this.confirmResolver(result); this.confirmResolver = null; }
    }

    addLog(source, message, colorClass = 'text-zinc-400') {
        const logs = document.getElementById('console-logs');
        if (!logs) return;
        const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
        const isAgent = !['SYSTEM', 'NETWORK', 'USER', 'CRITICAL'].includes(source);
        const formatted = isAgent ? `<div class="markdown-body mt-2">${marked.parse(message)}</div>` : message;
        logs.innerHTML += `<div class="${colorClass} mono mb-1 animate-wind">[${time}] [${source}]: ${formatted}</div>`;
        logs.scrollTop = logs.scrollHeight;
    }
}
