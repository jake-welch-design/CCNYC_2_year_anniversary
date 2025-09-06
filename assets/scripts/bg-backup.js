let font;
let geomCache = [];
let txt =
  // "CREATIVE\nCODING\nNEW\nYORK\nCITY\nTUESDAY\nJULY 8TH\n6-8 PM\nPIER 57";
  "CREATIVE\nCODING\nNEW YORK CITY\nTWO\nYEAR\nANNIVERSARY";

const fontSize = 50;
const extrusion = 5;
const sample = 2;

let bg = [0, 0, 0];
let primary = 200;
let lightColor = [255, 255, 255];

const twistAmt = 0.1;
const fps = 30;

let txtScale = 2.0;
let lineSpacing = txtScale * 1.5;
let scrollSpeed = 0;
let rotSpeed = 0.04;

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  try {
    font = await loadFont("https://fonts.cdnfonts.com/css/roboto-mono");
  } catch (error) {
    console.log("Font loading failed, using default font");
  }
  textFont(font);
  pixelDensity(1);
  ortho();
  frameRate(fps);
  preloadTextModels();
  background(bg);
}

function preloadTextModels() {
  geomCache = [];
  const lines = txt.split("\n");
  const targetHeight = fontSize;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineLetters = [];

    // Create geometry for each letter in the line
    for (let i = 0; i < line.length; i++) {
      const letter = line[i];
      if (letter.trim() !== "") {
        // Skip spaces
        const letterGeom = font.textToModel(letter, fontSize, 0, {
          sampleFactor: sample,
          extrude: extrusion,
        });
        letterGeom.clearColors();
        letterGeom.normalize();

        // Normalize the letter geometry
        let minY = Infinity;
        let maxY = -Infinity;
        for (let vertex of letterGeom.vertices) {
          if (vertex.y < minY) minY = vertex.y;
          if (vertex.y > maxY) maxY = vertex.y;
        }
        const currentHeight = maxY - minY;
        const scaleFactor = targetHeight / currentHeight;
        for (let vertex of letterGeom.vertices) {
          vertex.x *= scaleFactor;
          vertex.y *= scaleFactor;
          vertex.z *= scaleFactor;
        }

        lineLetters.push({
          geometry: letterGeom,
          char: letter,
        });
      }
    }

    geomCache.push(lineLetters);
  }
}

function draw() {
  let c = color(255, 255, 255);
  let position = createVector(0, 0, 700);
  let direction = createVector(0, 0, -1);
  spotLight(c, position, direction, PI, 1);

  let lineHeight = fontSize * lineSpacing;
  let totalHeight = geomCache.length * lineHeight;
  let spaceVal = map(sin(frameCount * 0.02), -1, 1, 1, 1);

  push();
  translate(0, -totalHeight * 0.45, -800);

  for (let lineIndex = 0; lineIndex < geomCache.length; lineIndex++) {
    let lineLetters = geomCache[lineIndex];
    let numLetters = lineLetters.length;

    if (numLetters > 0) {
      // Calculate centered spacing with consistent letter spacing
      let letterSpacing = fontSize * txtScale * spaceVal; // Consistent spacing between letters
      let totalLineWidth = (numLetters - 1) * letterSpacing;
      let startX = -totalLineWidth / 2;

      for (let letterIndex = 0; letterIndex < numLetters; letterIndex++) {
        let letterData = lineLetters[letterIndex];
        let letterGeom = letterData.geometry;

        push();
        translate(
          startX + letterIndex * letterSpacing,
          lineIndex * lineHeight,
          0
        );
        fill(primary);
        noStroke();
        scale(txtScale);
        normalMaterial();

        let rot = map(
          sin(frameCount * rotSpeed + letterIndex + lineIndex),
          -1,
          1,
          -HALF_PI / 2,
          HALF_PI / 2
        );
        rotateY(rot);
        rotateX(rot * 0.5);
        rotateZ(rot * 0.3);
        model(letterGeom);
        pop();
      }
    }
  }
  pop();
  let previousImage = get();
  previousImage.resize(width, height);
  imageMode(CENTER);
  image(previousImage, 0, 0, width + 5, height + 5);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
