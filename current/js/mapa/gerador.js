import { FURNITURE_TYPES } from '../data/moveis.js';
import { MOVEIS_INVESTIGACAO } from '../render/mobiliario-investigacao.js';
import { MOVEIS_CRONOLOGIA } from '../render/mobiliario-cronologia.js';
import { MOVEIS_HOSPITAL } from '../render/mobiliario-hospital.js';
import { MAP_THEMES } from './temas.js';
import { desenharAcademia, mobiliarAcademia } from './academia.js';
import { desenharPlanta } from './plantas-investigacao.js';
import { randomRange, shuffleArray } from '../util.js';

// ============================================
// MAP GENERATOR - THEMED REALISTIC MAPS
// ============================================
export class MapGenerator {
    constructor(cols, rows, themeName, mission = null) {
        this.cols = cols;
        this.rows = rows;
        this.themeName = themeName;
        this.theme = MAP_THEMES[themeName] || MAP_THEMES.lab;
        if(mission?.hospitalAtivo)this.theme={...this.theme,decay:false,hospitalAtivo:true};
        this.mission = mission;
        this.map = [];
        this.furniturePositions = [];
        this.playerStart = { x: 2, y: 2 };
        this.reactorPosition = null; // For Chernobyl map
        this.specialZones = []; // Areas with special meaning
    }
    
    generate() {
        // Initialize with floors
        this.map = Array.from({ length: this.rows }, () => 
            Array.from({ length: this.cols }, () => 0)
        );
        
        // Add border walls
        for (let x = 0; x < this.cols; x++) {
            this.map[0][x] = 1;
            this.map[this.rows - 1][x] = 1;
        }
        for (let y = 0; y < this.rows; y++) {
            this.map[y][0] = 1;
            this.map[y][this.cols - 1] = 1;
        }
        
        // Generate theme-specific map
        const planta = this.mission?.investigacaoCampo?.planta || this.mission?.planta || null;
        if (planta) {
            desenharPlanta(this, planta);
            if (planta.reator) {   // missões com reator (Chernobyl, Fukushima): marca o núcleo e a zona de perigo
                this.reactorPosition = { ...planta.reator };
                this.specialZones.push({ ...planta.reator, type: 'reactor', name: 'Damaged Reactor Core' });
            }
        } else if (this.mission && this.mission.layout === 'academia') {
            desenharAcademia(this);
        } else switch (this.themeName) {
            case 'lab':
                this.generateLabMap();
                break;
            case 'junkyard':
                this.generateJunkyardMap();
                break;
            case 'hospital':
                this.generateHospitalMap();
                break;
            case 'factory':
                this.generateFactoryMap();
                break;
            case 'nuclear':
                this.generateNuclearMap();
                break;
            case 'bunker':
                this.generateForestMap();
                break;
            default:
                this.generateRooms();
        }
        
        if(this.mission?.hospitalAtivo)this.specialZones=[];

        // Add furniture
        if (this.mission && this.mission.layout === 'academia') mobiliarAcademia(this, FURNITURE_TYPES.lab);
        else if(planta?.moveis||this.mission?.investigacaoCampo?.moveis){
            // missões de caça (planta própria): os móveis do tema vêm primeiro (ids repetidos entre temas); investigações: ordem original
            const tipos=this.mission?.planta?[...(FURNITURE_TYPES[this.themeName]||[]),...MOVEIS_INVESTIGACAO,...Object.values(FURNITURE_TYPES).flat()]:[...MOVEIS_INVESTIGACAO,...MOVEIS_CRONOLOGIA,...MOVEIS_HOSPITAL,...Object.values(FURNITURE_TYPES).flat()];
            for(const [id,x,y] of (planta?.moveis||this.mission.investigacaoCampo.moveis)){
                const tipo=tipos.find(t=>t.id===id);
                if(!tipo||!this.tryPlace(tipo,x,y))throw new Error('Móvel investigativo inválido ou obstruído: '+id+' '+x+','+y);
            }
        }else this.placeFurniture();
        
        // Find player start position
        this.findPlayerStart();
        
        return {
            map: this.map,
            furniture: this.furniturePositions,
            playerStart: this.playerStart,
            theme: this.theme,
            themeName: this.themeName,
            reactorPosition: this.reactorPosition,
            specialZones: this.specialZones,
            salas: this.salas || null,
            portas: this.portas || [],
            chavesSpec: this.chavesSpec || [],
        };
    }
    
    // LAB: Clean university laboratory - FIXED SUBROOMS
    generateLabMap() {
        // Create 3x2 grid of lab rooms
        for (let y = 1; y < this.rows - 1; y++) {
            this.map[y][8] = 1;
            this.map[y][16] = 1;
        }
        for (let x = 1; x < this.cols - 1; x++) {
            this.map[8][x] = 1;
        }

        // Doors
        this.addDoor(8, 4);
        this.addDoor(8, 11);
        this.addDoor(16, 6);
        this.addDoor(16, 12);
        this.addDoor(4, 8);
        this.addDoor(12, 8);
        this.addDoor(19, 8);
    }
    
    // JUNKYARD: Goiânia scrapyard where Cs-137 was opened - FIXED YARDS
    generateJunkyardMap() {
        // Fenced yards for realism
        this.addRoom(2, 2, 7, 5, 'Car Yard');
        this.addRoom(14, 2, 7, 5, 'Appliance Yard');
        this.addRoom(2, 9, 7, 5, 'Scrap Sorting');
        this.addRoom(14, 9, 7, 5, 'Work Shed');

        this.addDoor(5, 7);
        this.addDoor(17, 7);
        this.addDoor(5, 9);
        this.addDoor(17, 9);

        this.specialZones.push({
            x: 14, y: 9,
            width: 7, height: 5,
            type: 'danger',
            name: 'Work Shed - Capsule Opening Site'
        });
    }
    
    // HOSPITAL: Abandoned clinic with treatment rooms - FIXED SUBROOMS
    generateHospitalMap() {
        // Central corridor divider
        for (let x = 1; x < this.cols - 1; x++) {
            this.map[7][x] = 1;
        }
        this.addDoor(4, 7);
        this.addDoor(12, 7);
        this.addDoor(20, 7);

        // Room dividers (top and bottom wings)
        for (let y = 1; y < 7; y++) {
            this.map[y][7] = 1;
            this.map[y][16] = 1;
        }
        for (let y = 8; y < this.rows - 1; y++) {
            this.map[y][7] = 1;
            this.map[y][16] = 1;
        }

        this.addDoor(7, 4);
        this.addDoor(16, 4);
        this.addDoor(7, 11);
        this.addDoor(16, 11);

        this.specialZones.push({
            x: 2, y: 9,
            width: 5, height: 5,
            type: 'danger',
            name: 'Old Radiotherapy Unit'
        });
    }
    
    // FACTORY: 1920s watch dial painting factory (Radium Girls) - FIXED SUBROOMS
    generateFactoryMap() {
        // Office, storage, and wash room
        this.addRoom(16, 2, 6, 4, "Supervisor's Office");
        this.addRoom(2, 2, 5, 4, 'Radium Paint Storage');
        this.addRoom(2, 10, 5, 4, 'Wash Room');
        // Workrooms
        this.addRoom(8, 2, 6, 5, 'Workroom A');
        this.addRoom(8, 9, 6, 5, 'Workroom B');

        this.addDoor(16, 4);
        this.addDoor(4, 2);
        this.addDoor(4, 10);
        this.addDoor(8, 4);
        this.addDoor(14, 4);
        this.addDoor(8, 11);
        this.addDoor(14, 11);

        this.specialZones.push({
            x: 2, y: 2, width: 5, height: 4,
            type: 'contaminated', name: 'Radium Paint Storage'
        });
    }
    
    // NUCLEAR: Chernobyl exclusion zone - REACTOR IN CENTER - FIXED ROOMS
    generateNuclearMap() {
        // Central reactor area (open, marked as danger zone)
        const reactorX = Math.floor(this.cols / 2) - 2;
        const reactorY = Math.floor(this.rows / 2) - 2;
        
        this.reactorPosition = { 
            x: reactorX, y: reactorY, 
            width: 4, height: 4 
        };
        this.specialZones.push({
            x: reactorX, y: reactorY,
            width: 4, height: 4,
            type: 'reactor',
            name: 'Damaged Reactor Core'
        });
        
        // Control room, turbine hall, service tunnel, storage
        this.addRoom(2, 2, 6, 4, 'Control Room');
        this.addRoom(15, 2, 7, 4, 'Turbine Hall');
        this.addRoom(2, 9, 6, 5, 'Service Tunnel');
        this.addRoom(15, 9, 7, 5, 'Waste Storage');

        this.addDoor(6, 6);
        this.addDoor(18, 6);
        this.addDoor(6, 9);
        this.addDoor(18, 9);
    }
    
    // BUNKER/FOREST: Georgian forest with RTG (Lia case) - FIXED CAMP AREAS
    generateForestMap() {
        // Small huts and fenced areas for realism
        this.addRoom(2, 2, 6, 4, 'Hunting Cabin');
        this.addRoom(15, 2, 7, 4, 'Supply Cage');
        this.addRoom(14, 9, 7, 4, 'RTG Site');
        this.addRoom(8, 6, 6, 4, 'Camp');

        this.addDoor(5, 2);
        this.addDoor(18, 2);
        this.addDoor(17, 9);
        this.addDoor(8, 8);
        this.addDoor(13, 7);

        this.specialZones.push({
            x: 14, y: 9,
            width: 7, height: 4,
            type: 'camp',
            name: "Hunter's Camp"
        });
    }
    
    addRoom(x, y, width, height, name = '') {
        // Add walls around room
        for (let dy = 0; dy <= height; dy++) {
            for (let dx = 0; dx <= width; dx++) {
                const px = x + dx;
                const py = y + dy;
                if (px >= 0 && px < this.cols && py >= 0 && py < this.rows) {
                    if (dy === 0 || dy === height || dx === 0 || dx === width) {
                        this.map[py][px] = 1;
                    }
                }
            }
        }
    }
    
    addDoor(x, y) {
        if (x > 0 && x < this.cols - 1 && y > 0 && y < this.rows - 1) {
            this.map[y][x] = 0;
        }
    }

    isDoorTile(x, y) {
        if (x <= 0 || x >= this.cols - 1 || y <= 0 || y >= this.rows - 1) return false;
        if (this.map[y][x] !== 0) return false;

        const up = this.map[y - 1][x] === 1;
        const down = this.map[y + 1][x] === 1;
        const left = this.map[y][x - 1] === 1;
        const right = this.map[y][x + 1] === 1;

        return (up && down) || (left && right);
    }

    isNearDoor(x, y) {
        if (this.isDoorTile(x, y)) return true;
        return (
            this.isDoorTile(x - 1, y) ||
            this.isDoorTile(x + 1, y) ||
            this.isDoorTile(x, y - 1) ||
            this.isDoorTile(x, y + 1)
        );
    }
    
    generateRooms() {
        // Fallback: Create a simple room layout
        const roomCount = randomRange(2, 4);
        
        for (let i = 0; i < roomCount; i++) {
            const vertical = Math.random() > 0.5;
            
            if (vertical) {
                const x = randomRange(4, this.cols - 5);
                const startY = randomRange(2, 4);
                const endY = randomRange(this.rows - 5, this.rows - 3);
                
                for (let y = startY; y <= endY; y++) {
                    if (Math.random() > 0.25) {
                        this.map[y][x] = 1;
                    }
                }
                
                const doorY = randomRange(startY + 1, endY - 1);
                this.map[doorY][x] = 0;
            } else {
                const y = randomRange(4, this.rows - 5);
                const startX = randomRange(2, 4);
                const endX = randomRange(this.cols - 5, this.cols - 3);
                
                for (let x = startX; x <= endX; x++) {
                    if (Math.random() > 0.25) {
                        this.map[y][x] = 1;
                    }
                }
                
                const doorX = randomRange(startX + 1, endX - 1);
                this.map[y][doorX] = 0;
            }
        }
    }
    
    placeFurniture() {
        // Get furniture types for this theme
        const furnitureList = FURNITURE_TYPES[this.themeName] || FURNITURE_TYPES.lab;
        
        // Organize furniture placement based on theme
        switch (this.themeName) {
            case 'lab':
                this.placeLabFurniture(furnitureList);
                break;
            case 'junkyard':
                this.placeJunkyardFurniture(furnitureList);
                break;
            case 'factory':
                this.placeFactoryFurniture(furnitureList);
                break;
            case 'hospital':
                this.placeHospitalFurniture(furnitureList);
                break;
            case 'nuclear':
                this.placeNuclearFurniture(furnitureList);
                break;
            case 'bunker':
                this.placeBunkerFurniture(furnitureList);
                break;
            default:
                this.placeGenericFurniture(furnitureList);
        }
    }
    
    // Helper: place furniture at specific position
    addFurniture(type, x, y) {
        if (!this.canPlaceFurniture(x, y, type.width, type.height)) return false;
        
        const furn = { x, y, type, hasSource: false, source: null };
        this.furniturePositions.push(furn);
        
        for (let dy = 0; dy < type.height; dy++) {
            for (let dx = 0; dx < type.width; dx++) {
                if (y + dy < this.rows && x + dx < this.cols) {
                    this.map[y + dy][x + dx] = 2;
                }
            }
        }
        return true;
    }
    
    // Helper: get furniture type by id
    getFurnType(list, id) {
        return list.find(f => f.id === id) || list[0];
    }
    
    // Helper: add small random offset to positions (keeps organization but adds variety)
    rndOffset(base, range = 1) {
        return base + randomRange(-range, range);
    }
    
    // Helper: place furniture at exact position
    tryPlace(type, x, y) {
        const clampedX = Math.max(1, Math.min(this.cols - 1 - type.width, x));
        const clampedY = Math.max(1, Math.min(this.rows - 1 - type.height, y));
        return this.addFurniture(type, clampedX, clampedY);
    }
    
    // =========================================================================
    // LAB: University research laboratory - well organized
    // Furniture placed inside fixed subrooms
    // =========================================================================
    placeLabFurniture(list) {
        const desk = this.getFurnType(list, 'desk');
        const cabinet = this.getFurnType(list, 'cabinet');
        const computer = this.getFurnType(list, 'computer');
        const fridge = this.getFurnType(list, 'fridge');
        const machine = this.getFurnType(list, 'machine');
        const shelf = this.getFurnType(list, 'shelf');
        const microscope = this.getFurnType(list, 'microscope');
        const centrifuge = this.getFurnType(list, 'centrifuge');
        const sink = this.getFurnType(list, 'sink');
        const biohazard = this.getFurnType(list, 'biohazard');
        
        // TOP-LEFT ROOM (workstations) - along walls
        this.tryPlace(desk, 1, 1);
        this.tryPlace(computer, 4, 1);
        this.tryPlace(microscope, 1, 6);
        this.tryPlace(cabinet, 7, 5);
        
        // TOP-MIDDLE ROOM (equipment) - along top wall
        this.tryPlace(centrifuge, 9, 1);
        this.tryPlace(machine, 13, 1);
        this.tryPlace(desk, 9, 6);
        this.tryPlace(computer, 13, 6);
        
        // TOP-RIGHT ROOM (storage) - against walls
        this.tryPlace(shelf, 17, 1);
        this.tryPlace(cabinet, 22, 1);
        this.tryPlace(fridge, 17, 5);
        this.tryPlace(shelf, 21, 6);
        
        // BOTTOM-LEFT ROOM (sink & biohazard) - along walls
        this.tryPlace(sink, 1, 9);
        this.tryPlace(biohazard, 7, 9);
        this.tryPlace(cabinet, 1, 13);
        
        // BOTTOM-MIDDLE ROOM (computers) - along top wall
        this.tryPlace(computer, 9, 9);
        this.tryPlace(computer, 13, 9);
        this.tryPlace(desk, 9, 13);
        
        // BOTTOM-RIGHT ROOM (storage) - against walls
        this.tryPlace(shelf, 17, 9);
        this.tryPlace(cabinet, 22, 9);
        this.tryPlace(shelf, 21, 13);
    }
    
    // =========================================================================
    // JUNKYARD: Goiânia scrapyard
    // Furniture placed inside fenced yards
    // =========================================================================
    placeJunkyardFurniture(list) {
        const car = this.getFurnType(list, 'car');
        const scrap = this.getFurnType(list, 'scrap');
        const barrel = this.getFurnType(list, 'barrel');
        const capsule = this.getFurnType(list, 'capsule');
        const fridge = this.getFurnType(list, 'fridge');
        const tire = this.getFurnType(list, 'tire');
        const metal = this.getFurnType(list, 'metal');
        const engine = this.getFurnType(list, 'engine');
        const bench = this.getFurnType(list, 'bench');
        const washer = this.getFurnType(list, 'washer');
        const stove = this.getFurnType(list, 'stove');
        const sofa = this.getFurnType(list, 'sofa');
        const tv = this.getFurnType(list, 'tv');
        
        // CAR YARD (top-left room) - along walls
        this.tryPlace(car, 3, 3);
        this.tryPlace(car, 6, 4);
        this.tryPlace(tire, 3, 6);
        
        // APPLIANCE YARD (top-right room) - along walls
        this.tryPlace(fridge, 15, 3);
        this.tryPlace(stove, 20, 3);
        this.tryPlace(washer, 20, 5);
        this.tryPlace(tv, 15, 6);
        
        // SCRAP SORTING (bottom-left room) - along walls
        this.tryPlace(scrap, 3, 10);
        this.tryPlace(scrap, 7, 10);
        this.tryPlace(metal, 3, 13);
        this.tryPlace(engine, 8, 13);
        this.tryPlace(bench, 3, 12);
        
        // WORK SHED (bottom-right room) - along walls
        this.tryPlace(capsule, 15, 10);
        this.tryPlace(barrel, 20, 10);
        this.tryPlace(engine, 20, 13);
        this.tryPlace(scrap, 15, 13);
        
        // CENTER OPEN AREA (few items near walls)
        this.tryPlace(sofa, 9, 7);
    }
    
    // =========================================================================
    // FACTORY: Radium dial painting factory (1920s)
    // Furniture placed inside fixed subrooms
    // =========================================================================
    placeFactoryFurniture(list) {
        const bench = this.getFurnType(list, 'bench');
        const paintPot = this.getFurnType(list, 'paint_pot');
        const brushJar = this.getFurnType(list, 'brush_jar');
        const dialTray = this.getFurnType(list, 'dial_tray');
        const cabinet = this.getFurnType(list, 'cabinet');
        const sink = this.getFurnType(list, 'sink');
        const locker = this.getFurnType(list, 'locker');
        const shelf = this.getFurnType(list, 'shelf');
        const clock = this.getFurnType(list, 'clock');
        const lamp = this.getFurnType(list, 'lamp');
        const stool = this.getFurnType(list, 'stool');
        const fan = this.getFurnType(list, 'fan');
        
        // STORAGE ROOM (top-left) - along walls
        this.tryPlace(cabinet, 3, 3);
        this.tryPlace(shelf, 5, 3);
        this.tryPlace(paintPot, 6, 5);
        
        // OFFICE (top-right) - along walls
        this.tryPlace(clock, 17, 3);
        this.tryPlace(cabinet, 19, 3);
        this.tryPlace(lamp, 21, 5);
        
        // WORKROOM A (top-middle) - along walls
        this.tryPlace(bench, 9, 3);
        this.tryPlace(paintPot, 13, 3);
        this.tryPlace(stool, 9, 6);
        this.tryPlace(brushJar, 13, 6);
        this.tryPlace(dialTray, 12, 5);
        this.tryPlace(lamp, 13, 5);
        
        // WORKROOM B (bottom-middle) - along walls
        this.tryPlace(bench, 9, 10);
        this.tryPlace(paintPot, 13, 10);
        this.tryPlace(stool, 9, 13);
        this.tryPlace(brushJar, 13, 13);
        this.tryPlace(dialTray, 11, 12);
        this.tryPlace(lamp, 13, 12);
        
        // LOCKERS (inside workroom B along wall)
        this.tryPlace(locker, 9, 11);
        this.tryPlace(locker, 13, 11);
        
        // WASH ROOM (bottom-left) - along walls
        this.tryPlace(sink, 3, 11);
        this.tryPlace(brushJar, 6, 13);
        
        // FAN & STORAGE (right side) - along walls
        this.tryPlace(fan, 20, 9);
        this.tryPlace(shelf, 18, 12);
        this.tryPlace(dialTray, 20, 11);
    }
    
    // =========================================================================
    // HOSPITAL: Abandoned radiotherapy clinic
    // Furniture placed inside fixed subrooms
    // =========================================================================
    placeHospitalFurniture(list) {
        if(this.mission?.hospitalAtivo){
            // Dimensões/colisões continuam nas mesmas APIs e salas do hospital original.
            for(const [id,x,y] of [
                ['reception_desk',1,1],['waiting_seats',1,6],['wheelchair',6,1],
                ['xray_unit',9,1],['wall_detector',14,2],['image_console',13,6],
                ['learning_board',18,1],['display_case',20,5],
                ['staff_sink',1,9],['locker',5,9],['bed',1,13],
                ['school_mural',9,9],['work_table',13,13],
                ['gamma_camera',18,9],['image_console',20,13]
            ])this.tryPlace([...MOVEIS_HOSPITAL,...list].find(m=>m.id===id),x,y);
            return;
        }
        const bed = this.getFurnType(list, 'bed');
        const cart = this.getFurnType(list, 'cart');
        const machine = this.getFurnType(list, 'machine');
        const table = this.getFurnType(list, 'table');
        const cabinet = this.getFurnType(list, 'cabinet');
        const locker = this.getFurnType(list, 'locker');
        const wheelchair = this.getFurnType(list, 'wheelchair');
        const iv_stand = this.getFurnType(list, 'iv_stand');
        const monitor = this.getFurnType(list, 'monitor');
        const defibrillator = this.getFurnType(list, 'defibrillator');
        const oxygen = this.getFurnType(list, 'oxygen');
        
        // TOP-LEFT ROOM (patient) - along walls
        this.tryPlace(bed, 1, 1);
        this.tryPlace(iv_stand, 6, 1);
        this.tryPlace(monitor, 1, 6);
        
        // TOP-MIDDLE ROOM (equipment) - along walls
        this.tryPlace(cabinet, 9, 1);
        this.tryPlace(cart, 14, 1);
        this.tryPlace(defibrillator, 9, 6);
        
        // TOP-RIGHT ROOM (storage) - along walls
        this.tryPlace(cabinet, 18, 1);
        this.tryPlace(oxygen, 22, 3);
        this.tryPlace(locker, 18, 5);
        
        // BOTTOM-LEFT ROOM (radiotherapy) - along walls
        this.tryPlace(machine, 1, 9);
        this.tryPlace(table, 5, 9);
        this.tryPlace(monitor, 1, 13);
        
        // BOTTOM-MIDDLE ROOM (patient) - along walls
        this.tryPlace(bed, 9, 9);
        this.tryPlace(cart, 14, 9);
        this.tryPlace(iv_stand, 9, 13);
        
        // BOTTOM-RIGHT ROOM (staff/storage) - along walls
        this.tryPlace(locker, 18, 9);
        this.tryPlace(cabinet, 22, 9);
        this.tryPlace(wheelchair, 18, 13);
    }
    
    // =========================================================================
    // NUCLEAR: Chernobyl-style reactor building
    // Furniture placed inside fixed subrooms
    // =========================================================================
    placeNuclearFurniture(list) {
        const reactor = this.getFurnType(list, 'reactor');
        const controlConsole = this.getFurnType(list, 'console');
        const pipe = this.getFurnType(list, 'pipe');
        const container = this.getFurnType(list, 'container');
        const panel = this.getFurnType(list, 'panel');
        const machine = this.getFurnType(list, 'machine');
        const tank = this.getFurnType(list, 'tank');
        const crane = this.getFurnType(list, 'crane');
        const dosimeter = this.getFurnType(list, 'dosimeter');
        const suit = this.getFurnType(list, 'suit');
        const lead_door = this.getFurnType(list, 'lead_door');
        
        // REACTOR in center (special placement)
        if (this.reactorPosition) {
            const rf = { 
                x: this.reactorPosition.x, 
                y: this.reactorPosition.y, 
                type: reactor, 
                hasSource: false, 
                source: null,
                isReactor: true 
            };
            this.furniturePositions.push(rf);
            for (let dy = 0; dy < reactor.height; dy++) {
                for (let dx = 0; dx < reactor.width; dx++) {
                    this.map[rf.y + dy][rf.x + dx] = 2;
                }
            }
        }
        
        // CONTROL ROOM (top-left) - along walls
        this.tryPlace(controlConsole, 3, 3);
        this.tryPlace(panel, 7, 3);
        this.tryPlace(dosimeter, 3, 5);
        
        // TURBINE HALL (top-right) - along walls
        this.tryPlace(crane, 16, 3);
        this.tryPlace(panel, 21, 3);
        this.tryPlace(suit, 21, 5);
        
        // SERVICE TUNNEL (bottom-left) - along walls
        this.tryPlace(machine, 3, 10);
        this.tryPlace(tank, 6, 10);
        this.tryPlace(controlConsole, 3, 13);
        
        // WASTE STORAGE (bottom-right) - along walls
        this.tryPlace(container, 16, 10);
        this.tryPlace(container, 21, 10);
        this.tryPlace(tank, 16, 13);
        
        // AROUND REACTOR: Pipes
        if (this.reactorPosition) {
            this.tryPlace(pipe, this.reactorPosition.x - 2, this.reactorPosition.y);
            this.tryPlace(pipe, this.reactorPosition.x + 4, this.reactorPosition.y);
            this.tryPlace(pipe, this.reactorPosition.x - 2, this.reactorPosition.y + 2);
            this.tryPlace(pipe, this.reactorPosition.x + 4, this.reactorPosition.y + 2);
        }
        
        // LEAD DOOR (south corridor)
        this.tryPlace(lead_door, 11, 13);
    }
    
    // =========================================================================
    // BUNKER: Georgian forest with abandoned RTG
    // Furniture placed inside fixed camp areas
    // =========================================================================
    placeBunkerFurniture(list) {
        const rtg = this.getFurnType(list, 'generator');
        const crate = this.getFurnType(list, 'crate');
        const barrel = this.getFurnType(list, 'barrel');
        const table = this.getFurnType(list, 'table');
        const cabinet = this.getFurnType(list, 'cabinet');
        const debris = this.getFurnType(list, 'debris');
        const tent = this.getFurnType(list, 'tent');
        const campfire = this.getFurnType(list, 'campfire');
        const log = this.getFurnType(list, 'log');
        const rock = this.getFurnType(list, 'rock');
        const backpack = this.getFurnType(list, 'backpack');
        const rope = this.getFurnType(list, 'rope');
        
        // HUNTING CABIN (top-left) - along walls
        this.tryPlace(table, 3, 3);
        this.tryPlace(cabinet, 6, 3);
        this.tryPlace(backpack, 3, 5);
        
        // SUPPLY CAGE (top-right) - along walls
        this.tryPlace(crate, 16, 3);
        this.tryPlace(barrel, 21, 3);
        this.tryPlace(rope, 21, 5);
        
        // CENTRAL CAMP (camp room) - along walls
        this.tryPlace(tent, 9, 7);
        this.tryPlace(campfire, 13, 7);
        this.tryPlace(log, 9, 9);
        this.tryPlace(log, 12, 9);
        
        // RTG SITE (bottom-right) - along walls
        this.tryPlace(rtg, 15, 10);
        this.tryPlace(debris, 19, 10);
        this.tryPlace(rock, 20, 12);
        
        // EXTRA NATURAL ELEMENTS (open area near walls)
        this.tryPlace(rock, 1, 13);
        this.tryPlace(debris, 6, 14);
        this.tryPlace(backpack, 10, 13);
    }
    
    // =========================================================================
    // GENERIC: Fallback for unknown themes
    // =========================================================================
    placeGenericFurniture(list) {
        const count = Math.min(list.length * 2, 16);
        const shuffledList = shuffleArray([...list]);
        
        for (let i = 0; i < count; i++) {
            const type = shuffledList[i % shuffledList.length];
            let placed = false;
            
            // Random placement with multiple attempts
            for (let attempt = 0; attempt < 30 && !placed; attempt++) {
                const x = randomRange(2, this.cols - 2 - type.width);
                const y = randomRange(2, this.rows - 2 - type.height);
                if (this.addFurniture(type, x, y)) placed = true;
            }
        }
    }
    
    canPlaceFurniture(x, y, width, height) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const checkX = x + dx;
                const checkY = y + dy;
                
                if (checkX < 0 || checkX >= this.cols || 
                    checkY < 0 || checkY >= this.rows) {
                    continue;
                }
                
                if (this.map[checkY][checkX] !== 0) {
                    return false;
                }

                if (this.isNearDoor(checkX, checkY)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    findPlayerStart() {
        if (this.playerStartFixo) { this.playerStart = this.playerStartFixo; return; }
        // Find a free floor tile near the entrance (left side usually)
        for (let x = 2; x < this.cols - 2; x++) {
            for (let y = 2; y < this.rows - 2; y++) {
                if (this.map[y][x] === 0) {
                    this.playerStart = { x, y };
                    return;
                }
            }
        }
    }
}
