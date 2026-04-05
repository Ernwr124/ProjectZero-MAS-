export const Console = () => `
    <div id="console-panel" style="height: 200px;" class="absolute bottom-0 left-0 w-full bg-zinc-950 text-zinc-100 italic z-[200] transform translate-y-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-zinc-800">
        <!-- Resize Handle -->
        <div id="console-resizer" class="absolute -top-1 left-0 w-full h-2 cursor-ns-resize hover:bg-zinc-700 transition-colors z-[210]"></div>

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-2 border-b border-zinc-800 bg-zinc-900">
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <div id="status-pulse" class="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    <span id="status-text" class="text-[9px] font-black uppercase tracking-widest text-zinc-500">System_Idle</span>
                </div>
                <span id="console-status" class="text-[9px] font-bold mono text-zinc-500 uppercase tracking-widest">Port: Waiting...</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="window.app.killArmy()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-all text-zinc-500 hover:text-red-500 active:scale-90" title="Stop Process & Clear">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
                <button onclick="window.app.closeConsole()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all text-zinc-500 hover:text-white active:scale-90" title="Close Terminal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
        </div>

        <!-- Logs Area -->
        <div id="console-logs" class="flex-1 overflow-y-auto p-6 font-mono text-[10px] space-y-1 custom-scrollbar scroll-smooth">
            <div class="text-zinc-500">[SYSTEM]: Инициализация терминала...</div>
        </div>

        <!-- Input Area (Testing) -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center gap-4">
            <span class="text-zinc-500 mono text-xs font-black">IN_PROTO ></span>
            <input type="text" id="console-input" 
                   class="flex-1 bg-transparent outline-none border-none text-zinc-100 mono text-xs placeholder:text-zinc-700" 
                   placeholder="Отправить тестовую команду вашей армии..."
                   onkeydown="if(event.key==='Enter') window.app.sendTestCommand(this.value)">
        </div>
    </div>
`;
