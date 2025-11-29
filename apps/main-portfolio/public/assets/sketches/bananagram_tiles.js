// --- Configuration ---
let GRID_SIZE = 12; // nxn (will be set to 12 in bananagrams mode)
const PADDING_PCT = 0.15; // 15% padding
const BACKGROUND_COLOR = '#3E3025'; // Dark Brown Oat
const TILE_COLOR = '#F3E5AB'; // Vanilla
const TILE_STROKE = '#DCCB96';
const TILE_BORDER_RADIUS = 0;
const LETTER_COLOR = '#2C2416'; // Dark color for letters

// Color map for letters (A-Z each get a unique hue)
const LETTER_COLORS = {};
function initializeLetterColors() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < alphabet.length; i++) {
        let hue = (i / alphabet.length) * 360;
        LETTER_COLORS[alphabet[i]] = hue;
    }
}

// --- Bananagrams Mode ---
let bananagramsMode = true;
let alphabeticMode = true;

// --- Display Toggles ---
let showLetters = true;
let showSquares = true;
let showLines = true;
let useHueColoring = true;
let hiddenLetters = {}; // Track which letters are hidden

// Bananagrams letter distribution (count -> letters)
const BANANAGRAMS_DISTRIBUTION = {
    2: ['J', 'K', 'Q', 'X', 'Z'],
    3: ['B', 'C', 'F', 'H', 'M', 'P', 'V', 'W', 'Y'],
    4: ['G'],
    5: ['L'],
    6: ['D', 'S', 'U'],
    8: ['N'],
    9: ['T', 'R'],
    11: ['O'],
    12: ['I'],
    13: ['A'],
    18: ['E']
};

// Create alphabetically ordered letter sequence from distribution
function createAlphabeticSequence() {
    let sequence = [];
    // Collect all letter-count pairs
    let letterCounts = [];
    for (let count in BANANAGRAMS_DISTRIBUTION) {
        for (let letter of BANANAGRAMS_DISTRIBUTION[count]) {
            letterCounts.push({ letter: letter, count: parseInt(count) });
        }
    }
    // Sort alphabetically
    letterCounts.sort((a, b) => a.letter.localeCompare(b.letter));
    // Build sequence
    for (let item of letterCounts) {
        for (let i = 0; i < item.count; i++) {
            sequence.push(item.letter);
        }
    }
    return sequence;
}

// Create letter pool (letter -> count) from distribution
function createLetterPool() {
    let pool = {};
    for (let count in BANANAGRAMS_DISTRIBUTION) {
        for (let letter of BANANAGRAMS_DISTRIBUTION[count]) {
            pool[letter] = parseInt(count);
        }
    }
    return pool;
}

// Get next letter based on mode
function getNextLetter(letterPool, tileIndex) {
    if (alphabeticMode) {
        // Use alphabetically ordered sequence from distribution
        return letterPool.alphabeticSequence[tileIndex] || null;
    } else {
        // Get a random letter from remaining pool
        let availableLetters = Object.keys(letterPool).filter(letter => 
            letter !== 'alphabeticSequence' && letterPool[letter] > 0
        );
        if (availableLetters.length === 0) return null;
        
        let randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        letterPool[randomLetter]--;
        return randomLetter;
    }
}

// --- Physics Globals ---
let engine;
let world;
let tiles = [];
let walls = [];
let activeConstraint = null; // The tether moving the tile
let activeTile = null;       // The tile currently being interacted with
let initialInertia = 0;      // To restore rotation ability after drag

// --- Tile Class ---
class Tile {
    constructor(x, y, size, letter = null) {
        this.size = size;
        this.letter = letter;

        // Create Physics Body
        // Chamfer creates rounded corners in the physics engine itself
        this.body = Matter.Bodies.rectangle(x, y, size, size, {
            friction: 0.1,      // Low friction so they slide against each other easily
            frictionAir: 0.05,  // Drag in the "air" (simulates table friction)
            restitution: 0.0,   // No bounce
            density: 0.1,       // Heavy enough to assert dominance in collisions
            chamfer: { radius: TILE_BORDER_RADIUS }
        });

        // Add to world
        Matter.Composite.add(world, this.body);
    }

    show() {
        // Check if this letter is hidden
        if (this.letter && hiddenLetters[this.letter]) {
            return; // Don't render this tile at all
        }

        let pos = this.body.position;
        let angle = this.body.angle;

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);

        if (showSquares) {
            // Styling - use letter color if in bananagrams mode and hue coloring is enabled
            if (this.letter && bananagramsMode && useHueColoring) {
                let hue = LETTER_COLORS[this.letter];
                colorMode(HSB, 360, 100, 100);
                fill(hue, 60, 90); // Saturated, bright color
                colorMode(RGB, 255);
            } else {
                fill(TILE_COLOR);
            }
            // stroke(TILE_STROKE);
            noStroke();
            strokeWeight(3);

            // Draw the square
            rect(0, 0, this.size, this.size, TILE_BORDER_RADIUS);
        } else {
            // Just draw a small dot at the center
            fill(LETTER_COLOR);
            noStroke();
            ellipse(0, 0, 8, 8);
        }

        // Draw letter if in bananagrams mode and letters are visible
        if (this.letter && showLetters && showSquares) {
            fill(LETTER_COLOR);
            textAlign(CENTER, CENTER);
            textSize(this.size * 0.6); // Letter takes up 60% of tile
            textStyle(BOLD);
            text(this.letter, 0, 0);
        }

        pop();
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Initialize letter colors
    initializeLetterColors();

    // 1. Setup Matter.js Engine
    engine = Matter.Engine.create();
    world = engine.world;

    // Disable gravity for top-down table view
    engine.gravity.y = 0;

    // CRITICAL FIX FOR OVERLAP:
    // Increase solver iterations to resolve collisions more accurately per step
    engine.positionIterations = 10;
    engine.velocityIterations = 10;

    resetSimulation();
}

function resetSimulation() {
    Matter.Composite.clear(world);
    Matter.Engine.clear(engine);
    tiles = [];
    walls = [];
    hiddenLetters = {}; // Clear hidden letters on reset

    // Set grid size based on mode
    if (bananagramsMode) {
        GRID_SIZE = 12;
    }

    // Calculate Grid Dimensions
    let minDim = min(width, height);
    let availableSpace = minDim * (1 - (PADDING_PCT * 2));
    let tileSize = availableSpace / GRID_SIZE;

    let startX = (width - availableSpace) / 2 + (tileSize / 2);
    let startY = (height - availableSpace) / 2 + (tileSize / 2);

    // Create letter pool for bananagrams mode
    let letterPool = null;
    if (bananagramsMode) {
        if (alphabeticMode) {
            letterPool = { alphabeticSequence: createAlphabeticSequence() };
        } else {
            letterPool = createLetterPool();
        }
    }
    let tileIndex = 0;

    // Create Tiles
    for (let j = 0; j < GRID_SIZE; j++) {
        for (let i = 0; i < GRID_SIZE; i++) {
            let x = startX + (i * tileSize);
            let y = startY + (j * tileSize);
            let letter = bananagramsMode ? getNextLetter(letterPool, tileIndex) : null;
            tiles.push(new Tile(x, y, tileSize - 2, letter));
            tileIndex++;
        }
    }

    // Create Walls
    let wallThick = 500; // Extra thick to prevent fast objects tunneling through
    walls = [
        Matter.Bodies.rectangle(width / 2, -wallThick / 2, width * 3, wallThick, { isStatic: true }),
        Matter.Bodies.rectangle(width / 2, height + wallThick / 2, width * 3, wallThick, { isStatic: true }),
        Matter.Bodies.rectangle(-wallThick / 2, height / 2, wallThick, height * 3, { isStatic: true }),
        Matter.Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 3, { isStatic: true })
    ];
    Matter.Composite.add(world, walls);
}

function draw() {
    background(BACKGROUND_COLOR);

    // CRITICAL FIX FOR OVERLAP: SUB-STEPPING
    // Instead of one big physics update, we do 4 small ones per frame.
    // This catches collisions "in between" frames so objects don't teleport through each other.
    let subSteps = 4;
    for (let i = 0; i < subSteps; i++) {
        Matter.Engine.update(engine, 1000 / 60 / subSteps);
    }

    // Handle Interactions
    handleInteractions();

    // Draw connecting lines (before tiles so they appear underneath)
    if (showLines) {
        drawLetterConnections();
    }

    // Render Tiles
    for (let tile of tiles) {
        tile.show();
    }
}

// Draw lines connecting tiles with the same letter
function drawLetterConnections() {
    // Group tiles by letter
    let letterGroups = {};
    for (let tile of tiles) {
        if (tile.letter && !hiddenLetters[tile.letter]) {
            if (!letterGroups[tile.letter]) {
                letterGroups[tile.letter] = [];
            }
            letterGroups[tile.letter].push(tile);
        }
    }

    // Draw lines between tiles of the same letter
    for (let letter in letterGroups) {
        let group = letterGroups[letter];
        if (group.length < 2) continue; // Need at least 2 tiles to draw a line

        if (bananagramsMode ) {
        let hue = LETTER_COLORS[letter];
        colorMode(HSB, 360, 100, 100);
        stroke(hue, 70, 70); // Same hue, slightly darker
        }
        else { stroke(TILE_COLOR); }
        strokeWeight(2);
        colorMode(RGB, 255);

        // Draw lines from each tile to all other tiles with same letter
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                let pos1 = group[i].body.position;
                let pos2 = group[j].body.position;
                line(pos1.x, pos1.y, pos2.x, pos2.y);
            }
        }
    }
    noStroke();
}

function mousePressed() {
    let bodies = tiles.map(t => t.body);
    let hit = Matter.Query.point(bodies, { x: mouseX, y: mouseY });

    if (hit.length > 0) {
        let body = hit[0];
        
        // Find the corresponding tile to check if it has a letter
        let clickedTile = tiles.find(t => t.body === body);
        
        // If ALT/OPTION key is held, toggle visibility of this letter
        if (keyIsDown(ALT) && clickedTile && clickedTile.letter) {
            let letter = clickedTile.letter;
            hiddenLetters[letter] = !hiddenLetters[letter];
            return; // Don't start dragging/rotating
        }
        
        activeTile = body;
        initialInertia = body.inertia;

        if (!keyIsDown(SHIFT)) {
            // DRAG MODE (PUSH)
            // Lock rotation so it pushes flatly
            Matter.Body.setInertia(body, Infinity);

            let localPoint = {
                x: mouseX - body.position.x,
                y: mouseY - body.position.y
            };

            activeConstraint = Matter.Constraint.create({
                pointA: { x: mouseX, y: mouseY },
                bodyB: body,
                pointB: localPoint,
                stiffness: 0.3, // Lower stiffness prevents "bulldozing" overlap
                damping: 0.05,
                length: 0,
                render: { visible: false }
            });
            Matter.Composite.add(world, activeConstraint);
        }
        // If SHIFT is down, we don't attach a constraint. 
        // We will manually rotate in handleInteractions.
    }
}

function mouseReleased() {
    if (activeTile) {
        // Unlock rotation (restore physics)
        Matter.Body.setInertia(activeTile, initialInertia);
    }
    if (activeConstraint) {
        Matter.Composite.remove(world, activeConstraint);
        activeConstraint = null;
    }
    activeTile = null;
}

function handleInteractions() {
    if (!activeTile) return;

    if (keyIsDown(SHIFT)) {
        // --- ROTATION FIX ---

        // Ensure constraint is gone if we switched to shift mid-drag
        if (activeConstraint) {
            Matter.Composite.remove(world, activeConstraint);
            activeConstraint = null;
        }

        // Ensure physics rotation is unlocked
        if (activeTile.inertia === Infinity) {
            Matter.Body.setInertia(activeTile, initialInertia);
        }

        // 1. Calculate angle from Center to OLD mouse position
        let relPrevX = pmouseX - activeTile.position.x;
        let relPrevY = pmouseY - activeTile.position.y;
        let anglePrev = Math.atan2(relPrevY, relPrevX);

        // 2. Calculate angle from Center to NEW mouse position
        let relCurrX = mouseX - activeTile.position.x;
        let relCurrY = mouseY - activeTile.position.y;
        let angleCurr = Math.atan2(relCurrY, relCurrX);

        // 3. The difference is exactly how much we dragged around the circle
        let deltaAngle = angleCurr - anglePrev;

        // Handle the "wrap around" case (jumping from PI to -PI)
        if (deltaAngle > PI) deltaAngle -= TWO_PI;
        if (deltaAngle < -PI) deltaAngle += TWO_PI;

        // 4. Apply precise rotation
        Matter.Body.setAngle(activeTile, activeTile.angle + deltaAngle);

        // Add a little angular velocity for "feel" (momentum)
        Matter.Body.setAngularVelocity(activeTile, deltaAngle);

    } else {
        // --- DRAG INTERACTION ---
        if (activeConstraint) {
            activeConstraint.pointA = { x: mouseX, y: mouseY };
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    resetSimulation();
}

function keyPressed() {
    // Toggle bananagrams mode with 'B' key
    if (key === 'b' || key === 'B') {
        bananagramsMode = !bananagramsMode;
    }
    // Toggle alphabetic mode with '`' key (for next reset)
    else if (key === '`') {
        alphabeticMode = !alphabeticMode;
        console.log('Alphabetic mode:', alphabeticMode, '(will apply on next reset)');
    }
    // Space to reset
    else if (key === ' ') {
        resetSimulation();
    }
    // ',' to hide/show letters
    else if (key === ',') {
        showLetters = !showLetters;
    }
    // '.' to hide/show squares (show dots instead)
    else if (key === '.') {
        showSquares = !showSquares;
    }
    // '/' to hide/show lines
    else if (key === '/') {
        showLines = !showLines;
    }
    // ';' to toggle hue coloring vs plain vanilla
    else if (key === ';') {
        useHueColoring = !useHueColoring;
    }
}