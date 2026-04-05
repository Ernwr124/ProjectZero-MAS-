export const Logo = () => `
    <div class="relative w-10 h-10 flex items-center justify-center group cursor-pointer">
        <div class="absolute inset-0 border border-black/5 rounded-lg group-hover:border-black/20 transition-colors"></div>
        <div class="relative w-6 h-6">
            <svg class="absolute inset-0 w-full h-full overflow-visible">
                <line x1="0" y1="0" x2="24" y2="0" stroke="black" stroke-width="1.5" stroke-dasharray="0" class="group-hover:stroke-zinc-200 transition-all duration-500"/>
                <line x1="0" y1="24" x2="24" y2="24" stroke="black" stroke-width="1.5" stroke-dasharray="0" class="group-hover:stroke-zinc-200 transition-all duration-500"/>
                <line x1="0" y1="0" x2="0" y2="24" stroke="black" stroke-width="1.5" stroke-dasharray="0" class="group-hover:stroke-zinc-200 transition-all duration-500"/>
                <line x1="24" y1="0" x2="24" y2="24" stroke="black" stroke-width="1.5" stroke-dasharray="0" class="group-hover:stroke-zinc-200 transition-all duration-500"/>
            </svg>
            <div class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-black rounded-full group-hover:bg-black transition-colors duration-300"></div>
            <div class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-black rounded-full group-hover:scale-125 transition-transform duration-300"></div>
            <div class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-black rounded-full group-hover:rotate-45 group-hover:rounded-sm transition-all duration-300"></div>
            <div class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-black rounded-full group-hover:bg-red-500 transition-colors duration-300 shadow-[0_0_10px_rgba(0,0,0,0.1)]"></div>
        </div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <span class="text-[10px] font-black mono text-zinc-400">0</span>
        </div>
    </div>
`;
