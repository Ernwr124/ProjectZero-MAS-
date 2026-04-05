export const Logo = () => `
    <div onclick="window.app.downloadLogo()" class="relative w-11 h-11 flex items-center justify-center group cursor-pointer" title="Download PNG">
        <div class="absolute inset-0 rounded-2xl transition-all duration-500 ease-out group-hover:bg-zinc-950 border border-transparent group-hover:border-zinc-800 group-hover:shadow-[0_0_15px_rgba(39,39,42,0.5)] z-0"></div>
        
        <div id="main-logo-svg" class="relative grid grid-cols-2 gap-1 rotate-0 group-hover:rotate-[15deg] transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10">
            
            <div class="w-4 h-4 rounded-full border-[2.5px] border-zinc-200 transition-all duration-300 group-hover:border-[3px] group-hover:border-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.7)] delay-[50ms]"></div>
            
            <div class="w-4 h-4 rounded-full bg-zinc-600 group-hover:bg-zinc-300 transition-all duration-300 group-hover:scale-90 group-hover:shadow-[0_0_6px_rgba(212,212,216,0.6)] delay-[100ms]"></div>
            
            <div class="w-4 h-4 rounded-full bg-zinc-600 group-hover:bg-zinc-300 transition-all duration-300 group-hover:scale-90 group-hover:shadow-[0_0_6px_rgba(212,212,216,0.6)] delay-[150ms]"></div>
            
            <div class="w-4 h-4 rounded-[4px] bg-zinc-200 transition-all duration-300 group-hover:rounded-full group-hover:bg-white group-hover:scale-110 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.9)] delay-[200ms]"></div>

            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div class="w-[1px] h-full bg-white/30 absolute rotate-45 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out delay-[300ms]"></div>
                <div class="w-[1px] h-full bg-white/30 absolute -rotate-45 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out delay-[350ms]"></div>
                
                <div class="absolute w-1 h-1 bg-white rounded-full opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 delay-[400ms] shadow-[0_0_12px_rgba(255,255,255,1)]"></div>
            </div>
        </div>
    </div>
`;
