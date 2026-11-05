import { desenharMovelInvestigacao } from './mobiliario-investigacao.js';
import { desenharMovelCronologia } from './mobiliario-cronologia.js';
import { desenharMovelHospital } from './mobiliario-hospital.js';
import { desenharMovelRpg } from './moveis-rpg.js';
import { CONFIG } from '../data/config.js';
import { randomRange } from '../util.js';

// ============================================
// PIXEL ART FURNITURE RENDERER
// ============================================
export class FurnitureRenderer {
    constructor(scene) {
        this.scene = scene;
    }
    
    // Draw a pixel (small rectangle for pixel art effect)
    px(g, x, y, size, color) {
        g.fillStyle(color);
        g.fillRect(x - size/2, y - size/2, size, size);
    }
    
    // Draw desk/table with drawers and items
    drawDesk(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Table top (wood grain)
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, h * 0.7);
        g.fillStyle(color + 0x111111);
        g.fillRect(px - w/2 + 2, py - h/2 + 2, w - 4, 3); // Wood grain line
        g.fillRect(px - w/2 + 4, py - h/2 + 8, w - 8, 2);
        
        // Drawers
        g.fillStyle(color - 0x111111);
        g.fillRect(px - w/2 + 2, py - h/2 + h * 0.7, w/3 - 2, h * 0.25);
        g.fillRect(px + w/6, py - h/2 + h * 0.7, w/3 - 2, h * 0.25);
        
        // Drawer handles
        g.fillStyle(0xccaa00);
        g.fillRect(px - w/3, py + h * 0.15, 4, 2);
        g.fillRect(px + w/6 + 6, py + h * 0.15, 4, 2);
        
        // Items on desk
        g.fillStyle(0xeeeeee);
        g.fillRect(px + w/4, py - h/3, 8, 6); // Paper
        g.fillStyle(0x333333);
        g.fillRect(px - w/4, py - h/3, 3, 8); // Pen
        
        return g;
    }
    
    // Draw cabinet with shelves
    drawCabinet(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Main body
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Frame
        g.lineStyle(2, color - 0x222222);
        g.strokeRect(px - w/2, py - h/2, w, h);
        
        // Shelves
        g.fillStyle(color - 0x111111);
        for (let i = 1; i < 3; i++) {
            g.fillRect(px - w/2 + 2, py - h/2 + (h/3) * i, w - 4, 2);
        }
        
        // Items on shelves (bottles/containers)
        const colors = [0x44aa44, 0xaa4444, 0x4444aa, 0xaaaa44];
        for (let i = 0; i < 3; i++) {
            g.fillStyle(colors[i % colors.length]);
            g.fillRect(px - w/4 + i * 6, py - h/3, 4, 8);
        }
        
        // Handle
        g.fillStyle(0x888888);
        g.fillRect(px + w/4, py, 3, 6);
        
        return g;
    }
    
    // Draw hospital bed
    drawBed(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Bed frame
        g.fillStyle(0x666666);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Mattress
        g.fillStyle(0xddddcc);
        g.fillRect(px - w/2 + 3, py - h/2 + 3, w - 6, h - 6);
        
        // Pillow
        g.fillStyle(0xffffff);
        g.fillRect(px - w/2 + 5, py - h/2 + 4, 12, h - 10);
        g.fillStyle(0xeeeeee);
        g.fillRect(px - w/2 + 6, py - h/2 + 5, 10, 2);
        
        // Blanket fold
        g.fillStyle(0x8899aa);
        g.fillRect(px + 5, py - h/2 + 4, w/3, h - 8);
        g.fillStyle(0x7788aa);
        g.fillRect(px + 7, py - h/2 + 6, w/3 - 4, 3);
        
        // Headboard
        g.fillStyle(color);
        g.fillRect(px - w/2 + 1, py - h/2, 4, h);
        
        // Footboard
        g.fillStyle(color - 0x111111);
        g.fillRect(px + w/2 - 5, py - h/2 + 2, 4, h - 4);
        
        return g;
    }
    
    // Draw computer/monitor
    drawComputer(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Desk
        g.fillStyle(0x5a4a3a);
        g.fillRect(px - w/2, py, w, h/2);
        
        // Monitor frame
        g.fillStyle(0x333333);
        g.fillRect(px - 12, py - h/2, 24, 16);
        
        // Screen
        g.fillStyle(0x002244);
        g.fillRect(px - 10, py - h/2 + 2, 20, 11);
        
        // Screen glow (green text)
        g.fillStyle(0x00ff00);
        g.fillRect(px - 8, py - h/2 + 4, 8, 1);
        g.fillRect(px - 8, py - h/2 + 7, 12, 1);
        g.fillRect(px - 8, py - h/2 + 10, 6, 1);
        
        // Monitor stand
        g.fillStyle(0x444444);
        g.fillRect(px - 3, py - h/2 + 16, 6, 4);
        
        // Keyboard
        g.fillStyle(0x888888);
        g.fillRect(px - 10, py + 2, 20, 6);
        g.fillStyle(0xaaaaaa);
        for (let i = 0; i < 4; i++) {
            g.fillRect(px - 8 + i * 5, py + 3, 4, 4);
        }
        
        return g;
    }
    
    // Draw wrecked car (junkyard)
    drawCar(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Car body (dented/damaged)
        g.fillStyle(color);
        g.fillRect(px - w/2 + 4, py - h/4, w - 8, h/2);
        
        // Hood
        g.fillStyle(color - 0x111111);
        g.fillRect(px - w/2, py - h/4 + 2, 8, h/2 - 4);
        
        // Roof (crushed)
        g.fillStyle(color + 0x111111);
        g.fillRect(px - 5, py - h/2, 20, 8);
        
        // Windshield (cracked)
        g.fillStyle(0x88aacc);
        g.fillRect(px - 3, py - h/2 + 2, 8, 5);
        g.lineStyle(1, 0xffffff, 0.5);
        g.lineBetween(px - 2, py - h/2 + 3, px + 3, py - h/2 + 6);
        
        // Windows
        g.fillStyle(0x5588aa);
        g.fillRect(px + 8, py - h/2 + 2, 6, 5);
        
        // Wheels
        g.fillStyle(0x222222);
        g.fillCircle(px - w/3, py + h/3, 5);
        g.fillCircle(px + w/4, py + h/3, 5);
        g.fillStyle(0x444444);
        g.fillCircle(px - w/3, py + h/3, 2);
        g.fillCircle(px + w/4, py + h/3, 2);
        
        // Rust patches
        g.fillStyle(0x8b4513, 0.6);
        g.fillCircle(px + w/6, py, 4);
        g.fillCircle(px - w/4, py - 2, 3);
        
        // Trunk (open/damaged)
        g.fillStyle(color - 0x222222);
        g.fillRect(px + w/2 - 8, py - h/4 + 2, 6, h/2 - 4);
        
        return g;
    }
    
    // Draw scrap pile
    drawScrap(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        const colors = [0x6d6d6d, 0x5d5d5d, 0x7d7d7d, 0x8b4513, 0x654321];
        
        // Random metal pieces
        for (let i = 0; i < 8; i++) {
            const sx = px + randomRange(-12, 12);
            const sy = py + randomRange(-10, 10);
            const sw = randomRange(4, 12);
            const sh = randomRange(3, 8);
            g.fillStyle(colors[i % colors.length]);
            g.fillRect(sx - sw/2, sy - sh/2, sw, sh);
        }
        
        // Some round pieces
        g.fillStyle(0x555555);
        g.fillCircle(px - 5, py + 3, 4);
        g.fillCircle(px + 6, py - 4, 3);
        
        // Wires/cables
        g.lineStyle(1, 0x333333);
        g.lineBetween(px - 10, py - 5, px + 5, py + 8);
        g.lineStyle(1, 0x884422);
        g.lineBetween(px + 3, py - 8, px - 8, py + 5);
        
        return g;
    }
    
    // Draw barrel (rusty or chemical)
    drawBarrel(px, py, color, isRusty = false) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Barrel body
        g.fillStyle(color);
        g.fillRect(px - 8, py - 9, 16, 18);
        
        // Barrel rings
        g.fillStyle(isRusty ? 0x654321 : 0x444444);
        g.fillRect(px - 9, py - 8, 18, 2);
        g.fillRect(px - 9, py + 6, 18, 2);
        
        // Top
        g.fillStyle(color + 0x111111);
        g.fillRect(px - 6, py - 9, 12, 3);
        
        // Rust or stain
        if (isRusty) {
            g.fillStyle(0x8b4513, 0.5);
            g.fillCircle(px + 3, py, 4);
            g.fillCircle(px - 4, py + 3, 3);
        }
        
        // Warning symbol (if chemical)
        if (!isRusty) {
            g.fillStyle(0xffff00);
            g.fillTriangle(px, py - 3, px - 4, py + 3, px + 4, py + 3);
            g.fillStyle(0x000000);
            g.fillRect(px - 1, py - 1, 2, 3);
            g.fillRect(px - 1, py + 2, 2, 1);
        }
        
        return g;
    }
    
    // Draw fridge
    drawFridge(px, py, width, height, color, isOld = false) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Body
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Frame
        g.lineStyle(2, color - 0x222222);
        g.strokeRect(px - w/2, py - h/2, w, h);
        
        // Freezer compartment
        g.fillStyle(color - 0x111111);
        g.fillRect(px - w/2 + 2, py - h/2 + 2, w - 4, h/4);
        g.lineStyle(1, 0x888888);
        g.strokeRect(px - w/2 + 2, py - h/2 + 2, w - 4, h/4);
        
        // Main door line
        g.lineStyle(1, 0x888888);
        g.lineBetween(px - w/2 + 2, py - h/4, px + w/2 - 2, py - h/4);
        
        // Handle
        g.fillStyle(0x888888);
        g.fillRect(px + w/4, py - h/4 + 4, 3, 8);
        g.fillRect(px + w/4, py + h/6, 3, 8);
        
        // Rust/damage for old fridge
        if (isOld) {
            g.fillStyle(0x8b4513, 0.4);
            g.fillCircle(px - 3, py + h/4, 4);
            g.fillCircle(px + 2, py, 3);
        }
        
        return g;
    }
    
    // Draw control console (nuclear)
    drawConsole(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Main panel
        g.fillStyle(0x3a3a3a);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Screen
        g.fillStyle(0x001111);
        g.fillRect(px - w/3, py - h/2 + 3, w/2, h/2);
        g.fillStyle(0x00ff00);
        g.fillRect(px - w/3 + 2, py - h/2 + 5, 4, 1);
        g.fillRect(px - w/3 + 2, py - h/2 + 8, 8, 1);
        
        // Buttons row
        const btnColors = [0xff0000, 0x00ff00, 0xffff00, 0x0088ff];
        for (let i = 0; i < 4; i++) {
            g.fillStyle(btnColors[i]);
            g.fillCircle(px - w/3 + 5 + i * 8, py + 2, 3);
        }
        
        // Switches
        g.fillStyle(0x888888);
        g.fillRect(px + w/6, py - 4, 4, 8);
        g.fillRect(px + w/6 + 8, py - 2, 4, 6);
        
        // Warning light
        g.fillStyle(0xff3300);
        g.fillCircle(px + w/3, py - h/3, 4);
        
        return g;
    }
    
    // Draw painting bench (factory)
    drawPaintBench(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Table top
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, h * 0.6);
        g.fillStyle(color + 0x111111);
        g.fillRect(px - w/2 + 2, py - h/2 + 1, w - 4, 2);
        
        // Legs
        g.fillStyle(color - 0x222222);
        g.fillRect(px - w/2 + 2, py, 4, h/2);
        g.fillRect(px + w/2 - 6, py, 4, h/2);
        
        // Watch dials (small circles)
        for (let i = 0; i < 3; i++) {
            g.fillStyle(0xdddddd);
            g.fillCircle(px - w/3 + i * 12, py - h/4, 4);
            g.fillStyle(0x88ff88, 0.6);
            g.fillCircle(px - w/3 + i * 12, py - h/4, 2);
        }
        
        // Brushes in jar
        g.fillStyle(0x444444);
        g.fillRect(px + w/4, py - h/3, 6, 8);
        g.fillStyle(0xaa6633);
        g.fillRect(px + w/4 + 1, py - h/3 - 4, 1, 4);
        g.fillRect(px + w/4 + 3, py - h/3 - 5, 1, 5);
        g.fillRect(px + w/4 + 5, py - h/3 - 3, 1, 3);
        
        return g;
    }
    
    // Draw paint pot with glow
    drawPaintPot(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Pot
        g.fillStyle(0x654321);
        g.fillRect(px - 7, py - 6, 14, 12);
        
        // Rim
        g.fillStyle(0x555555);
        g.fillRect(px - 8, py - 6, 16, 2);
        
        // Paint inside (glowing)
        g.fillStyle(0xccff88);
        g.fillRect(px - 5, py - 4, 10, 4);
        
        // Glow effect
        g.fillStyle(0x88ff88, 0.3);
        g.fillCircle(px, py - 2, 10);
        
        // Drip
        g.fillStyle(0xaaff66);
        g.fillRect(px + 5, py, 2, 5);
        
        return g;
    }
    
    // Draw lead capsule (Goiânia)
    drawCapsule(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Outer casing
        g.fillStyle(0x4a4a4a);
        g.fillRect(px - 8, py - 8, 16, 16);
        
        // Inner chamber
        g.fillStyle(0x333333);
        g.fillRect(px - 5, py - 5, 10, 10);
        
        // Cs-137 core (blue glow)
        g.fillStyle(0x0088ff);
        g.fillRect(px - 3, py - 3, 6, 6);
        
        // Metallic rim
        g.lineStyle(2, 0x666666);
        g.strokeRect(px - 8, py - 8, 16, 16);
        
        // Bolts
        g.fillStyle(0x888888);
        g.fillCircle(px - 6, py - 6, 2);
        g.fillCircle(px + 6, py - 6, 2);
        g.fillCircle(px - 6, py + 6, 2);
        g.fillCircle(px + 6, py + 6, 2);
        
        return g;
    }
    
    // Draw RTG (Lia)
    drawRTG(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Main body (cylinder)
        g.fillStyle(0x555555);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Fins
        g.fillStyle(0x444444);
        for (let i = 0; i < 4; i++) {
            g.fillRect(px - w/2 + 4 + i * 8, py - h/2 - 2, 4, h + 4);
        }
        
        // Core window
        g.fillStyle(0xff00ff, 0.5);
        g.fillCircle(px, py, 6);
        g.fillStyle(0xff00ff);
        g.fillCircle(px, py, 3);
        
        // Warning label
        g.fillStyle(0xffff00);
        g.fillRect(px - 4, py + h/4, 8, 4);
        g.fillStyle(0x000000);
        g.fillTriangle(px, py + h/4, px - 2, py + h/4 + 3, px + 2, py + h/4 + 3);
        
        return g;
    }
    
    // Draw reactor core (Chernobyl)
    drawReactor(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Damaged structure
        g.fillStyle(0x2a2a2a);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Core (damaged, exposed)
        g.fillStyle(0x1a1a1a);
        g.fillRect(px - w/3, py - h/3, w*2/3, h*2/3);
        
        // Glowing core
        g.fillStyle(0xff3300, 0.7);
        g.fillCircle(px, py, w/4);
        g.fillStyle(0xff6600, 0.5);
        g.fillCircle(px, py, w/6);
        
        // Debris
        g.fillStyle(0x444444);
        g.fillRect(px - w/3, py - h/3, 8, 6);
        g.fillRect(px + w/4, py + h/4, 6, 4);
        
        // Graphite blocks
        g.fillStyle(0x222222);
        g.fillRect(px - w/2 + 4, py + h/4, 10, 6);
        g.fillRect(px + w/4, py - h/3, 8, 8);
        
        return g;
    }
    
    // Draw generator/machine
    drawMachine(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Main body
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Panel
        g.fillStyle(color - 0x111111);
        g.fillRect(px - w/3, py - h/3, w/2, h/3);
        
        // Gauges
        g.fillStyle(0xdddddd);
        g.fillCircle(px - w/6, py - h/5, 4);
        g.fillCircle(px + w/8, py - h/5, 4);
        g.fillStyle(0x000000);
        g.fillCircle(px - w/6, py - h/5, 2);
        g.fillCircle(px + w/8, py - h/5, 2);
        
        // Vents
        g.fillStyle(0x333333);
        for (let i = 0; i < 3; i++) {
            g.fillRect(px - w/3 + i * 6, py + h/6, 4, 8);
        }
        
        // Pipes
        g.fillStyle(0x666666);
        g.fillRect(px + w/4, py - h/4, 6, h/2);
        
        return g;
    }
    
    // Draw tire stack
    drawTires(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Bottom tire
        g.fillStyle(0x222222);
        g.fillCircle(px, py + 4, 8);
        g.fillStyle(0x333333);
        g.fillCircle(px, py + 4, 4);
        
        // Middle tire
        g.fillStyle(0x282828);
        g.fillCircle(px - 2, py - 2, 7);
        g.fillStyle(0x383838);
        g.fillCircle(px - 2, py - 2, 3);
        
        // Top tire
        g.fillStyle(0x2a2a2a);
        g.fillCircle(px + 1, py - 6, 6);
        g.fillStyle(0x3a3a3a);
        g.fillCircle(px + 1, py - 6, 2);
        
        return g;
    }
    
    // Draw supply crate
    drawCrate(px, py, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Box
        g.fillStyle(color);
        g.fillRect(px - 9, py - 9, 18, 18);
        
        // Planks
        g.fillStyle(color + 0x111111);
        g.fillRect(px - 9, py - 9, 18, 3);
        g.fillRect(px - 9, py + 6, 18, 3);
        
        // Vertical supports
        g.fillStyle(color - 0x111111);
        g.fillRect(px - 9, py - 9, 3, 18);
        g.fillRect(px + 6, py - 9, 3, 18);
        
        // Nails
        g.fillStyle(0x888888);
        g.fillRect(px - 7, py - 7, 2, 2);
        g.fillRect(px + 5, py - 7, 2, 2);
        g.fillRect(px - 7, py + 5, 2, 2);
        g.fillRect(px + 5, py + 5, 2, 2);
        
        return g;
    }
    
    // Draw locker
    drawLocker(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Main body
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Door line
        g.lineStyle(1, 0x333333);
        g.lineBetween(px, py - h/2 + 2, px, py + h/2 - 2);
        
        // Vents
        g.fillStyle(0x222222);
        for (let i = 0; i < 3; i++) {
            g.fillRect(px - w/4, py - h/3 + i * 5, w/3, 2);
        }
        
        // Handles
        g.fillStyle(0x888888);
        g.fillRect(px - 3, py, 2, 6);
        g.fillRect(px + 1, py, 2, 6);
        
        // Name plate
        g.fillStyle(0xcccccc);
        g.fillRect(px - w/4, py + h/4, w/2, 4);
        
        return g;
    }
    
    // Draw shelf with items
    drawShelf(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Shelf boards
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, 3);
        g.fillRect(px - w/2, py, w, 3);
        g.fillRect(px - w/2, py + h/3, w, 3);
        
        // Supports
        g.fillStyle(color - 0x111111);
        g.fillRect(px - w/2, py - h/2, 3, h);
        g.fillRect(px + w/2 - 3, py - h/2, 3, h);
        
        // Items on shelves
        // Books
        g.fillStyle(0x883333);
        g.fillRect(px - w/3, py - h/2 + 3, 4, 8);
        g.fillStyle(0x338833);
        g.fillRect(px - w/3 + 5, py - h/2 + 3, 4, 7);
        g.fillStyle(0x333388);
        g.fillRect(px - w/3 + 10, py - h/2 + 3, 3, 8);
        
        // Boxes
        g.fillStyle(0xaa8844);
        g.fillRect(px + w/6, py + 3, 8, 6);
        
        return g;
    }
    
    // Generic fallback
    drawGeneric(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, h);
        g.lineStyle(2, color - 0x222222);
        g.strokeRect(px - w/2, py - h/2, w, h);
        
        // Simple detail
        g.fillStyle(color + 0x111111);
        g.fillRect(px - w/4, py - h/4, w/2, 2);
        
        return g;
    }
    
    // Draw exam/camp table
    drawTable(px, py, width, height, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Table top
        g.fillStyle(color);
        g.fillRect(px - w/2, py - h/2, w, h * 0.5);
        
        // Table top highlight
        g.fillStyle(color + 0x111111);
        g.fillRect(px - w/2 + 2, py - h/2 + 1, w - 4, 2);
        
        // Legs
        g.fillStyle(0x555555);
        g.fillRect(px - w/2 + 3, py - 2, 4, h/2 + 2);
        g.fillRect(px + w/2 - 7, py - 2, 4, h/2 + 2);
        
        // Cross bar
        g.fillRect(px - w/3, py + h/4, w * 2/3, 2);
        
        return g;
    }
    
    // Draw medical/abandoned cart
    drawCart(px, py, color) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Cart body
        g.fillStyle(color);
        g.fillRect(px - 8, py - 8, 16, 12);
        
        // Handle
        g.fillStyle(0x666666);
        g.fillRect(px - 10, py - 6, 2, 10);
        g.fillRect(px - 10, py - 8, 6, 2);
        
        // Wheels
        g.fillStyle(0x333333);
        g.fillCircle(px - 5, py + 6, 3);
        g.fillCircle(px + 5, py + 6, 3);
        
        // Items on cart
        g.fillStyle(0xaaaaaa);
        g.fillRect(px - 4, py - 6, 6, 4);
        g.fillStyle(0x888888);
        g.fillRect(px + 2, py - 5, 4, 3);
        
        return g;
    }
    
    // Draw brush container/jar
    drawBrushJar(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Jar
        g.fillStyle(0x444444);
        g.fillRect(px - 6, py - 4, 12, 12);
        
        // Rim
        g.fillStyle(0x555555);
        g.fillRect(px - 7, py - 4, 14, 2);
        
        // Brushes sticking out
        const brushColors = [0xaa6633, 0x996644, 0xbb7744];
        for (let i = 0; i < 3; i++) {
            g.fillStyle(brushColors[i]);
            g.fillRect(px - 4 + i * 3, py - 10, 2, 6);
            // Brush tips (glowing)
            g.fillStyle(0x88ff88, 0.7);
            g.fillRect(px - 4 + i * 3, py - 12, 2, 2);
        }
        
        return g;
    }
    
    // Draw watch dial tray
    drawDialTray(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Tray
        g.fillStyle(0x5a4a3a);
        g.fillRect(px - w/2, py - h/2, w, h);
        g.lineStyle(1, 0x4a3a2a);
        g.strokeRect(px - w/2, py - h/2, w, h);
        
        // Watch dials (circular, some glowing)
        for (let i = 0; i < 4; i++) {
            const dx = px - w/3 + i * 10;
            g.fillStyle(0xeeeeee);
            g.fillCircle(dx, py, 4);
            g.fillStyle(0x88ff88, 0.5);
            g.fillCircle(dx, py, 2);
            // Clock hands
            g.lineStyle(1, 0x333333);
            g.lineBetween(dx, py, dx, py - 2);
            g.lineBetween(dx, py, dx + 1, py + 1);
        }
        
        return g;
    }
    
    // Draw washing sink
    drawSink(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Basin
        g.fillStyle(0xdddddd);
        g.fillRect(px - 8, py - 6, 16, 12);
        
        // Inside (darker)
        g.fillStyle(0xaaaaaa);
        g.fillRect(px - 6, py - 4, 12, 8);
        
        // Drain
        g.fillStyle(0x444444);
        g.fillCircle(px, py + 1, 2);
        
        // Faucet
        g.fillStyle(0x888888);
        g.fillRect(px - 2, py - 10, 4, 6);
        g.fillRect(px - 1, py - 6, 2, 3);
        
        // Water stain (contaminated)
        g.fillStyle(0x88ff88, 0.2);
        g.fillRect(px - 4, py - 2, 8, 4);
        
        return g;
    }
    
    // Draw pipe junction
    drawPipe(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Vertical pipe
        g.fillStyle(0x666666);
        g.fillRect(px - 4, py - 10, 8, 20);
        
        // Horizontal pipe
        g.fillRect(px - 10, py - 3, 20, 6);
        
        // Junction collar
        g.fillStyle(0x888888);
        g.fillRect(px - 5, py - 4, 10, 8);
        
        // Valve
        g.fillStyle(0xaa0000);
        g.fillRect(px + 6, py - 2, 4, 4);
        
        // Pipe highlights
        g.fillStyle(0x888888);
        g.fillRect(px - 3, py - 9, 2, 18);
        
        return g;
    }
    
    // Draw waste container (nuclear)
    drawWasteContainer(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Yellow container
        g.fillStyle(0xffcc00);
        g.fillRect(px - 8, py - 8, 16, 16);
        
        // Black stripes
        g.fillStyle(0x000000);
        g.fillRect(px - 8, py - 6, 16, 3);
        g.fillRect(px - 8, py + 3, 16, 3);
        
        // Radiation symbol
        g.fillStyle(0x000000);
        g.fillCircle(px, py, 3);
        // Trefoil blades
        for (let i = 0; i < 3; i++) {
            const angle = (i * 120 - 90) * Math.PI / 180;
            const tx = px + Math.cos(angle) * 5;
            const ty = py + Math.sin(angle) * 5;
            g.fillTriangle(px, py, tx - 2, ty, tx + 2, ty);
        }
        
        return g;
    }
    
    // Draw electrical panel
    drawElectricalPanel(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Panel body
        g.fillStyle(0x3a3a3a);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Door
        g.lineStyle(1, 0x555555);
        g.strokeRect(px - w/2 + 2, py - h/2 + 2, w - 4, h - 4);
        
        // Switches/breakers
        for (let i = 0; i < 4; i++) {
            g.fillStyle(i % 2 === 0 ? 0x00aa00 : 0xaa0000);
            g.fillRect(px - 3, py - h/3 + i * 8, 6, 5);
        }
        
        // Warning label
        g.fillStyle(0xffff00);
        g.fillRect(px - w/3, py + h/3, w * 2/3, 4);
        
        // Wires coming out
        g.lineStyle(2, 0x222222);
        g.lineBetween(px - 2, py - h/2, px - 2, py - h/2 - 6);
        g.lineBetween(px + 2, py - h/2, px + 2, py - h/2 - 6);
        
        return g;
    }
    
    // Draw debris pile (forest/bunker)
    drawDebris(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        
        // Random debris pieces
        const colors = [0x3e2723, 0x4e3733, 0x5e4743, 0x6e5753];
        for (let i = 0; i < 6; i++) {
            g.fillStyle(colors[i % colors.length]);
            g.fillRect(
                px - w/2 + randomRange(0, w - 8),
                py + randomRange(-8, 4),
                randomRange(6, 12),
                randomRange(4, 8)
            );
        }
        
        // Branches
        g.lineStyle(2, 0x5d4037);
        g.lineBetween(px - 10, py, px + 8, py - 5);
        g.lineBetween(px - 5, py + 3, px + 10, py - 2);
        
        // Leaves
        g.fillStyle(0x2d5a2d, 0.7);
        g.fillCircle(px - 8, py - 3, 3);
        g.fillCircle(px + 6, py + 2, 4);
        
        return g;
    }
    
    // Draw metal sheets (junkyard)
    drawMetalSheets(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Stacked sheets with offset
        const sheetColors = [0x888888, 0x777777, 0x999999, 0x666666];
        for (let i = 0; i < 4; i++) {
            g.fillStyle(sheetColors[i]);
            g.fillRect(px - w/2 + i * 2, py - h/2 + i * 2, w - 4, h - i * 2 - 2);
        }
        
        // Rust spots
        g.fillStyle(0x8b4513, 0.5);
        g.fillCircle(px + 5, py, 3);
        g.fillCircle(px - 8, py + 2, 2);
        
        // Bent corner
        g.fillStyle(0x555555);
        g.fillTriangle(px + w/2 - 4, py - h/2, px + w/2 - 4, py - h/2 + 6, px + w/2 - 10, py - h/2);
        
        return g;
    }
    
    // Draw car engine
    drawEngine(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Engine block
        g.fillStyle(0x4a4a4a);
        g.fillRect(px - 8, py - 6, 16, 12);
        
        // Cylinder head
        g.fillStyle(0x5a5a5a);
        g.fillRect(px - 6, py - 8, 12, 4);
        
        // Valve cover
        g.fillStyle(0x3a3a3a);
        g.fillRect(px - 5, py - 9, 10, 2);
        
        // Pulleys
        g.fillStyle(0x666666);
        g.fillCircle(px - 5, py + 4, 3);
        g.fillCircle(px + 5, py + 4, 2);
        
        // Belt
        g.lineStyle(1, 0x222222);
        g.lineBetween(px - 5, py + 7, px + 5, py + 6);
        
        // Oil stain
        g.fillStyle(0x1a1a0a, 0.5);
        g.fillCircle(px + 2, py + 8, 4);
        
        // Wires
        g.lineStyle(1, 0x884422);
        g.lineBetween(px - 3, py - 9, px - 6, py - 12);
        g.lineBetween(px + 3, py - 9, px + 6, py - 12);
        
        return g;
    }
    
    // =========== NEW FURNITURE TYPES ===========
    
    // Draw microscope
    drawMicroscope(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Base
        g.fillStyle(0x333333);
        g.fillRect(px - 8, py + 2, 16, 6);
        
        // Stage
        g.fillStyle(0x444444);
        g.fillRect(px - 5, py - 2, 10, 4);
        
        // Arm
        g.fillStyle(0x555555);
        g.fillRect(px + 3, py - 10, 4, 12);
        
        // Eyepiece
        g.fillStyle(0x222222);
        g.fillRect(px + 2, py - 14, 6, 4);
        g.fillStyle(0x4488ff);
        g.fillCircle(px + 5, py - 15, 2);
        
        // Objective lenses
        g.fillStyle(0x666666);
        g.fillRect(px + 1, py - 4, 8, 3);
        
        return g;
    }
    
    // Draw centrifuge
    drawCentrifuge(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Body
        g.fillStyle(0xcccccc);
        g.fillRect(px - 8, py - 6, 16, 14);
        
        // Lid
        g.fillStyle(0xaaaaaa);
        g.fillRect(px - 7, py - 8, 14, 4);
        
        // Window (circular)
        g.fillStyle(0x224466);
        g.fillCircle(px, py, 5);
        g.fillStyle(0x88aacc);
        g.fillCircle(px, py, 3);
        
        // Control panel
        g.fillStyle(0x333333);
        g.fillRect(px - 6, py + 4, 12, 3);
        g.fillStyle(0x00ff00);
        g.fillCircle(px - 3, py + 5, 1);
        g.fillStyle(0xff0000);
        g.fillCircle(px + 3, py + 5, 1);
        
        return g;
    }
    
    // Draw biohazard container
    drawBiohazard(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Container
        g.fillStyle(0xff6600);
        g.fillRect(px - 8, py - 8, 16, 16);
        
        // Biohazard symbol
        g.fillStyle(0x000000);
        g.fillCircle(px, py, 3);
        for (let i = 0; i < 3; i++) {
            const angle = (i * 120 - 90) * Math.PI / 180;
            const tx = px + Math.cos(angle) * 5;
            const ty = py + Math.sin(angle) * 5;
            g.fillCircle(tx, ty, 3);
        }
        
        // Lid
        g.fillStyle(0xdd5500);
        g.fillRect(px - 7, py - 9, 14, 2);
        
        return g;
    }
    
    // Draw wheelchair
    drawWheelchair(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Frame
        g.fillStyle(0x444444);
        g.fillRect(px - 6, py - 6, 12, 10);
        
        // Seat
        g.fillStyle(0x333388);
        g.fillRect(px - 4, py - 4, 8, 6);
        
        // Back
        g.fillRect(px - 5, py - 8, 3, 6);
        
        // Big wheels
        g.fillStyle(0x222222);
        g.fillCircle(px - 4, py + 5, 5);
        g.fillCircle(px + 4, py + 5, 5);
        g.fillStyle(0x666666);
        g.fillCircle(px - 4, py + 5, 2);
        g.fillCircle(px + 4, py + 5, 2);
        
        // Front wheel
        g.fillStyle(0x222222);
        g.fillCircle(px + 6, py + 2, 2);
        
        return g;
    }
    
    // Draw IV stand
    drawIVStand(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Pole
        g.fillStyle(0x888888);
        g.fillRect(px - 1, py - 10, 2, 18);
        
        // Base
        g.fillStyle(0x666666);
        g.fillRect(px - 6, py + 6, 12, 2);
        
        // Cross bar at top
        g.fillRect(px - 6, py - 10, 12, 2);
        
        // IV bag
        g.fillStyle(0xccffcc);
        g.fillRect(px - 4, py - 8, 4, 6);
        
        // Tube
        g.lineStyle(1, 0xaaddaa);
        g.lineBetween(px - 2, py - 2, px - 2, py + 4);
        
        return g;
    }
    
    // Draw heart monitor
    drawHeartMonitor(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Body
        g.fillStyle(0x444444);
        g.fillRect(px - 8, py - 6, 16, 14);
        
        // Screen
        g.fillStyle(0x001100);
        g.fillRect(px - 6, py - 4, 12, 8);
        
        // Heartbeat line
        g.lineStyle(1, 0x00ff00);
        g.lineBetween(px - 5, py, px - 2, py);
        g.lineBetween(px - 2, py, px, py - 3);
        g.lineBetween(px, py - 3, px + 2, py + 2);
        g.lineBetween(px + 2, py + 2, px + 4, py);
        
        // Buttons
        g.fillStyle(0x00ff00);
        g.fillCircle(px - 4, py + 6, 2);
        g.fillStyle(0xff0000);
        g.fillCircle(px + 4, py + 6, 2);
        
        return g;
    }
    
    // Draw defibrillator
    drawDefibrillator(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Body
        g.fillStyle(0xcc0000);
        g.fillRect(px - 8, py - 6, 16, 12);
        
        // Screen
        g.fillStyle(0x002200);
        g.fillRect(px - 6, py - 4, 8, 5);
        
        // Heart symbol
        g.fillStyle(0x00ff00);
        g.fillCircle(px - 3, py - 2, 2);
        g.fillCircle(px - 1, py - 2, 2);
        
        // Paddles
        g.fillStyle(0x888888);
        g.fillRect(px + 3, py - 3, 4, 8);
        g.fillStyle(0xcccccc);
        g.fillRect(px + 4, py - 2, 2, 3);
        
        return g;
    }
    
    // Draw oxygen tank
    drawOxygenTank(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Tank body
        g.fillStyle(0x2196F3);
        g.fillRect(px - 5, py - 8, 10, 16);
        
        // Top cap
        g.fillStyle(0x0D47A1);
        g.fillRect(px - 4, py - 10, 8, 3);
        
        // Valve
        g.fillStyle(0x888888);
        g.fillRect(px - 2, py - 12, 4, 3);
        
        // Gauge
        g.fillStyle(0xffffff);
        g.fillCircle(px, py - 2, 3);
        g.fillStyle(0x000000);
        g.fillCircle(px, py - 2, 1);
        
        // Label
        g.fillStyle(0xffffff);
        g.fillRect(px - 3, py + 2, 6, 3);
        
        return g;
    }
    
    // Draw washer (junkyard)
    drawWasher(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Body
        g.fillStyle(0xaaaaaa);
        g.fillRect(px - 8, py - 8, 16, 16);
        
        // Door (circle)
        g.fillStyle(0x666666);
        g.fillCircle(px, py, 6);
        g.fillStyle(0x333333);
        g.fillCircle(px, py, 4);
        
        // Control panel
        g.fillStyle(0x888888);
        g.fillRect(px - 6, py - 7, 12, 3);
        
        // Rust
        g.fillStyle(0x8b4513, 0.4);
        g.fillCircle(px + 5, py + 5, 3);
        
        return g;
    }
    
    // Draw broken stove
    drawStove(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Body
        g.fillStyle(0x424242);
        g.fillRect(px - 8, py - 8, 16, 16);
        
        // Burners
        g.fillStyle(0x333333);
        g.fillCircle(px - 3, py - 3, 3);
        g.fillCircle(px + 3, py - 3, 3);
        g.fillCircle(px - 3, py + 3, 3);
        g.fillCircle(px + 3, py + 3, 3);
        
        // Knobs
        g.fillStyle(0x888888);
        g.fillRect(px - 6, py + 6, 2, 2);
        g.fillRect(px - 2, py + 6, 2, 2);
        g.fillRect(px + 2, py + 6, 2, 2);
        
        // Damage/rust
        g.fillStyle(0x8b4513, 0.5);
        g.fillRect(px + 2, py - 6, 4, 3);
        
        return g;
    }
    
    // Draw rotted sofa
    drawSofa(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Back
        g.fillStyle(0x5d4037);
        g.fillRect(px - w/2, py - h/2, w, h * 0.4);
        
        // Seat
        g.fillStyle(0x6d4c41);
        g.fillRect(px - w/2, py - h/2 + h * 0.4, w, h * 0.5);
        
        // Arm rests
        g.fillStyle(0x4e342e);
        g.fillRect(px - w/2, py - h/2 + 2, 4, h - 4);
        g.fillRect(px + w/2 - 4, py - h/2 + 2, 4, h - 4);
        
        // Tears/damage
        g.fillStyle(0x3e2723);
        g.fillRect(px - 5, py - 2, 6, 4);
        g.fillRect(px + 2, py, 4, 3);
        
        // Springs showing
        g.lineStyle(1, 0x888888);
        g.lineBetween(px - 3, py + 2, px - 3, py + 5);
        
        return g;
    }
    
    // Draw old TV
    drawTV(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Body
        g.fillStyle(0x3e2723);
        g.fillRect(px - 8, py - 7, 16, 14);
        
        // Screen (broken)
        g.fillStyle(0x111111);
        g.fillRect(px - 6, py - 5, 10, 8);
        
        // Crack
        g.lineStyle(1, 0x444444);
        g.lineBetween(px - 4, py - 4, px + 3, py + 2);
        g.lineBetween(px, py - 3, px - 2, py + 1);
        
        // Knobs
        g.fillStyle(0x666666);
        g.fillCircle(px + 6, py - 2, 2);
        g.fillCircle(px + 6, py + 2, 2);
        
        // Antenna
        g.fillStyle(0x888888);
        g.fillRect(px - 1, py - 10, 2, 4);
        g.lineBetween(px, py - 10, px - 4, py - 14);
        g.lineBetween(px, py - 10, px + 4, py - 14);
        
        return g;
    }
    
    // Draw wall clock
    drawClock(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Frame
        g.fillStyle(0x5d4037);
        g.fillCircle(px, py, 8);
        
        // Face
        g.fillStyle(0xffffff);
        g.fillCircle(px, py, 6);
        
        // Hour marks
        g.fillStyle(0x333333);
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const mx = px + Math.cos(angle) * 5;
            const my = py + Math.sin(angle) * 5;
            g.fillCircle(mx, my, 0.5);
        }
        
        // Hands
        g.lineStyle(1, 0x333333);
        g.lineBetween(px, py, px - 2, py - 3); // Hour
        g.lineBetween(px, py, px + 3, py + 1); // Minute
        
        // Center
        g.fillStyle(0xff0000);
        g.fillCircle(px, py, 1);
        
        return g;
    }
    
    // Draw work lamp
    drawLamp(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Base
        g.fillStyle(0x333333);
        g.fillRect(px - 5, py + 4, 10, 4);
        
        // Arm
        g.fillStyle(0x444444);
        g.fillRect(px - 1, py - 6, 2, 12);
        
        // Shade
        g.fillStyle(0xffeb3b);
        g.fillRect(px - 6, py - 10, 12, 6);
        
        // Light glow
        g.fillStyle(0xffff88, 0.3);
        g.fillCircle(px, py - 4, 8);
        
        return g;
    }
    
    // Draw work stool
    drawStool(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Seat
        g.fillStyle(0x5d4037);
        g.fillCircle(px, py - 4, 6);
        
        // Legs
        g.fillStyle(0x444444);
        g.fillRect(px - 5, py, 2, 8);
        g.fillRect(px + 3, py, 2, 8);
        g.fillRect(px - 1, py + 2, 2, 6);
        
        // Footrest
        g.fillRect(px - 4, py + 4, 8, 2);
        
        return g;
    }
    
    // Draw ventilation fan
    drawFan(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Housing
        g.fillStyle(0x607d8b);
        g.fillCircle(px, py, 8);
        
        // Grill
        g.fillStyle(0x444444);
        g.lineStyle(1, 0x333333);
        for (let i = 0; i < 3; i++) {
            g.lineBetween(px - 7, py - 4 + i * 4, px + 7, py - 4 + i * 4);
        }
        
        // Fan blades
        g.fillStyle(0x888888);
        for (let i = 0; i < 4; i++) {
            const angle = (i * 90 + 45) * Math.PI / 180;
            const bx = px + Math.cos(angle) * 4;
            const by = py + Math.sin(angle) * 4;
            g.fillCircle(bx, by, 2);
        }
        
        // Center
        g.fillStyle(0x333333);
        g.fillCircle(px, py, 2);
        
        return g;
    }
    
    // Draw coolant tank (nuclear)
    drawTank(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Tank body
        g.fillStyle(0x0097a7);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Highlight
        g.fillStyle(0x00bcd4);
        g.fillRect(px - w/2 + 2, py - h/2 + 2, 4, h - 4);
        
        // Gauge
        g.fillStyle(0xffffff);
        g.fillCircle(px + w/4, py, 4);
        g.fillStyle(0x000000);
        g.lineStyle(1, 0xff0000);
        g.lineBetween(px + w/4, py, px + w/4 + 2, py - 2);
        
        // Pipes
        g.fillStyle(0x666666);
        g.fillRect(px - w/2 - 4, py - 2, 6, 4);
        g.fillRect(px + w/2 - 2, py - 2, 6, 4);
        
        return g;
    }
    
    // Draw overhead crane (nuclear)
    drawCrane(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Rail
        g.fillStyle(0xffc107);
        g.fillRect(px - w/2, py - h/2, w, 4);
        
        // Trolley
        g.fillStyle(0xff9800);
        g.fillRect(px - 6, py - h/2 + 2, 12, 6);
        
        // Hook cable
        g.lineStyle(1, 0x333333);
        g.lineBetween(px, py - h/2 + 8, px, py + h/2 - 4);
        
        // Hook
        g.fillStyle(0x666666);
        g.fillRect(px - 3, py + h/2 - 6, 6, 4);
        g.lineStyle(2, 0x888888);
        g.lineBetween(px - 2, py + h/2 - 2, px - 2, py + h/2 + 2);
        g.lineBetween(px - 2, py + h/2 + 2, px + 2, py + h/2 + 2);
        
        return g;
    }
    
    // Draw dosimeter
    drawDosimeter(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Body
        g.fillStyle(0x4caf50);
        g.fillRect(px - 6, py - 8, 12, 16);
        
        // Screen
        g.fillStyle(0x111111);
        g.fillRect(px - 4, py - 6, 8, 6);
        
        // Reading
        g.fillStyle(0x00ff00);
        g.fillRect(px - 3, py - 4, 6, 1);
        g.fillRect(px - 3, py - 2, 4, 1);
        
        // Speaker holes
        g.fillStyle(0x333333);
        for (let i = 0; i < 3; i++) {
            g.fillRect(px - 3 + i * 3, py + 2, 2, 1);
            g.fillRect(px - 3 + i * 3, py + 4, 2, 1);
        }
        
        return g;
    }
    
    // Draw hazmat suit
    drawHazmatSuit(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Body (hanging)
        g.fillStyle(0xffff00);
        g.fillRect(px - 6, py - 6, 12, 14);
        
        // Hood
        g.fillCircle(px, py - 8, 4);
        
        // Visor
        g.fillStyle(0x333333);
        g.fillRect(px - 3, py - 9, 6, 3);
        
        // Arms
        g.fillStyle(0xffff00);
        g.fillRect(px - 8, py - 4, 3, 8);
        g.fillRect(px + 5, py - 4, 3, 8);
        
        // Boots
        g.fillStyle(0x333333);
        g.fillRect(px - 4, py + 6, 4, 3);
        g.fillRect(px, py + 6, 4, 3);
        
        return g;
    }
    
    // Draw lead shield door
    drawLeadDoor(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Door
        g.fillStyle(0x616161);
        g.fillRect(px - w/2, py - h/2, w, h);
        
        // Heavy frame
        g.lineStyle(3, 0x424242);
        g.strokeRect(px - w/2, py - h/2, w, h);
        
        // Radiation warning
        g.fillStyle(0xffff00);
        g.fillCircle(px, py - h/4, 6);
        g.fillStyle(0x000000);
        g.fillCircle(px, py - h/4, 2);
        
        // Handle
        g.fillStyle(0x888888);
        g.fillRect(px + 2, py + h/6, 4, 8);
        
        return g;
    }
    
    // Draw tent (bunker)
    drawTent(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Tent fabric (triangular shape)
        g.fillStyle(0x4e342e);
        g.fillTriangle(px, py - h/2, px - w/2, py + h/2, px + w/2, py + h/2);
        
        // Opening
        g.fillStyle(0x3e2723);
        g.fillTriangle(px, py - h/4, px - w/4, py + h/2, px + w/4, py + h/2);
        
        // Torn fabric
        g.fillStyle(0x2e1f1a);
        g.fillRect(px + w/4, py, 4, 8);
        
        // Ropes
        g.lineStyle(1, 0x8d6e63);
        g.lineBetween(px - w/2, py + h/2, px - w/2 - 6, py + h/2 + 4);
        g.lineBetween(px + w/2, py + h/2, px + w/2 + 6, py + h/2 + 4);
        
        return g;
    }
    
    // Draw campfire
    drawCampfire(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Ash pit
        g.fillStyle(0x333333);
        g.fillCircle(px, py + 2, 8);
        
        // Rocks around
        g.fillStyle(0x666666);
        for (let i = 0; i < 6; i++) {
            const angle = i * 60 * Math.PI / 180;
            const rx = px + Math.cos(angle) * 7;
            const ry = py + 2 + Math.sin(angle) * 5;
            g.fillCircle(rx, ry, 3);
        }
        
        // Charred wood
        g.fillStyle(0x222222);
        g.fillRect(px - 5, py - 1, 10, 3);
        g.fillRect(px - 3, py - 4, 6, 4);
        
        // Faint ember glow
        g.fillStyle(0xff4400, 0.3);
        g.fillCircle(px, py - 2, 3);
        
        return g;
    }
    
    // Draw fallen log
    drawLog(px, py, width, height) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        const w = width * 20 - 4;
        const h = height * 20 - 4;
        
        // Main log
        g.fillStyle(0x5d4037);
        g.fillRect(px - w/2, py - h/3, w, h * 2/3);
        
        // Bark texture
        g.fillStyle(0x4e342e);
        g.fillRect(px - w/2 + 4, py - h/4, 2, h/2);
        g.fillRect(px - w/2 + 12, py - h/4, 2, h/2);
        g.fillRect(px + w/4, py - h/4, 2, h/2);
        
        // Cross-section
        g.fillStyle(0x8d6e63);
        g.fillCircle(px - w/2 + 2, py, h/3);
        g.fillStyle(0xa1887f);
        g.fillCircle(px - w/2 + 2, py, h/5);
        
        // Moss
        g.fillStyle(0x2e5a2e, 0.6);
        g.fillRect(px + w/6, py - h/3, 8, 3);
        
        return g;
    }
    
    // Draw large rock
    drawRock(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Main rock shape
        g.fillStyle(0x757575);
        g.fillCircle(px, py + 2, 8);
        g.fillCircle(px - 3, py - 2, 5);
        g.fillCircle(px + 4, py, 4);
        
        // Highlight
        g.fillStyle(0x9e9e9e);
        g.fillCircle(px - 2, py - 3, 3);
        
        // Cracks
        g.lineStyle(1, 0x555555);
        g.lineBetween(px - 4, py, px + 2, py + 4);
        
        return g;
    }
    
    // Draw backpack
    drawBackpack(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Main body
        g.fillStyle(0x33691e);
        g.fillRect(px - 6, py - 6, 12, 14);
        
        // Front pocket
        g.fillStyle(0x2e5a1a);
        g.fillRect(px - 4, py, 8, 6);
        
        // Top flap
        g.fillStyle(0x3a7a22);
        g.fillRect(px - 5, py - 8, 10, 3);
        
        // Straps
        g.fillStyle(0x555555);
        g.fillRect(px - 6, py - 5, 2, 12);
        g.fillRect(px + 4, py - 5, 2, 12);
        
        // Buckles
        g.fillStyle(0xcccccc);
        g.fillRect(px - 3, py + 4, 2, 2);
        
        return g;
    }
    
    // Draw rope coil
    drawRope(px, py) {
        const g = this.scene.add.graphics();
        g.setDepth(2);
        
        // Coiled rope (concentric circles)
        g.lineStyle(2, 0x8d6e63);
        g.strokeCircle(px, py, 6);
        g.lineStyle(2, 0x7d5e53);
        g.strokeCircle(px, py, 4);
        g.fillStyle(0x6d4e43);
        g.fillCircle(px, py, 2);
        
        // End of rope
        g.lineStyle(2, 0x8d6e63);
        g.lineBetween(px + 6, py, px + 10, py + 4);
        
        return g;
    }
    
    // Main render method - choose based on furniture type
    render(f, themeName) {
        const rpg = desenharMovelRpg(this.scene, f, themeName);
        if (rpg) return { graphics: rpg, centerX: (f.x+f.type.width/2)*CONFIG.TILE_SIZE, centerY: (f.y+f.type.height/2)*CONFIG.TILE_SIZE };
        const cronologia = desenharMovelCronologia(this.scene, f);
        if (cronologia) return { graphics: cronologia, centerX: (f.x+f.type.width/2)*CONFIG.TILE_SIZE, centerY: (f.y+f.type.height/2)*CONFIG.TILE_SIZE };
        const investigacao = desenharMovelInvestigacao(this.scene, f);
        if(investigacao)return { graphics:investigacao, centerX:(f.x+f.type.width/2)*CONFIG.TILE_SIZE, centerY:(f.y+f.type.height/2)*CONFIG.TILE_SIZE };
        const hospital = desenharMovelHospital(this.scene, f, CONFIG.TILE_SIZE);
        if (hospital) return { graphics: hospital, centerX: (f.x+f.type.width/2)*CONFIG.TILE_SIZE, centerY: (f.y+f.type.height/2)*CONFIG.TILE_SIZE };
        const px = (f.x + f.type.width / 2) * CONFIG.TILE_SIZE;
        const py = (f.y + f.type.height / 2) * CONFIG.TILE_SIZE;
        const { id, width, height, color } = f.type;
        
        let graphics;
        
        switch (id) {
            case 'desk':
                graphics = this.drawDesk(px, py, width, height, color);
                break;
            case 'cabinet':
                graphics = this.drawCabinet(px, py, width, height, color);
                break;
            case 'bed':
                graphics = this.drawBed(px, py, width, height, color);
                break;
            case 'computer':
                graphics = this.drawComputer(px, py, width, height);
                break;
            case 'car':
                graphics = this.drawCar(px, py, width, height, color);
                break;
            case 'scrap':
                graphics = this.drawScrap(px, py, width, height);
                break;
            case 'barrel':
                graphics = this.drawBarrel(px, py, color, themeName === 'junkyard');
                break;
            case 'fridge':
                graphics = this.drawFridge(px, py, width, height, color, themeName === 'junkyard');
                break;
            case 'console':
                graphics = this.drawConsole(px, py, width, height);
                break;
            case 'bench':
                if (themeName === 'factory') {
                    graphics = this.drawPaintBench(px, py, width, height, color);
                } else {
                    graphics = this.drawDesk(px, py, width, height, color);
                }
                break;
            case 'paint_pot':
                graphics = this.drawPaintPot(px, py);
                break;
            case 'capsule':
                graphics = this.drawCapsule(px, py);
                break;
            case 'generator':
                graphics = this.drawRTG(px, py, width, height);
                break;
            case 'reactor':
                graphics = this.drawReactor(px, py, width, height);
                break;
            case 'machine':
                graphics = this.drawMachine(px, py, width, height, color);
                break;
            case 'tire':
                graphics = this.drawTires(px, py);
                break;
            case 'crate':
                graphics = this.drawCrate(px, py, color);
                break;
            case 'locker':
                graphics = this.drawLocker(px, py, width, height, color);
                break;
            case 'shelf':
                graphics = this.drawShelf(px, py, width, height, color);
                break;
            case 'table':
                graphics = this.drawTable(px, py, width, height, color);
                break;
            case 'cart':
                graphics = this.drawCart(px, py, color);
                break;
            case 'brush_jar':
                graphics = this.drawBrushJar(px, py);
                break;
            case 'dial_tray':
                graphics = this.drawDialTray(px, py, width, height);
                break;
            case 'sink':
                graphics = this.drawSink(px, py);
                break;
            case 'pipe':
                graphics = this.drawPipe(px, py);
                break;
            case 'container':
                graphics = this.drawWasteContainer(px, py);
                break;
            case 'panel':
                graphics = this.drawElectricalPanel(px, py, width, height);
                break;
            case 'debris':
                graphics = this.drawDebris(px, py, width, height);
                break;
            case 'metal':
                graphics = this.drawMetalSheets(px, py, width, height);
                break;
            case 'engine':
                graphics = this.drawEngine(px, py);
                break;
            // NEW FURNITURE TYPES
            case 'microscope':
                graphics = this.drawMicroscope(px, py);
                break;
            case 'centrifuge':
                graphics = this.drawCentrifuge(px, py);
                break;
            case 'biohazard':
                graphics = this.drawBiohazard(px, py);
                break;
            case 'wheelchair':
                graphics = this.drawWheelchair(px, py);
                break;
            case 'iv_stand':
                graphics = this.drawIVStand(px, py);
                break;
            case 'monitor':
                graphics = this.drawHeartMonitor(px, py);
                break;
            case 'defibrillator':
                graphics = this.drawDefibrillator(px, py);
                break;
            case 'oxygen':
                graphics = this.drawOxygenTank(px, py);
                break;
            case 'washer':
                graphics = this.drawWasher(px, py);
                break;
            case 'stove':
                graphics = this.drawStove(px, py);
                break;
            case 'sofa':
                graphics = this.drawSofa(px, py, width, height);
                break;
            case 'tv':
                graphics = this.drawTV(px, py);
                break;
            case 'clock':
                graphics = this.drawClock(px, py);
                break;
            case 'lamp':
                graphics = this.drawLamp(px, py);
                break;
            case 'stool':
                graphics = this.drawStool(px, py);
                break;
            case 'fan':
                graphics = this.drawFan(px, py);
                break;
            case 'tank':
                graphics = this.drawTank(px, py, width, height);
                break;
            case 'crane':
                graphics = this.drawCrane(px, py, width, height);
                break;
            case 'dosimeter':
                graphics = this.drawDosimeter(px, py);
                break;
            case 'suit':
                graphics = this.drawHazmatSuit(px, py);
                break;
            case 'lead_door':
                graphics = this.drawLeadDoor(px, py, width, height);
                break;
            case 'tent':
                graphics = this.drawTent(px, py, width, height);
                break;
            case 'campfire':
                graphics = this.drawCampfire(px, py);
                break;
            case 'log':
                graphics = this.drawLog(px, py, width, height);
                break;
            case 'rock':
                graphics = this.drawRock(px, py);
                break;
            case 'backpack':
                graphics = this.drawBackpack(px, py);
                break;
            case 'rope':
                graphics = this.drawRope(px, py);
                break;
            default:
                graphics = this.drawGeneric(px, py, width, height, color);
        }
        
        return { graphics, centerX: px, centerY: py };
    }
}
