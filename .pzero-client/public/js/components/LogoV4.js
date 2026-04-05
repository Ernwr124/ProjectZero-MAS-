export const Logo = () => `
    <div class="relative w-12 h-12 flex items-center justify-center group cursor-pointer select-none">
        <div class="absolute inset-0 bg-white border border-zinc-100 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-500"></div>
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10 transition-transform duration-500 group-hover:scale-95">
            <path d="M35 25 L85 25 L65 52 L48 52 L58 38 L35 38 Z" fill="black"/>
            <path d="M65 75 L15 75 L35 48 L52 48 L42 62 L65 62 Z" fill="black"/>
            <rect x="47" y="47" width="6" height="6" fill="white" class="group-hover:fill-zinc-50 transition-colors"/>
        </svg>
        <div class="absolute bottom-3 right-3 w-1 h-1 bg-black/10 group-hover:bg-red-500 rounded-full transition-colors duration-300"></div>
    </div>
`;
