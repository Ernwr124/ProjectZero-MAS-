export const ArchitectUI = () => `
<div id="architect-chat" class="fixed top-16 left-0 w-[400px] h-[calc(100vh-64px)] bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800 shadow-2xl flex flex-col overflow-hidden z-[1000] -translate-x-full transition-transform duration-500 ease-in-out">
    <div class="p-6 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="p-2 bg-emerald-500/10 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            </div>
            <div>
                <span class="text-sm font-bold tracking-tight text-zinc-100 block">PZero Architect</span>
                <span class="text-[10px] text-emerald-500 uppercase tracking-widest font-black">Neural Core Online</span>
            </div>
        </div>
        <button onclick="document.getElementById('architect-chat').classList.add('-translate-x-full')" class="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all">&times;</button>
    </div>
    
    <div id="architect-messages" class="flex-1 overflow-y-auto p-6 space-y-6 text-sm font-normal leading-relaxed custom-scrollbar">
        <div class="flex gap-4">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div class="text-zinc-400 py-1 italic">Привет! Я твой ИИ-архитектор. Опиши армию агентов, которую хочешь создать, или просто попроси найти нужный файл на устройстве.</div>
        </div>
    </div>
    
    <div class="p-6 bg-zinc-900/20 border-t border-zinc-800">
        <div class="relative group">
            <input id="architect-input" type="text" placeholder="Команда Архитектору..." 
                   class="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all pr-14 shadow-inner">
            <button id="architect-send" class="absolute right-3 top-2.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
        </div>
        <div class="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button onclick="document.getElementById('architect-input').value='Создай армию для анализа текста'; document.getElementById('architect-send').click()" class="shrink-0 px-3 py-1.5 rounded-full border border-zinc-800 text-[10px] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all">#АнализТекста</button>
            <button onclick="document.getElementById('architect-input').value='Найди файл и подключи к агенту'; document.getElementById('architect-send').click()" class="shrink-0 px-3 py-1.5 rounded-full border border-zinc-800 text-[10px] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all">#ПоискФайлов</button>
        </div>
    </div>
</div>
`;
