// Line of sight check using Bresenham's algorithm
export function hasLineOfSight(x1, y1, x2, y2, blockedTiles) {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
        if (blockedTiles.some(t => t.x === x1 && t.y === y1)) {
            return false;
        }
        if (x1 === x2 && y1 === y2) break;
        
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
    return true;
}
