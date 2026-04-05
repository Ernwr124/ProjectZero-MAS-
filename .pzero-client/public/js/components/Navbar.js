import { Logo } from './Logo.js';

export const Navbar = (props) => {
    const isArmy = props.view === 'army';
    
    return `
        <nav class="h-14 flex items-center justify-between px-6 lg:px-10 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-[200]">
            <!-- Breadcrumbs & Logo -->
            <div class="flex items-center">
                <div onclick="window.app.goHome()" class="mr-6 py-1 border-r border-zinc-800 pr-6 flex cursor-pointer hover:opacity-70 transition-opacity">
                    ${Logo()}
                </div>
                
                <div class="flex items-center overflow-x-auto no-scrollbar py-2">
                    <span class="breadcrumb-item text-zinc-500">PROJECTZERO</span>
                    <span class="breadcrumb-separator text-zinc-700">/</span>
                    <span class="breadcrumb-item text-zinc-500">AI_AGENTS</span>
                    <span class="breadcrumb-separator text-zinc-700">/</span>
                    <span class="breadcrumb-item breadcrumb-active text-zinc-100">${isArmy ? props.projectName : 'LIST'}</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3 ml-4">
                ${isArmy ? `
                    <button id="architect-toggle-nav" class="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-500/5 group" title="ИИ Архитектор">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </button>
                    <button onclick="window.app.runArmy()" class="flex px-4 py-2 bg-zinc-100 text-zinc-900 text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-white transition-all items-center gap-2 shadow-lg shadow-white/5">
                        Run
                    </button>
                    <button onclick="window.app.goHome()" class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all text-zinc-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                ` : `
                    <button onclick="window.app.showModal()" class="px-5 py-2 bg-zinc-100 text-zinc-900 text-[9px] font-black rounded-xl uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg shadow-white/5">
                        Initialize
                    </button>
                `}
            </div>
        </nav>
    `;
};
