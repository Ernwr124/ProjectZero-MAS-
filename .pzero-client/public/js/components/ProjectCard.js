export const ProjectCard = (p) => {
    const shortName = p.name.length > 15 ? p.name.substring(0, 15) + '..' : p.name;
    
    return `
    <div class="relative group h-full">
        <!-- Основная карточка -->
        <div onclick="window.app.navigateToProject('${p.id}')" 
             class="h-full p-6 rounded-[24px] bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-all duration-500 cursor-pointer group shadow-sm hover:shadow-xl italic overflow-hidden flex flex-col">
            
            <div class="absolute inset-0 opacity-[0.02] pointer-events-none" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 8px 8px;"></div>
            
            <div class="relative z-10 flex flex-col flex-1">
                <div class="flex items-center justify-between mb-8">
                    <div class="px-2 py-0.5 bg-zinc-900 rounded text-[7px] text-zinc-400 mono tracking-[0.2em] uppercase italic leading-none border border-zinc-700">Unit_ID_${p.id}</div>
                </div>
                
                <h3 class="text-2xl font-black tracking-tighter uppercase leading-tight italic text-zinc-100 mb-8 break-words group-hover:text-white transition-colors">
                    ${shortName}
                </h3>
                
                <div class="mt-auto flex items-center justify-between">
                    <div class="flex gap-1.5">
                        <div class="w-8 h-1 bg-zinc-700 rounded-full group-hover:bg-zinc-500 transition-all duration-700"></div>
                        <div class="w-2 h-1 bg-zinc-700 rounded-full group-hover:bg-zinc-600 transition-all duration-700"></div>
                    </div>
                    
                    <div class="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center group-hover:bg-zinc-600 group-hover:text-zinc-100 text-zinc-400 transition-all duration-500 shadow-sm">
                        <svg class="pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Кнопка удаления -->
        <button onclick="window.app.deleteProject('${p.id}', event)" 
                class="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900/80 backdrop-blur-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-md active:scale-90"
                title="Destroy Project">
            <svg class="pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        </button>
    </div>
`;
}