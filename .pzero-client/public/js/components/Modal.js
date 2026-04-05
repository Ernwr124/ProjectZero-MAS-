export const Modal = () => `
    <div id="modalOverlay" class="fixed inset-0 w-full h-full bg-zinc-900/40 backdrop-blur-md z-[500] hidden grid place-items-center p-4 italic transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] opacity-0">
        <!-- Контейнер для окна, чтобы grid мог его центрировать -->
        <div class="w-full max-w-sm bg-white rounded-[32px] p-10 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform scale-95 opacity-0 relative overflow-hidden" id="modal-box">
            
            <!-- Subtle Grid Background -->
            <div class="absolute inset-0 opacity-[0.02] pointer-events-none" style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 8px 8px;"></div>
            
            <!-- Decorative Corners -->
            <div class="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-black/5 rounded-tl-sm"></div>
            <div class="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-black/5 rounded-tr-sm"></div>
            <div class="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-black/5 rounded-bl-sm"></div>
            <div class="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-black/5 rounded-br-sm"></div>

            <div class="relative z-10 flex flex-col items-center text-center w-full">
                <div class="mb-10 w-full flex flex-col items-center">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-[7px] font-black bg-zinc-100 px-1.5 py-0.5 rounded mono uppercase tracking-widest text-zinc-400">Step_01</span>
                        <span class="text-[7px] font-black text-zinc-300 mono uppercase tracking-widest">Init_Sequence</span>
                    </div>
                    <h2 class="text-3xl font-black uppercase tracking-tight italic leading-none text-zinc-800">New_Squad</h2>
                </div>
                
                <div class="mb-10 w-full flex flex-col items-center">
                    <label class="text-[8px] text-zinc-400 uppercase font-black tracking-[0.2em] block mb-4 mono italic">Designation_Code_Name</label>
                    <div class="relative w-full max-w-[240px] flex items-center justify-center">
                        <span class="absolute left-0 text-zinc-300 mono text-lg font-black">></span>
                        <input type="text" id="projectNameInput" autofocus 
                               onkeydown="if(event.key==='Enter') window.app.createProject()"
                               class="w-full bg-transparent border-b-2 border-zinc-100 focus:border-black py-3 text-center text-xl italic uppercase font-black tracking-tighter transition-all outline-none text-zinc-800 placeholder:text-zinc-200" 
                               placeholder="SQUAD_ALPHA">
                    </div>
                    <p class="text-[7px] text-zinc-300 uppercase font-bold mt-4 tracking-widest mono italic leading-relaxed max-w-[200px]">
                        [Caution]: Имя станет идентификатором системы.
                    </p>
                </div>
                
                <div class="flex gap-3 w-full">
                    <button onclick="window.app.hideModal()" 
                            class="flex-[0.4] px-4 py-4 rounded-2xl border border-zinc-100 text-zinc-400 font-bold hover:bg-zinc-50 transition-all uppercase text-[8px] tracking-widest italic shadow-sm hover:shadow-md active:scale-95">
                        Abort
                    </button>
                    <button onclick="window.app.createProject()" 
                            class="flex-1 px-4 py-4 rounded-2xl bg-zinc-900 text-white font-black hover:bg-black transition-all uppercase text-[8px] tracking-[0.2em] italic shadow-xl shadow-black/10 active:scale-95">
                        Deploy_Core
                    </button>
                </div>
            </div>
        </div>
    </div>
`;
