let font;
let geomCache = [];
let txt = "CCNYC\n2\nYEARS";

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

let circleRotationX = 0;
let circleRotationY = 0;
let circleRotationZ = 0;
let autoRotate = true;

let balls = [];
let numBalls = 12;
let ballOrbitRad = 400;
let ballOrbitSpeed = 0.02;

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  try {
    font = await loadFont("assets/fonts/Inter_28pt-ExtraBold.ttf");
  } catch (error) {
    console.log("Font loading failed, using default font");
  }
  textFont(font);
  pixelDensity(1);
  ortho();
  frameRate(fps);
  preloadTextModels();
  initializeBalls();
  background(bg);
}

function preloadTextModels() {
  geomCache = [];
  const lines = txt.split("\n");
  const targetHeight = fontSize;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineLetters = [];

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char.trim() !== "") {
        const charGeom = font.textToModel(char, fontSize, 0, {
          sampleFactor: sample,
          extrude: extrusion,
        });
        charGeom.clearColors();
        charGeom.normalize();

        let minY = Infinity;
        let maxY = -Infinity;
        let minX = Infinity;
        let maxX = -Infinity;

        for (let vertex of charGeom.vertices) {
          if (vertex.y < minY) minY = vertex.y;
          if (vertex.y > maxY) maxY = vertex.y;
          if (vertex.x < minX) minX = vertex.x;
          if (vertex.x > maxX) maxX = vertex.x;
        }

        const currentHeight = maxY - minY;
        const currentWidth = maxX - minX;

        let scaleFactor = targetHeight / currentHeight;

        const maxWidth = targetHeight * 2;
        if (currentWidth * scaleFactor > maxWidth) {
          scaleFactor = maxWidth / currentWidth;
        }

        for (let vertex of charGeom.vertices) {
          vertex.x *= scaleFactor;
          vertex.y *= scaleFactor;
          vertex.z *= scaleFactor;
        }

        lineLetters.push({
          geometry: charGeom,
          char: char,
          lineIndex: lineIndex,
          letterIndex: i,
        });
      }
    }

    geomCache.push(lineLetters);
  }
}

function initializeBalls() {
  balls = [];
  for (let i = 0; i < numBalls; i++) {
    balls.push({
      angle: (i / numBalls) * TWO_PI,
      size: random(3, 10),
      orbitSpeed: random(0.01, 0.04),
      verticalOffset: random(-400, 400),
      orbitTilt: random(-PI / 4, PI / 4),
    });
  }
}

function draw() {
  let c = color(255, 255, 255);
  let position = createVector(0, 0, 700);
  let direction = createVector(0, 0, -1);
  spotLight(c, position, direction, PI, 1);

  let circleRadius = map(sin(frameCount * 0.01), -1, 1, 250, 500);

  if (autoRotate) {
    circleRotationX += 0.008;
    circleRotationY += 0.012;
    circleRotationZ += 0.005;
  }

  let totalChars = 0;
  for (let lineIndex = 0; lineIndex < geomCache.length; lineIndex++) {
    totalChars += geomCache[lineIndex].length;
  }

  push();
  translate(0, 0, -500);

  rotateX(circleRotationX);
  rotateY(circleRotationY);
  rotateZ(circleRotationZ);

  push();
  fill(255);
  noStroke();
  normalMaterial();
  sphere(circleRadius / 3, 24, 16);
  pop();
  let charCount = 0;

  for (let lineIndex = 0; lineIndex < geomCache.length; lineIndex++) {
    let lineChars = geomCache[lineIndex];

    for (let charIndex = 0; charIndex < lineChars.length; charIndex++) {
      let charData = lineChars[charIndex];
      let charGeom = charData.geometry;
      let angle = (charCount / totalChars) * TWO_PI;
      let verticalOffset = (lineIndex - (geomCache.length - 1) / 2) * 50;

      let x = cos(angle) * circleRadius;
      let z = sin(angle) * circleRadius;
      let y = verticalOffset;

      push();
      translate(x, y, z);

      rotateY(-angle);
      rotateZ(-circleRotationZ);
      rotateY(-circleRotationY);
      rotateX(-circleRotationX);

      let individualRot = map(
        sin(frameCount * rotSpeed + charIndex + lineIndex),
        -1,
        1,
        -0.2,
        0.2
      );
      rotateY(individualRot);
      rotateX(individualRot * 0.5);

      fill(primary);
      noStroke();
      scale(txtScale);
      normalMaterial();
      model(charGeom);
      pop();

      charCount++;
    }
  }
  pop();

  push();
  translate(0, 0, -500);
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];

    ball.angle += ball.orbitSpeed;

    push();

    rotateX(ball.orbitTilt);
    rotateZ(ball.orbitTilt * 0.5);

    let x = cos(ball.angle) * ballOrbitRad;
    let z = sin(ball.angle) * ballOrbitRad;
    let y = ball.verticalOffset;

    translate(x, y, z);

    rotateX(frameCount * 0.01 + i);
    rotateY(frameCount * 0.015 + i);
    rotateZ(frameCount * 0.008 + i);

    fill(255, 0, 0);
    // stroke(0);
    normalMaterial();
    noStroke();
    sphere(ball.size);

    pop();
  }
  pop();

  push();
  translate(0, 0, 800);
  fill(0, 10);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, width * 2, height * 2);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(bg);
}
