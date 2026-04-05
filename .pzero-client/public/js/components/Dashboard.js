export const DashboardHeader = () => `
    <header class="mb-16 animate-wind relative">
        <div class="flex items-center gap-3 mb-6 relative z-10">
            <span class="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[8px] font-black rounded uppercase tracking-widest leading-none shadow-sm border border-zinc-700">System_v1.0</span>
            <div class="h-[1px] w-12 bg-zinc-700"></div>
        </div>
        
        <h1 class="text-5xl sm:text-7xl font-black tracking-tighter mb-6 uppercase italic leading-[0.9] text-zinc-100 relative z-10">
            Army <span class="text-zinc-600">/ Command</span>
        </h1>
        
        <p class="text-zinc-400 max-w-sm text-[11px] font-bold uppercase tracking-widest mono leading-relaxed relative z-10">
            [Status: Online] Ваши автономные ИИ-армии в одном месте.
        </p>
    </header>
`;

export const DashboardAction = () => `
    <div class="flex flex-wrap items-center gap-12 w-full mt-16 animate-wind" style="animation-delay: 0.2s; opacity: 0;">
        <button onclick="window.app.showModal()" class="group flex items-center gap-6 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-x-2">
            <div class="w-12 h-12 rounded-[20px] bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:bg-zinc-700 group-hover:border-zinc-600 group-hover:text-zinc-100 transition-all duration-700 shadow-sm group-hover:shadow-xl group-hover:rotate-12 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
            <div class="flex flex-col items-start italic leading-none">
                <span class="font-black text-zinc-500 group-hover:text-zinc-400 transition-colors duration-700 uppercase tracking-widest text-[8px]">Initialize_New_Mission</span>
                <span class="font-black text-zinc-300 group-hover:text-zinc-100 transition-colors duration-700 uppercase tracking-tight text-xs mt-1">Создать новую армию</span>
            </div>
        </button>

        <div class="w-[1px] h-8 bg-zinc-800 hidden sm:block"></div>

        <button onclick="document.getElementById('import-project-input').click()" class="group flex items-center gap-6 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-x-2">
            <div class="w-12 h-12 rounded-[20px] bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-zinc-800 group-hover:border-zinc-700 group-hover:text-zinc-100 transition-all duration-700 shadow-sm group-hover:shadow-xl group-hover:-rotate-12 text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </div>
            <div class="flex flex-col items-start italic leading-none">
                <span class="font-black text-zinc-600 group-hover:text-zinc-500 transition-colors duration-700 uppercase tracking-widest text-[8px]">Upload_Existing_Core</span>
                <span class="font-black text-zinc-400 group-hover:text-zinc-200 transition-colors duration-700 uppercase tracking-tight text-xs mt-1">Импортировать проект</span>
            </div>
        </button>
        <input type="file" id="import-project-input" class="hidden" accept=".json" onchange="window.app.importProject(this)">
    </div>
`;