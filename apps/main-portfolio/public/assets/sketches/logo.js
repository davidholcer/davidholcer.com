/**
 * @author David Holcer (@vadth)
 * @date Sep. 2021
 * @description 
*/

console.log(" __    __ ______   _____    ______  __  __\n\
/\\ \\  / //\\  __ \\ /\\  __-. /\\__  _\\/\\ \\_\\ \\\n\
\\ \\ \\/ / \\ \\  __ \\\\ \\ \\/\\ \\\\/_/\\ \\/\\ \\  __ \\\n\
 \\ \\__/   \\ \\_\\ \\_\\\\ \\____-   \\ \\_\\ \\ \\_\\ \\_\\\n\
  \\/_/     \\/_/\\/_/ \\/____/    \\/_/  \\/_/\\/_/\n\n")

// **************************
// *    HIC ET NUNC DATA    *
// **************************
const DEFAULT_ADDRESS = "tz1hjsJLB4iX74cJ8zsemWY7K2mobWBzmee3";
const DEFAULTSEED = getHash(DEFAULT_ADDRESS);
let viewerSeed = DEFAULTSEED;

const creator = new URLSearchParams(window.location.search).get("creator");
const viewer = new URLSearchParams(window.location.search).get("viewer");
// const viewer=DEFAULT_ADDRESS;
const objkt = new URLSearchParams(window.location.search).get("objkt");
// console.log("NFT created by", creator); // null if local
console.log("NFT viewed by:", viewer); // null if local
console.log("OBJKT ID:", objkt); // null if local

// const DUMMY = "tz1hjsJLB4iX74cJ8zsemWY7K2mobWBzmee3"; // simulate a synced viewer (user a different address to try another viewer)
// const UNSYNCED = "false"; // simulate an unsynced user
// const PREVIEW_OBJKT = "false"; // simulate the preview page
// const DUMMY_OBJKT = 67954; // simulate an OBJKT ID

let viewerData = viewer;
let creatorData = creator;
let objktData = objkt;
let viewerWasFound = viewerData && !viewerData.includes("false");
let useRandomSeed = true;

// Set this to true when minting
p5.disableFriendlyErrors = true;

// The title of your piece goes here (not visible on hicetnunc)
document.title = ""
let description = ""

// **************************
// *        CONCEPT       *
// **************************
/*
Create an interesting way to show the passage of time/explore with the geometry
of 
*/

// **************************
// *        VARIABLES       *
// **************************
let bgColor;
let grainAmt, nL, grains;
let colorScheme;
let cR;
let numCircles;
let t;
let circles;
let iTheta;


function setup() {
    createCanvas(windowWidth, windowHeight);
    console.log('Screen Dimensions: ' + width + 'px x ' + height + 'px');
    sLength = min(windowWidth, windowHeight);
    maxLength = max(windowWidth, windowHeight);
    wRadius = sLength * 0.4;

    initSeeds();
    describe(description);

    // colorMode(HSL, 360, 100, 100, 1); // set once in setup()

    frameRate(60);

    bgLight = color('#F2F4F3');
    //dark
    bgDark = color('#0d0b0c');

    // vintage white 1
    vw1 = color('#F2F4F3');
    // vintage white 2 (barely manilla)
    vw2 = color('#E2E0DC');
    // vintage white 3 (somewhat manilla)
    vw3 = color('#DFDDD3');
    // vintage white 4 (slightly more manilla)
    vw4 = color('#E1D9CB');
    // vintage white 5 (more manilla)
    vw5 = color('#DCD5C1');

    colorScheme = {
        'Techno Vanilla': ['#333333', '#666A86', '#FF6700', '#E8DDB5'],
        'Retro Rainbow': ['#238DA5', '#599D6B', '#FDBC2E', '#C84A4D', '#2A303E'],
        'Halloween': ['#FA8334', '#1E3888', '#191308', '#C45AB3', '#89937C'],
        'Cooltone': ['#0081A7', '#00AFB9', '#291F1E', '#FED9B7', '#F07167'],
        'Salmon Blues': ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F'],
        'Gold Wine': ['#5F0F40', '#9A031E', '#FB8B24', '#E36414', '#0F4C5C'],
        'Japonica': ['#c9cba3', '#ffe1a8', '#e26d5c', '#723d46', '#472d30'],
        'Minimal Ice': ['#dd6e42', '#e8dab2', '#4f6d7a', '#c0d6df', '#eaeaea'],
        'Vintage Fire': ['#001219', '#005F73', '#0A9396', '#94D2BD', '#E9D8A6', '#EE9B00', '#CA6702', '#BB3E03', '#AE2012', '#9B2226'],
        'Flame Pea': ['#ee4a1b', '#61d5d4', '#3e73a2', '#bebc9e', '#060b0a'],
        'Jaguar Lavender': ["#e3170a", "#2a2b2a", "#fdb833", "#7d8491", "#c04cfd"],
        'Mandalay Glacier': ["#4f345a", "#e59500", "#7ebdc3", "#e3879e", "#f25c54"],
        'Pastel Tabasco': ['#F0B700', '#373000', '#E76C00', '#BA0000', '#CFCFC5'],
        'Guacamole': ['#85ADB3', '#BBBF45', '#A2A641', '#E7D7AD', '#BF544B'],
        'Blue Honey': ['#ABCEC0', '#F6DEB0', '#FFA034', '#26839C', '#252A2B'],
        'Red Pill Blue Pill': ['#2f4858', '#85adb3', '#e7d7ad', '#bf544b', '#2f4858'],
        'Purple Cabbage': ['#8C6582', '#8C5483', '#73246D', '#E3D3E4', '#3B0127'],
        'Highlighters': ['#565552', '#F9D400', '#FF721B', '#FF483A', '#3FD5E5'],
        'Grayscale': ['#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999', '#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd', '#eeeeee', '#ffffff'],
        'logo': ['#a7e038', '#00aa73', '#7657c4', '#ffbe00', '#09a800', '#00b1ed', '#ff0008']
    };

    cs = colorScheme['logo'];
    strokeWeight(2);
    cR = 100;
    numCircles = 7;
    t = 0;
    circles = [];

    iTheta = -PI / 6;

    grainAmt = random_int(1, 2)
    nL = (width * pixelDensity()) * (height * pixelDensity());

    for (let i = 0; i < numCircles; i++) {
        circles.push(new Circle(i));
    }

    noLoop();
}


function draw() {
    background('white');
    // addGrain(grainAmt);
    translate(width / 2, height / 2);



    for (eachCir of circles) {
        eachCir.draw();
    }


    // addGrain();
}


class Circle {
    constructor(i, centerX = 0, centerY = 0, radius = 100) {
        this.i = i;

        // geometry
        this.centerX = centerX;
        this.centerY = centerY;
        this.oR = radius;

        this.angleDif = 0;
        // this.cR = radius+10*this.i;     // also used as orbit radius & draw diameter

        // offsets
        switch (this.i) {
            case 0:
                // yellow
                this.xDiff = -30;
                this.yDiff = -10;
                this.rF = random(0.8, 1.1);
                break;
            case 1:
                // rgreen
                this.xDiff = 0;
                this.yDiff = 10;
                this.rF = random(0.9, 1.1);
                break;
            case 2:
                // blue
                this.xDiff = -20;
                this.yDiff = -80;
                this.rF = random(1.2, 1.6);
                break;
            case 3:
                // red
                this.xDiff = 60;
                this.yDiff = -160;
                this.rF = random(0.2, 1.5);
                break;
            case 4:
                // bgreen
                this.xDiff = 80;
                this.yDiff = 120;
                this.rF = random(0.4, 1.6);;
                this.angleDif = PI / 2;
                break;
            case 5:
                // lgreen
                this.xDiff = -10;
                this.yDiff = 140;
                this.rF = random(0.9, 1.4);
                this.angleDif = -PI / 4;
                break;
            case 6:
                // purple
                this.xDiff = -90;
                this.yDiff = 0;
                this.rF = random(1.1, 1.4);
                break;
            default:
                this.xDiff = 140;
                this.yDiff = 0;
                break;
        }

        this.cR = this.oR * this.rF;

        // color
        this.opacity = 75; // 0–100
        this.huee = (360 / numCircles) * this.i;
        this.col = addOpacityToHex(cs[(this.i + 3) % cs.length], this.opacity); // e.g. '#a7e038a2'
    }

    // draw() {
    //   const angle = (TWO_PI / numCircles) * this.i + iTheta;
    //   const x = this.centerX + this.xDiff + this.oR * cos(angle);
    //   const y = this.centerY + this.yDiff + this.oR * sin(angle);

    //   noStroke();
    //   fill(this.col);        // p5 accepts 6/8-digit hex strings
    //   circle(x, y, this.cR); // note: this.cR is DIAMETER in p5's circle()
    // }

    draw() {
        const angle = (TWO_PI / numCircles) * this.i + iTheta;

        // center of this small circle
        const x = this.centerX + this.xDiff + this.oR * cos(angle);
        const y = this.centerY + this.yDiff + this.oR * sin(angle);

        // draw the circle
        noStroke();
        fill(this.col);


        // ---- Leaf (tangential), skip cases 2 & 3 ----
        if (this.i !== 2 && this.i !== 3) {
            // radial unit (normal)
            const nx = cos(angle);
            const ny = sin(angle);

            // perimeter point of the circle where leaf attaches
            const attachX = x + (this.cR * 0.5) * nx;
            const attachY = y + (this.cR * 0.5) * ny;

            // tangent direction = angle + 90deg
            const tangentTheta = angle + HALF_PI + this.angleDif;

            // size the leaf relative to the circle
            const leafLen = this.cR * this.rF;   // along tangent
            const leafWid = this.cR * this.rF / 5;  // across

            drawLeafAt(attachX, attachY, tangentTheta, leafLen, leafWid, this.col);
        }
        else {
            circle(x, y, this.cR); // cR is DIAMETER
        }

    }


}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    sLength = min(windowWidth, windowHeight);
    console.log(sLength);
    maxLength = max(windowWidth, windowHeight);
    wRadius = sLength * 0.6;
    console.log(wRadius);
}


// **************************
// *         UTILS          *
// **************************
//

function drawLeafAt(x, y, theta, len = 30, wid = 16, col = '#3a3') {
    push();
    translate(x, y);
    rotate(theta);           // orient along tangent
    noStroke();
    fill(col);

    // symmetric leaf using two bezier arcs
    beginShape();
    vertex(0, 0);
    bezierVertex(len * 0.25, -wid, len * 0.75, -wid, len, 0);
    bezierVertex(len * 0.75, wid, len * 0.25, wid, 0, 0);
    endShape(CLOSE);
    pop();
}

function addOpacityToHex(hex, opacity) {
    // Ensure hex is in #RRGGBB format
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Clamp opacity 0–100 and convert to 0–255
    let alpha = Math.round(Math.min(100, Math.max(0, opacity)) * 255 / 100);

    // Convert to 2-digit hex
    let alphaHex = alpha.toString(16).padStart(2, '0');

    return `#${hex}${alphaHex}`;
}

// Example usage:
// console.log(addOpacityToHex('#a7e038', 0));    // "#a7e03800"  (fully transparent)
// console.log(addOpacityToHex('#a7e038', 50));

// Convert HSL to HEX with alpha
function hslToHex(h, s, l, alpha = 1) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    // Convert alpha (0–1) to 0–255, then to 2-digit hex
    let a = Math.round(alpha * 255);

    return "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0") +
        a.toString(16).padStart(2, "0");
}

function addGrain(amt = 1) {
    // l=millis()
    loadPixels()
    let cF;
    for (let i = 0; i < nL * 4; i += 4) {
        // let cF;
        cF = 1;
        // cF=((pixels[i]==red(bgColor) && pixels[i+1]==green(bgColor) && pixels[i+2]==blue(bgColor)))?10:map(pixels[i],0,150,0,20);
        let grain = random_num(-amt, amt);
        pixels[i] = pixels[i] + cF * grain;
        pixels[i + 1] = pixels[i + 1] + cF * grain;
        pixels[i + 2] = pixels[i + 2] + cF * grain;
        pixels[i + 3] = pixels[i + 3] + cF * grain;
    }
    updatePixels()
    // console.log(millis()-l);
}


function random_num(a = null, b = null) {
    if (a == null && b == null) return random()
    else if (b == null) return a * random()
    else return a + (b - a) * random()
}

function random_int(a, b) {
    return Math.floor(random_num(a, b + 1))
}

function getHash(string) {
    if (string) {
        let nameHash = string.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);
        return Math.abs(nameHash);
    } else {
        return null;
    }
}

function initSeeds() {
    if (viewerWasFound) {
        viewerSeed = getHash(viewerData);
        console.log(`Seed: ${viewerSeed}`);
    } else if (useRandomSeed) {
        viewerSeed = Math.floor(Math.random() * 999999999);
        console.log(`No viewer found; using random seed: ${viewerSeed}`);
    }
    else {
        console.log(`No viewer found; using default seed: ${viewerSeed}`);
    }
    // Use the same random and noise values every time for a given (synced) viewer
    noiseSeed(viewerSeed);
    randomSeed(viewerSeed);
}