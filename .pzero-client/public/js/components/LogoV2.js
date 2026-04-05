export const Logo = () => `
    <div class="relative w-11 h-11 flex items-center justify-center group cursor-pointer">
        <div class="absolute inset-0 rounded-2xl transition-all duration-300 group-hover:bg-zinc-50/50"></div>
        <div class="relative grid grid-cols-2 gap-1 rotate-0 group-hover:rotate-12 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <div class="w-4 h-4 rounded-full border-[2.5px] border-black transition-all group-hover:bg-black"></div>
            <div class="w-4 h-4 rounded-full bg-zinc-200 group-hover:bg-black group-hover:scale-90 transition-all duration-300"></div>
            <div class="w-4 h-4 rounded-full bg-zinc-200 group-hover:bg-black group-hover:scale-90 transition-all duration-300"></div>
            <div class="w-4 h-4 rounded-[4px] bg-black transition-all group-hover:rounded-full group-hover:scale-110"></div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="w-[1px] h-full bg-black/10 absolute rotate-45"></div>
                <div class="w-[1px] h-full bg-black/10 absolute -rotate-45"></div>
            </div>
        </div>
    </div>
`;
