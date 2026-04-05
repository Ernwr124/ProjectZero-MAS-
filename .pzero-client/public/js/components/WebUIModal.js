export const WebUIModal = (props = {}) => {
    const code = props.code || `<!DOCTYPE html>
<html>
<head>
    <style>
        body { background: #09090b; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #18181b; padding: 2rem; border-radius: 1rem; border: 1px solid #27272a; width: 400px; }
        input { width: 100%; background: #09090b; border: 1px solid #27272a; color: #fff; padding: 0.5rem; border-radius: 0.5rem; margin: 1rem 0; outline: none; }
        button { width: 100%; background: #fff; color: #000; border: none; padding: 0.75rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; }
        #output { margin-top: 1rem; font-size: 0.8rem; color: #a1a1aa; line-height: 1.4; }
    </style>
</head>
<body>
    <div class="card">
        <h2>AI Agent Interface</h2>
        <input type="text" id="prompt" placeholder="Ask something...">
        <button onclick="askAI()">Send Request</button>
        <div id="output">Response will appear here...</div>
    </div>

    <script>
        async function askAI() {
            const prompt = document.getElementById('prompt').value;
            const output = document.getElementById('output');
            output.innerText = 'Thinking...';
            
            try {
                const res = await fetch('/v1/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });
                const data = await res.json();
                output.innerText = data.result || 'No response';
            } catch (e) {
                output.innerText = 'Error: ' + e.message;
            }
        }
    </script>
</body>
</html>`;

    return `
    <div id="webui-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center hidden opacity-0 transition-all duration-500">
        <div id="webui-box" class="w-[90%] max-w-4xl h-[80vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl transform scale-95 opacity-0 transition-all duration-500">
            <!-- Header -->
            <div class="px-8 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                        <div class="flex items-center gap-2 group/tip relative">
                            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-zinc-100 italic">Web_Interface_Editor</h3>
                            <div class="w-3 h-3 rounded-full border border-zinc-700 flex items-center justify-center text-[7px] text-zinc-500 group-hover/tip:border-zinc-400 group-hover/tip:text-zinc-200 transition-colors cursor-help">i</div>
                            <div class="absolute top-full left-0 mt-2 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-[8px] text-zinc-300 leading-relaxed opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-[600] pointer-events-none shadow-2xl italic">
                                Создайте свой собственный UI для ИИ-агента. Вы можете использовать полный HTML/CSS/JS. Ваш API доступен по адресу <code class="text-emerald-400">/v1/chat</code> через метод POST.
                            </div>
                        </div>
                        <span class="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Custom_Frontend_Module</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div id="webui-status-bar" class="hidden flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mr-2">
                        <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span id="webui-url" class="text-[8px] font-bold text-emerald-400 mono cursor-pointer hover:underline"></span>
                    </div>
                    
                    <button id="webui-stop-btn" onclick="window.app.stopWebUI()" class="hidden px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                        Stop_Server
                    </button>

                    <button onclick="window.app.runWebUI()" class="px-6 py-2 bg-zinc-100 text-zinc-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-lg shadow-white/5">
                        Update_&_Run
                    </button>
                    <button onclick="window.app.hideWebUI()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <!-- Editor -->
            <div class="flex-1 relative flex">
                <div class="w-12 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-4">
                    <div class="text-[8px] font-black text-zinc-700 vertical-text uppercase tracking-widest">Source_Code</div>
                </div>
                <textarea id="webui-editor" class="flex-1 bg-transparent p-8 text-zinc-300 mono text-xs outline-none resize-none custom-scrollbar leading-relaxed" spellcheck="false" placeholder="Пишите ваш HTML здесь...">${code}</textarea>
            </div>

            <!-- Footer Info -->
            <div class="px-8 py-3 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between">
                <span class="text-[7px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Runtime: Project_Native</span>
                <span class="text-[7px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Status: Ready_to_Inject</span>
            </div>
        </div>
    </div>
    <style>
        .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); }
    </style>
    `;
};
