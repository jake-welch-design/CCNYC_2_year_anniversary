p5.disableFriendlyErrors = true;

let bannerHeight = 100;
let txt = "CCNYC";
let canvas;

let backspacePressed = false;
let lastBackspaceTime = 0;
let backspaceDelay = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);

  noCursor();
  canvas = document.querySelector("#defaultCanvas0");
  if (canvas) {
    canvas.tabIndex = 1;
    canvas.style.outline = "none";
    canvas.focus();
  }
}

function mousePressed() {
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

  // Calculate text width for line length
  textSize(100);
  let textW = txt.length > 0 ? textWidth(txt) : 0;
  let lineWidth = textW;

  for (let i = 0; i < bannerHeight; i++) {
    let alpha = map(i, 0, bannerHeight - 1, 0, 255);
    stroke(255, alpha);
    noFill();
    line(0, height - i, lineWidth, height - i);
  }

  if (backspacePressed && millis() - lastBackspaceTime > backspaceDelay) {
    if (txt.length > 0) {
      txt = txt.slice(0, -1);
      lastBackspaceTime = millis();
    }
  }

  if (txt.length > 0) {
    textSize(90);
    textAlign(LEFT, BASELINE);
    fill(255);
    noStroke();

    text(txt, 10, height - 20);
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
    if (txt.length > 0) {
      txt = txt.slice(0, -1);
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
    txt += key;
    console.log("Added character, text now:", txt);
    return false;
  }
}
