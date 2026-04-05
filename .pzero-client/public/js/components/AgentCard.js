import { AgentLogos } from './LogoSelector.js';

export class AgentNode {
    constructor(id, options = {}) {
        this.id = id || `AX-${Math.floor(Math.random() * 9000) + 1000}`;
        this.name = options.name || 'Agent';
        this.x = options.x || 100;
        this.y = options.y || 100;
        this.type = options.type || 'OLLAMA';
        this.directive = options.directive || '';
        this.icon = options.icon || 'bot'; // Default icon
        this.element = null;
        this.gridSize = 20; 
        this.width = 160;
    }

    render(onClick, onDrag, onPortMouseDown) {
        const shortName = this.name.length > 12 ? this.name.substring(0, 12) + '..' : this.name;
        
        const div = document.createElement('div');
        div.id = this.id;
        div.className = 'agent-node absolute select-none group';
        
        this.x = Math.round(this.x / this.gridSize) * this.gridSize;
        this.y = Math.round(this.y / this.gridSize) * this.gridSize;
        
        div.style.left = `${this.x}px`;
        div.style.top = `${this.y}px`;
        div.style.width = `${this.width}px`;

        div.innerHTML = `
            <!-- Ports -->
            <div class="port input-port flex items-center justify-center text-[10px] font-black text-zinc-400" data-node-id="${this.id}" data-port-type="in">+</div>
            <div class="port output-port flex items-center justify-center text-[10px] font-black text-zinc-400" data-node-id="${this.id}" data-port-type="out">-</div>
            
            <div class="node-body flex items-center gap-2.5 bg-zinc-800 p-2.5 rounded-[14px] border border-zinc-700 group-hover:border-zinc-500 transition-all duration-200 shadow-lg agent-pulse w-full h-full relative z-10">
                <!-- Icon Block -->
                <div class="node-icon relative w-8 h-8 rounded-[10px] bg-zinc-900 border border-zinc-700 flex items-center justify-center font-black text-[11px] italic text-zinc-300 group-hover:text-zinc-100 transition-colors uppercase overflow-hidden">
                    <span class="node-icon-label relative z-10 flex items-center justify-center w-full h-full">${AgentLogos[this.icon] || AgentLogos['bot']}</span>
                    <!-- Working Animation Overlay -->
                    <div class="working-overlay absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300 flex items-center justify-center">
                        <div class="w-full h-full absolute top-0 left-0 bg-gradient-to-b from-transparent via-white/10 to-transparent scan-line"></div>
                    </div>
                </div>
                
                <!-- Data Block -->
                <div class="flex flex-col min-w-0 flex-1 justify-center">
                    <span class="node-name-text text-[10px] font-black text-zinc-100 tracking-tight uppercase leading-none truncate italic mb-0.5">
                        ${shortName}
                    </span>
                    <span class="text-[6.5px] text-zinc-500 font-bold tracking-[0.2em] uppercase mono leading-none">
                        ${this.type === 'OLLAMA' ? 'Local: Ollama' : 'Cloud: Alem'}
                    </span>
                </div>
            </div>
        `;

        this.element = div;
        this.setupDragging(onDrag);
        
        div.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('port')) {
                onPortMouseDown(e, this, e.target.dataset.portType);
                return;
            }
            onClick(this);
        });

        return div;
    }

    setupDragging(onDrag) {
        this.element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('port')) return;
            e.stopPropagation();

            const zoom = window.app.zoomLevel || 1;
            const canvas = document.getElementById('army-canvas').getBoundingClientRect();
            
            // Расчет смещения с учетом зума
            const startX = e.clientX;
            const startY = e.clientY;
            const initialNodeX = this.x;
            const initialNodeY = this.y;

            const onMouseMove = (moveEvent) => {
                const dx = (moveEvent.clientX - startX) / zoom;
                const dy = (moveEvent.clientY - startY) / zoom;
                
                let rawX = initialNodeX + dx;
                let rawY = initialNodeY + dy;
                
                this.x = Math.round(rawX / this.gridSize) * this.gridSize;
                this.y = Math.round(rawY / this.gridSize) * this.gridSize;
                
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
                if (onDrag) onDrag();
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    getPortPos(type) {
        if (type === 'in') return { x: this.x, y: this.y + 27 };
        return { x: this.x + this.width, y: this.y + 27 };
    }
}