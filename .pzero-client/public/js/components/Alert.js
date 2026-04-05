export const Alert = (message, type = 'action') => `
    <div id="alertOverlay" class="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-[600] flex items-center justify-center p-4 italic animate-wind">
        <div class="w-full max-w-[320px] bg-white rounded-[24px] p-8 shadow-2xl border border-zinc-100 relative overflow-hidden">
            <div class="absolute inset-0 opacity-[0.02] pointer-events-none" style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 6px 6px;"></div>
            
            <div class="relative z-10 flex flex-col items-center text-center">
                <div class="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
                    ${type === 'input' ? 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' : 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
                    }
                </div>
                
                <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">System_Request</h3>
                <p class="text-sm font-black text-zinc-800 leading-tight mb-6 uppercase tracking-tight">
                    ${message}
                </p>

                ${type === 'input' ? `
                    <div class="w-full relative mb-8">
                        <span class="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 mono text-lg font-black">></span>
                        <input type="text" id="alertInput" autofocus class="w-full bg-transparent border-b-2 border-zinc-100 focus:border-black py-2 pl-6 text-sm italic font-bold outline-none transition-all">
                    </div>
                ` : '<div class="mb-2"></div>'}
                
                <div class="flex gap-2 w-full">
                    <button onclick="window.app.resolveConfirm(null)" class="flex-1 py-3 rounded-xl border border-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 transition-all">
                        Abort
                    </button>
                    <button onclick="window.app.resolveConfirm(${type === 'input' ? "document.getElementById('alertInput').value" : "true"})" class="flex-1 py-3 rounded-xl bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black shadow-lg shadow-black/10 transition-all active:scale-95">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    </div>
`;
