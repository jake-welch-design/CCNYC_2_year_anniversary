p5.disableFriendlyErrors = true;

let bannerHeight = 100;
let marqueeText = "CCNYC 2nd Anniversary Party";
let marqueeX = 0;
let marqueeSpeed = 2;
let canvas;

// Key handling for continuous backspace
let backspacePressed = false;
let lastBackspaceTime = 0;
let backspaceDelay = 100; // milliseconds between deletions when held

function setup() {
  createCanvas(windowWidth, windowHeight);

  noCursor();
  // Make the canvas focusable
  canvas = document.querySelector("#defaultCanvas0");
  if (canvas) {
    canvas.tabIndex = 1;
    canvas.style.outline = "none";
    canvas.focus();
  }
}

function mousePressed() {
  // Focus the canvas when clicked
  if (canvas) {
    canvas.focus();
  }
}

function draw() {
  //   clear();
  background(0);

  // push();
  // ellipseMode(CENTER);
  // fill(255, 0, 0);
  // noStroke();
  // ellipse(mouseX, mouseY, 200, 200);
  // pop();

  blendMode(DIFFERENCE);
  for (let i = 0; i < bannerHeight; i++) {
    let alpha = map(i, 0, bannerHeight - 1, 0, 255);
    stroke(255, alpha);
    noFill();
    line(0, height - i, width, height - i);
  }

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

    let totalWidth = textW + spacing;
    let numCopies = Math.ceil((width + totalWidth) / totalWidth) + 1;

    for (let i = 0; i < numCopies; i++) {
      text(marqueeText, marqueeX + i * totalWidth, height - 20);
    }

    marqueeX -= marqueeSpeed;

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
  console.log("Key pressed:", keyCode, key);
  if (keyCode === BACKSPACE || keyCode === DELETE || keyCode === 8) {
    console.log("Backspace detected");
    backspacePressed = true;
    if (marqueeText.length > 0) {
      marqueeText = marqueeText.slice(0, -1);
      lastBackspaceTime = millis();
    }
    return false;
  }
}

function keyReleased() {
  if (keyCode === BACKSPACE || keyCode === DELETE || keyCode === 8) {
    console.log("Backspace released");
    backspacePressed = false;
    return false;
  }
}

function keyTyped() {
  console.log(
    "Key typed:",
    key,
    "charCode:",
    key.charCodeAt(0),
    "keyCode:",
    keyCode
  );
  if (
    key.length === 1 &&
    key !== "\b" &&
    key.charCodeAt(0) !== 8 &&
    keyCode !== BACKSPACE &&
    keyCode !== 8
  ) {
    marqueeText += key;
    console.log("Added character, text now:", marqueeText);
    return false; // Prevent default behavior
  }
}
