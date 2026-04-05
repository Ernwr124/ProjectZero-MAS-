export class ConnectionManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.style.position = 'absolute';
        this.svg.style.top = '0';
        this.svg.style.left = '0';
        this.svg.style.overflow = 'visible';
        this.svg.style.pointerEvents = 'none';
        this.svg.style.zIndex = '5';
        
        // Создаем маркер стрелки
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "7");
        marker.setAttribute("refX", "9");
        marker.setAttribute("refY", "3.5");
        marker.setAttribute("orient", "auto");
        
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
        polygon.setAttribute("fill", "#000");
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        this.svg.appendChild(defs);
        
        this.canvas.appendChild(this.svg);
        this.connections = []; 
        this.tempLine = null;
    }

    addConnection(fromNode, toNode) {
        // Проверяем, не существует ли уже такая связь
        const exists = this.connections.some(c => c.from === fromNode && c.to === toNode);
        if (exists) return;

        this.connections.push({ from: fromNode, to: toNode });
        this.draw();
    }

    removeConnection(conn) {
        this.connections = this.connections.filter(c => c !== conn);
        this.draw();
        if (window.app) window.app.saveProject();
    }

    draw() {
        this.svg.querySelectorAll('path').forEach(p => p.remove());
        this.connections.forEach(conn => {
            this.drawOrthogonalLine(conn.from.getPortPos('out'), conn.to.getPortPos('in'), false, conn);
        });
        if (this.tempLine) {
            this.drawOrthogonalLine(this.tempLine.start, this.tempLine.end, true);
        }
    }

    drawOrthogonalLine(start, end, isTemp = false, connObject = null) {
        const offset = 20; 
        let d = "";
        
        if (start.x + offset < end.x - offset) {
            const midX = start.x + (end.x - start.x) / 2;
            const roundedMidX = Math.round(midX / 20) * 20;
            d = `M ${start.x} ${start.y} L ${start.x + offset} ${start.y} L ${roundedMidX} ${start.y} L ${roundedMidX} ${end.y} L ${end.x - offset} ${end.y} L ${end.x} ${end.y}`;
        } else {
            const midY = start.y + (end.y - start.y) / 2;
            const roundedMidY = Math.round(midY / 20) * 20;
            d = `M ${start.x} ${start.y} L ${start.x + offset} ${start.y} L ${start.x + offset} ${roundedMidY} L ${end.x - offset} ${roundedMidY} L ${end.x - offset} ${end.y} L ${end.x} ${end.y}`;
        }

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("stroke", isTemp ? "rgba(255,255,255,0.2)" : "#52525b");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "transparent");
        path.setAttribute("stroke-linejoin", "round");
        
        if (!isTemp) {
            path.setAttribute("marker-end", "url(#arrowhead)"); // Добавляем стрелку
            path.style.pointerEvents = "visibleStroke";
            path.style.cursor = "pointer";
            path.onclick = (e) => { e.stopPropagation(); this.removeConnection(connObject); };
            path.onmouseenter = () => path.setAttribute("stroke", "#fafafa");
            path.onmouseleave = () => path.setAttribute("stroke", "#52525b");
        } else {
            path.setAttribute("stroke-dasharray", "4,4");
        }
        
        this.svg.appendChild(path);
    }

    updateTempLine(start, end) {
        this.tempLine = { start, end };
        this.draw();
    }

    clearTempLine() {
        this.tempLine = null;
        this.draw();
    }
}
