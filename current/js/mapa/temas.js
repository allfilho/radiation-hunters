// Map themes with colors - REALISTIC for each scenario
export const MAP_THEMES = {
    lab: {
        name: 'University Laboratory',
        floor: 0x3d5a80,      // Lab blue tiles
        wall: 0x293241,       // Dark blue walls
        accent: 0x00ff88,     // Green accent
        corridor: 0x2b3a4a,   // Darker corridor
        special: 0x98c1d9,    // Light blue special areas
    },
    junkyard: {
        name: 'Goiânia Junkyard (1987)',
        floor: 0x3d3530,      // Dirt/dust ground
        wall: 0x5d5550,       // Fence/scrap walls
        accent: 0x00ccff,     // Cs-137 BLUE GLOW!
        corridor: 0x4a4540,   // Paths between scrap
        special: 0x2a2520,    // Contaminated areas
        isJunkyard: true,
    },
    hospital: {
        name: 'Abandoned Hospital',
        floor: 0x4a5d4a,      // Old green hospital tiles
        wall: 0x2d3830,       // Weathered walls
        accent: 0x00ffff,     // Cyan accent
        corridor: 0x3a4a3d,   // Dark corridor
        special: 0x1a2a1a,    // Treatment room
        decay: true,          // Show decay/damage
    },
    factory: {
        name: 'Radium Dial Factory (1920s)',
        floor: 0x4a3d2d,      // Old wooden floor
        wall: 0x2d2520,       // Brick walls
        accent: 0x88ff88,     // Radium green glow!
        corridor: 0x3a3025,   // Dark walkway
        special: 0x5d4a3a,    // Workstation areas
        hasWindows: true,     // Windows with light
    },
    nuclear: {
        name: 'Chernobyl Exclusion Zone',
        floor: 0x2d3436,      // Concrete
        wall: 0x1a1d1e,       // Damaged concrete
        accent: 0xff3333,     // Danger red
        corridor: 0x222526,   // Dark corridor
        special: 0xff6600,    // Reactor core area (DANGER!)
        reactorZone: true,    // Has concentrated source zone
    },
    bunker: {
        name: 'Georgian Forest / RTG Site',
        floor: 0x2d4a2d,      // Forest floor / grass
        wall: 0x5d4a3a,       // Tree trunks / rocks
        accent: 0xff00ff,     // RTG glow
        corridor: 0x3a5a3a,   // Forest path
        special: 0x4a3d2d,    // Camp area
        outdoor: true,        // Outdoor map
    },
};
