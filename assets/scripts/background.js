p5.disableFriendlyErrors = true;

let bg = 0;
let customFont;

let baseText = "CCNYC 2 YEARS ";
let textContent = "";
for (let i = 0; i < 28; i++) {
  textContent += baseText;
}
let txtSize = 15;

// Text scaling variables
let minTextSize = 15; // Minimum text size at the center
let maxTextSize = 45; // Maximum text size at the outer edge
let textScaleRadius = 500; // Radius at which text reaches max size

let spiralRadius = 0;
let spiralAngle = 0;
let letterSpacing1 = 50;
let letterSpacing2 = 50;
let spiralSpeed = 0.002;
let radiusIncrement = 2.7;

let waveSpeed = 0.02;
let waveAmt = 100;

let colorChangeFrames = 5;
let letterColors = [];
let lastColorUpdate = 0;

let mainCanvas;
let flippedCanvas;

let colorPalette = [
  "#FFB45B",
  "#FDD684",
  "#FFF9A1",
  "#007BEF",
  "#084596",
  "#3B7794",
  "#2F88A8",
  "#FEE161",
  "#FE9347",
  "#FB502B",
];

async function loadCustomFont() {
  console.log("Loading font...");
  try {
    customFont = await new Promise((resolve, reject) => {
      loadFont("../fonts/Inter_28pt-ExtraBold.ttf", resolve, reject);
    });
    console.log("Font loaded successfully");
  } catch (error) {
    console.error("Failed to load font:", error);
    customFont = null;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  background(bg);
  textAlign(CENTER, CENTER);
  textSize(txtSize);

  mainCanvas = createGraphics(width, height);
  flippedCanvas = createGraphics(width, height);
  mainCanvas.textAlign(CENTER, CENTER);
  mainCanvas.textSize(txtSize);
  flippedCanvas.textAlign(CENTER, CENTER);
  flippedCanvas.textSize(txtSize);

  initializeLetterColors();
  loadCustomFont();
}

function initializeLetterColors() {
  letterColors = [];

  for (let i = 0; i < textContent.length; i++) {
    // Assign each letter a random color from the palette
    let randomColorIndex = Math.floor(Math.random() * colorPalette.length);
    letterColors[i] = colorPalette[randomColorIndex];
  }
}

function draw() {
  if (customFont && customFont !== null) {
    mainCanvas.textFont(customFont);
    flippedCanvas.textFont(customFont);
  }

  // Update all letter colors every 5 frames
  if (frameCount - lastColorUpdate >= colorChangeFrames) {
    initializeLetterColors();
    lastColorUpdate = frameCount;
  }

  mainCanvas.background(bg);
  flippedCanvas.background(bg);

  mainCanvas.push();
  mainCanvas.translate(width * 0.5, height * 0.5);
  drawSpiralToCanvas(mainCanvas, 0, 0, spiralAngle, 1, letterSpacing1, 0);
  drawSpiralToCanvas(
    mainCanvas,
    0,
    0,
    spiralAngle + PI,
    1,
    letterSpacing2,
    frameCount * 1
  );
  mainCanvas.pop();

  flippedCanvas.push();
  flippedCanvas.translate(width * 0.5, height * 0.5);
  drawSpiralToCanvas(flippedCanvas, 0, 0, -spiralAngle, 1, letterSpacing1, 0);
  drawSpiralToCanvas(
    flippedCanvas,
    0,
    0,
    -spiralAngle + PI,
    1,
    letterSpacing2,
    frameCount * 1
  );
  flippedCanvas.pop();

  background(bg);

  let tileSize = 50;

  let cols = ceil(width / tileSize);
  let rows = ceil(height / tileSize);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let isEven = (x + y) % 2 === 0;
      let sourceCanvas = isEven ? mainCanvas : flippedCanvas;

      copy(
        sourceCanvas,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize
      );
    }
  }

  spiralAngle += spiralSpeed;
}

function drawSpiralToCanvas(
  canvas,
  centerX,
  centerY,
  startAngle,
  direction,
  spacing,
  colorOffset
) {
  let currentRadius = 50;
  let currentAngle = startAngle;

  for (let i = 0; i < textContent.length; i++) {
    if (textContent[i] === " ") {
      currentAngle += (15 / currentRadius) * direction;
      continue;
    }

    let x = centerX + cos(currentAngle) * currentRadius;
    let y = centerY + sin(currentAngle) * currentRadius;

    // Simply use the pre-assigned color for this letter
    let selectedColor = letterColors[i];

    let waveOffset = sin(frameCount * waveSpeed + i) * waveAmt;
    let waveRadius = currentRadius + waveOffset;

    x = centerX + cos(currentAngle) * waveRadius;
    y = centerY + sin(currentAngle) * waveRadius;

    let textSizeScale = map(
      waveRadius,
      50,
      textScaleRadius,
      minTextSize,
      maxTextSize
    );
    textSizeScale = constrain(textSizeScale, minTextSize, maxTextSize);

    canvas.fill(selectedColor);
    canvas.textSize(textSizeScale);

    canvas.push();
    canvas.translate(x, y, 0);
    canvas.text(textContent[i], 0, 0);
    canvas.pop();

    currentAngle += (spacing / currentRadius) * direction;
    currentRadius += radiusIncrement;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  mainCanvas = createGraphics(width, height);
  flippedCanvas = createGraphics(width, height);

  mainCanvas.textAlign(CENTER, CENTER);
  mainCanvas.textSize(txtSize);
  flippedCanvas.textAlign(CENTER, CENTER);
  flippedCanvas.textSize(txtSize);

  if (customFont && customFont !== null) {
    mainCanvas.textFont(customFont);
    flippedCanvas.textFont(customFont);
  }

  background(bg);
}
