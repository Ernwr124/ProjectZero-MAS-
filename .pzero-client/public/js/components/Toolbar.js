export const Toolbar = (props = {}) => {
    const isDeployed = props.deployActive || false;
    const deployUrl = props.deployUrl || '';

    return `
    <div class="flex items-center gap-2 p-1.5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl z-[100] animate-wind" style="animation-delay: 0.4s; opacity: 0;">
        <!-- New Agent Button -->
        <button onclick="window.app.addAgentNode()" class="px-4 h-10 flex items-center gap-2 rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white transition-all duration-300 group shadow-lg shadow-white/5 border border-zinc-200" title="Add New Agent">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span class="font-black text-[9px] uppercase tracking-widest leading-none mt-0.5">New_Agent</span>
        </button>

        <div class="w-[1px] h-6 bg-zinc-800 mx-1"></div>

        <!-- Deploy Engine Button -->
        <div class="flex items-center gap-2">
            ${isDeployed ? `
                <div class="flex items-center gap-3 px-4 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span class="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Engine_Live</span>
                    </div>
                    <div class="h-3 w-[1px] bg-emerald-500/20"></div>
                    <code class="text-[8px] font-bold text-emerald-400 mono cursor-pointer hover:underline" onclick="window.app.copyToClipboard('${deployUrl}')">${deployUrl}</code>
                    <button onclick="window.app.stopDeployment()" class="text-zinc-500 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
            ` : `
                <button onclick="window.app.startDeployment()" class="group flex items-center gap-2.5 px-4 h-10 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-zinc-500 transition-all text-zinc-400 hover:text-zinc-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <span class="text-[9px] font-black uppercase tracking-widest leading-none mt-0.5">Deploy_as_API</span>
                </button>
            `}
        </div>

        <div class="w-[1px] h-6 bg-zinc-800 mx-1"></div>

        <!-- HTML UI Button -->
        <div class="flex items-center gap-1 group/tip relative">
            <button onclick="window.app.showWebUI()" class="px-4 h-10 flex items-center gap-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13l2 2-2 2"></path><path d="M12 17h2"></path></svg>
                <span class="font-black text-[9px] uppercase tracking-widest leading-none mt-0.5">HTML_UI</span>
            </button>
            <div class="w-3 h-3 rounded-full border border-zinc-700 flex items-center justify-center text-[7px] text-zinc-500 hover:border-zinc-400 hover:text-zinc-200 transition-colors cursor-help absolute -top-1 -right-1 bg-zinc-900">i</div>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-[7px] text-zinc-300 leading-relaxed opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-[200] pointer-events-none shadow-xl italic text-center">
                Создайте и запустите собственный веб-интерфейс для вашей армии агентов.
            </div>
        </div>

        <div class="w-[1px] h-6 bg-zinc-800 mx-1"></div>

        <!-- Download Project Button -->
        <button onclick="window.app.downloadProject()" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-all text-zinc-500 hover:text-zinc-100" title="Download Project JSON">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>

        <div class="w-[1px] h-6 bg-zinc-800 mx-1"></div>

        <!-- Exit Button -->
        <button onclick="window.app.goHome()" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-all text-zinc-500 hover:text-white" title="Exit Studio">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
    </div>
`;
};
