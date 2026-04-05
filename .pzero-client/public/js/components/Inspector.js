import { AgentLogos } from './LogoSelector.js';

export const Inspector = () => `
    <aside id="inspector" class="h-full w-full p-8 flex flex-col italic bg-zinc-950">
        <div class="flex items-center justify-between mb-10">
            <div class="flex flex-col">
                <h3 class="text-2xl font-black italic uppercase tracking-tighter leading-none text-zinc-100">Params</h3>
                <span class="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Config_Module</span>
            </div>
        </div>
        
        <div class="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2 pb-6">
            <!-- Identity & Compute -->
            <div class="space-y-6">
                <div>
                    <label class="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-2 mono italic">Name_Tag</label>
                    <input type="text" id="node-name" maxlength="12" class="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-400 py-2 outline-none font-bold italic uppercase text-md text-zinc-100 placeholder:text-zinc-700">
                </div>

                <div>
                    <label class="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-2 mono italic">Agent_Icon</label>
                    <div class="grid grid-cols-6 gap-2">
                        ${Object.keys(AgentLogos).map(key => `
                            <button onclick="window.app.onIconChange('${key}')" class="icon-btn w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-all" data-icon="${key}">
                                ${AgentLogos[key]}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <label class="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-2 mono italic">Core_Src</label>
                    <select id="node-type" onchange="window.app.onNodeTypeChange()" class="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-400 py-2 outline-none font-bold uppercase mono text-[10px] text-zinc-100 cursor-pointer">
                        <option value="OLLAMA" class="bg-zinc-900">LOCAL:OLLAMA</option>
                        <option value="ALEM_AI" class="bg-zinc-900">CLOUD:ALEM_AI</option>
                    </select>
                </div>
            </div>

            <!-- Dynamic Sections (Ollama / Alem) -->
            <div id="ollama-config" class="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-4 hidden">
                <div class="flex items-center justify-between">
                    <span class="text-[7px] font-black uppercase text-zinc-500 tracking-widest">Local_Host</span>
                    <div id="ollama-status" class="flex items-center gap-1.5">
                        <div class="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse"></div>
                        <span class="text-[7px] font-bold uppercase text-zinc-500">Checking...</span>
                    </div>
                </div>
                <div id="ollama-model-section" class="hidden pt-2 border-t border-zinc-800">
                    <label class="text-[7px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Available_Models</label>
                    <select id="node-model" class="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg p-2 outline-none font-bold mono text-[9px] uppercase cursor-pointer">
                        <option value="">Select_Model</option>
                    </select>
                </div>
            </div>

            <div id="alem-config" class="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-4 hidden animate-wind">
                <div class="flex items-center justify-between">
                    <span class="text-[7px] font-black uppercase text-zinc-500 tracking-widest">Alem_Cloud</span>
                    <a href="https://plus.alem.ai/services" target="_blank" class="text-[7px] font-black uppercase text-blue-400 hover:underline">Get_Keys_↗</a>
                </div>
                <div class="space-y-3">
                    <div class="space-y-1">
                        <label class="text-[6px] text-zinc-500 uppercase font-black">Service_Type</label>
                        <select id="alem-task" class="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg p-2 font-bold mono text-[9px] uppercase cursor-pointer">
                            <option value="LLM" class="bg-zinc-900">Text_Intelligence (LLM)</option>
                            <option value="IMAGE" class="bg-zinc-900">Visual_Synthesis (Text-to-Image)</option>
                        </select>
                        <div id="alem-task-hint" class="text-[6.5px] text-emerald-500/80 uppercase font-black mono mt-1.5 hidden animate-wind tracking-widest">[Max Output: 720x720 px]</div>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[6px] text-zinc-500 uppercase font-black">Model_Name</label>
                        <input type="text" id="alem-model" class="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg p-2 font-bold mono text-[9px]" placeholder="gpt-oss">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[6px] text-zinc-500 uppercase font-black">API_Token</label>
                        <input type="password" id="alem-key" class="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg p-2 font-bold mono text-[9px]" placeholder="sk-alem-...">
                    </div>
                </div>
            </div>

            <!-- CONTEXT SECTION -->
            <div class="pt-4 border-t border-zinc-800">
                <label class="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-4 mono italic">Compute_Params</label>
                
                <div class="space-y-4 px-1">
                    <!-- Temperature -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-1.5 group/tip relative">
                                <label class="text-[7px] text-zinc-400 uppercase font-bold tracking-wider cursor-help">Temperature</label>
                                <div class="w-2.5 h-2.5 rounded-full border border-zinc-700 flex items-center justify-center text-[6px] text-zinc-500 group-hover/tip:border-zinc-400 group-hover/tip:text-zinc-200 transition-colors">i</div>
                                <div class="absolute bottom-full left-0 mb-2 w-40 p-2 bg-zinc-800 border border-zinc-700 rounded text-[7px] text-zinc-300 leading-relaxed opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 pointer-events-none shadow-xl italic">
                                    Контроль случайности. 0.1 — строгий и точный, 0.9 — творческий и непредсказуемый.
                                </div>
                            </div>
                            <span id="val-temp" class="text-[8px] mono font-bold text-zinc-500">0.7</span>
                        </div>
                        <input type="range" id="node-temp" min="0" max="1.5" step="0.1" value="0.7" class="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500">
                    </div>

                    <!-- Top P -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-1.5 group/tip relative">
                                <label class="text-[7px] text-zinc-400 uppercase font-bold tracking-wider cursor-help">Top_P sampling</label>
                                <div class="w-2.5 h-2.5 rounded-full border border-zinc-700 flex items-center justify-center text-[6px] text-zinc-500 group-hover/tip:border-zinc-400 group-hover/tip:text-zinc-200 transition-colors">i</div>
                                <div class="absolute bottom-full left-0 mb-2 w-40 p-2 bg-zinc-800 border border-zinc-700 rounded text-[7px] text-zinc-300 leading-relaxed opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 pointer-events-none shadow-xl italic">
                                    Вероятностный порог выборки слов. Помогает избежать слишком редких слов.
                                </div>
                            </div>
                            <span id="val-topp" class="text-[8px] mono font-bold text-zinc-500">0.9</span>
                        </div>
                        <input type="range" id="node-topp" min="0" max="1" step="0.05" value="0.9" class="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500">
                    </div>

                    <!-- Max Tokens -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-1.5 group/tip relative">
                                <label class="text-[7px] text-zinc-400 uppercase font-bold tracking-wider cursor-help">Max_Limit</label>
                                <div class="w-2.5 h-2.5 rounded-full border border-zinc-700 flex items-center justify-center text-[6px] text-zinc-500 group-hover/tip:border-zinc-400 group-hover/tip:text-zinc-200 transition-colors">i</div>
                                <div class="absolute bottom-full left-0 mb-2 w-40 p-2 bg-zinc-800 border border-zinc-700 rounded text-[7px] text-zinc-300 leading-relaxed opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 pointer-events-none shadow-xl italic">
                                    Максимальная длина ответа в токенах.
                                </div>
                            </div>
                            <input type="number" id="node-max-tokens" value="2048" class="bg-transparent border-b border-zinc-800 text-[8px] mono text-zinc-100 outline-none w-12 text-right focus:border-zinc-500">
                        </div>
                    </div>
                </div>
            </div>

            <!-- CONTEXT SECTION -->
            <div class="pt-4 border-t border-zinc-800">
                <label class="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-4 mono italic">Knowledge_Context</label>
                
                <div class="flex gap-2 mb-4">
                    <button onclick="document.getElementById('file-upload').click()" class="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl hover:border-zinc-500 transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        <span class="text-[8px] font-black uppercase tracking-widest">File</span>
                    </button>
                    <button onclick="window.app.addContextLink()" class="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl hover:border-zinc-500 transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        <span class="text-[8px] font-black uppercase tracking-widest">Link</span>
                    </button>
                </div>

                <input type="file" id="file-upload" class="hidden" onchange="window.app.handleFileContext(this)">
                
                <div id="context-list" class="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1"></div>
            </div>

            <!-- Directive -->
            <div>
                <label class="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-2 mono italic">Mission_Directive</label>
                <textarea id="node-directive" class="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-zinc-100 placeholder:text-zinc-700 p-4 rounded-2xl outline-none h-40 resize-none leading-relaxed text-[11px] transition-all" placeholder="Опишите задачу для этого агента..."></textarea>
            </div>
        </div>
        
        <div class="pt-6 mt-auto border-t border-zinc-800">
            <button onclick="window.app.deleteCurrentNode()" class="w-full py-4 text-[9px] font-black text-red-500 hover:text-red-400 transition-all uppercase tracking-[0.3em] mono italic hover:bg-red-500/10 rounded-2xl border border-transparent hover:border-red-500/30">
                Destroy_Process
            </button>
        </div>
    </aside>
`;
