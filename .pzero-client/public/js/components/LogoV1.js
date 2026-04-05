export const Logo = () => `
    <div class="relative w-10 h-10 flex items-center justify-center group cursor-pointer">
        <!-- Внешний корпус -->
        <div class="absolute inset-0 bg-black rounded-xl rotate-0 group-hover:rotate-90 transition-all duration-500 ease-in-out"></div>
        <!-- Внутренний символ '0' -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10">
            <rect x="5" y="5" width="14" height="14" rx="4" stroke="white" stroke-width="3"/>
            <path d="M15 9L9 15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <div class="absolute inset-0 bg-black/20 rounded-xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
    </div>
`;
