function setup() {
    createCanvas(800, 600);
    background(220);
}

function draw() {
    // Create a moving circle
    let x = mouseX;
    let y = mouseY;
    
    // Change color based on mouse position
    let r = map(mouseX, 0, width, 0, 255);
    let g = map(mouseY, 0, height, 0, 255);
    let b = map(mouseX + mouseY, 0, width + height, 0, 255);
    
    fill(r, g, b);
    noStroke();
    
    // Draw circle at mouse position
    circle(x, y, 30);
    
    // Add some trailing effect
    if (frameCount % 10 === 0) {
        fill(220, 10);
        rect(0, 0, width, height);
    }
}

function mousePressed() {
    // Clear background when mouse is pressed
    background(220);
}