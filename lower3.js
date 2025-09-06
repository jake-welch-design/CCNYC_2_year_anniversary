p5.disableFriendlyErrors = true;

let bannerHeight = 100;
let marqueeText = "CCNYC 2nd Anniversary Party";
let marqueeX = 0;
let marqueeSpeed = 2;

// Key handling for continuous backspace
let backspacePressed = false;
let lastBackspaceTime = 0;
let backspaceDelay = 100; // milliseconds between deletions when held

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  //   clear();
  background(0);

  push();
  ellipseMode(CENTER);
  fill(255, 0, 0);
  noStroke();
  ellipse(mouseX, mouseY, 200, 200);
  pop();

  blendMode(DIFFERENCE);
  for (let i = 0; i < bannerHeight; i++) {
    let alpha = map(i, 0, bannerHeight - 1, 0, 255);
    stroke(255, alpha);
    noFill();
    line(0, height - i, width, height - i);
  }

  // Handle continuous backspace
  if (backspacePressed && millis() - lastBackspaceTime > backspaceDelay) {
    if (marqueeText.length > 0) {
      marqueeText = marqueeText.slice(0, -1);
      lastBackspaceTime = millis();
    }
  }

  // Only draw text if there is any
  if (marqueeText.length > 0) {
    textSize(100);
    fill(255);
    noStroke();

    let textW = textWidth(marqueeText);
    let spacing = 50;

    // Calculate how many copies we need to fill the screen plus some buffer
    let totalWidth = textW + spacing;
    let numCopies = Math.ceil((width + totalWidth) / totalWidth) + 1;

    // Draw multiple copies to ensure seamless loop
    for (let i = 0; i < numCopies; i++) {
      text(marqueeText, marqueeX + i * totalWidth, height - 20);
    }

    marqueeX -= marqueeSpeed;

    // Reset when first copy is completely off screen
    if (marqueeX <= -totalWidth) {
      marqueeX = 0;
    }
  }

  blendMode(BLEND);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (keyCode === BACKSPACE || keyCode === DELETE) {
    // Start backspace deletion
    backspacePressed = true;
    if (marqueeText.length > 0) {
      marqueeText = marqueeText.slice(0, -1);
      lastBackspaceTime = millis();
    }
    return false; // Prevent default behavior
  }
}

function keyReleased() {
  if (keyCode === BACKSPACE || keyCode === DELETE) {
    // Stop backspace deletion
    backspacePressed = false;
    return false;
  }
}

function keyTyped() {
  // Handle regular character input (exclude backspace character)
  if (key.length === 1 && key !== "\b" && keyCode !== BACKSPACE) {
    marqueeText += key;
    return false; // Prevent default behavior
  }
}
