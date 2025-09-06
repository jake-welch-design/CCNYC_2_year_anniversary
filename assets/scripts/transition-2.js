p5.disableFriendlyErrors = true;

let images = [];
let imagesLoaded = false;
let imgRenderer;
let chunkSize = 10;
let currentImageIndex = 0;

// Are.na API configuration
const ARENA_API_URLS = [
  "https://api.are.na/v2/channels/clouds-iizyl5tlx-m/contents",
  // Add more channels if desired
];

// Transition animation variables
let transitionActive = false;
let transitionStartTime = 0;
let transitionDuration = 4000; // 4 seconds
let baseChunkSize = 30;

// Grid reveal system
let gridRevealMap = [];
let gridCols = 0;
let gridRows = 0;

let fps = 30;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  imgRenderer = createGraphics(width, height);
  background(0);

  // Make canvas focusable for keyboard events
  let canvas = document.querySelector("#defaultCanvas0");
  if (canvas) {
    canvas.tabIndex = 1;
    canvas.style.outline = "none";
    canvas.focus();
  }

  frameRate(fps);

  // Initialize grid reveal map
  initializeGridReveal();

  // Load images from Are.na
  await loadArenaImages();
}

function initializeGridReveal() {
  gridCols = Math.floor(width / baseChunkSize);
  gridRows = Math.floor(height / baseChunkSize);

  // Create array of grid positions for random reveal
  gridRevealMap = [];
  for (let x = 0; x < gridCols; x++) {
    for (let y = 0; y < gridRows; y++) {
      gridRevealMap.push({ x: x, y: y, revealed: false });
    }
  }

  // Shuffle the array for random reveal order
  for (let i = gridRevealMap.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gridRevealMap[i], gridRevealMap[j]] = [gridRevealMap[j], gridRevealMap[i]];
  }
}

async function loadArenaImages() {
  console.log("Loading images from Are.na...");

  let allImages = [];

  for (const apiURL of ARENA_API_URLS) {
    try {
      const response = await fetch(apiURL);
      const data = await response.json();

      if (data.contents) {
        const imageBlocks = data.contents.filter(
          (block) =>
            block.class === "Image" && block.image && block.image.display
        );

        console.log(`Found ${imageBlocks.length} images in channel`);

        const promises = imageBlocks.map((block) => {
          return new Promise((resolve, reject) => {
            loadImage(
              block.image.display.url,
              (img) => {
                console.log("Image loaded:", block.title || "Untitled");
                resolve(img);
              },
              (err) => {
                console.error("Failed to load image:", err);
                resolve(null);
              }
            );
          });
        });

        const loadedImages = await Promise.all(promises);
        allImages = allImages.concat(
          loadedImages.filter((img) => img !== null)
        );
      } else {
        console.error("No contents found in Are.na channel:", apiURL);
      }
    } catch (error) {
      console.error("Error fetching Are.na data from", apiURL, error);
    }
  }

  if (allImages.length > 0) {
    images = allImages;
    imagesLoaded = true;
    console.log(`Successfully loaded ${images.length} total images`);
  } else {
    console.error("No images were loaded from any channel");
    imagesLoaded = true; // Still set to true to stop loading screen
  }
}

function draw() {
  if (!imagesLoaded || images.length === 0) {
    // Show loading state
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Loading images...", width / 2, height / 2);
    return;
  }

  // Calculate transition progress
  let revealProgress = 0;
  if (transitionActive) {
    let elapsed = millis() - transitionStartTime;
    let progress = elapsed / transitionDuration;

    if (progress >= 1) {
      // Animation complete - reset all squares to hidden
      transitionActive = false;
      for (let cell of gridRevealMap) {
        cell.revealed = false;
      }
      background(0);
      return;
    } else {
      // Calculate reveal progress (0 to 1 to 0 over 4 seconds)
      revealProgress = sin(progress * PI); // Smooth in-out curve
    }
  }

  // Start with black background
  background(0);

  if (!transitionActive) {
    // Normal state - show nothing (black screen)
    return;
  }

  // During transition - render revealed squares
  imgRenderer.clear();
  imgRenderer.background(0);

  let cols = gridCols;
  let rows = gridRows;
  let totalCells = gridRevealMap.length;
  let cellsToReveal = Math.floor(revealProgress * totalCells);

  // Mark cells as revealed based on progress
  for (let i = 0; i < totalCells; i++) {
    gridRevealMap[i].revealed = i < cellsToReveal;
  }

  // Draw only revealed cells
  for (let cell of gridRevealMap) {
    if (cell.revealed) {
      let x = cell.x;
      let y = cell.y;
      let imgIndex = (currentImageIndex + (x * x + y * y)) % images.length;
      let img = images[imgIndex];

      if (img && img.width > 0 && img.height > 0) {
        let sx = (x * baseChunkSize) % img.width;
        let sy = (y * baseChunkSize) % img.height;
        let dx = x * baseChunkSize;
        let dy = y * baseChunkSize;

        imgRenderer.copy(
          img,
          sx,
          sy,
          baseChunkSize,
          baseChunkSize,
          dx,
          dy,
          baseChunkSize,
          baseChunkSize
        );
      }
    }
  }

  image(imgRenderer, 0, 0);

  // Slowly cycle through images
  if (frameCount % 120 === 0) {
    // Change every 2 seconds at 60fps
    currentImageIndex = (currentImageIndex + 1) % images.length;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  imgRenderer = createGraphics(width, height);
  initializeGridReveal(); // Reinitialize grid for new canvas size
}

function keyPressed() {
  console.log("Key pressed:", key, keyCode);
  if (key === "t" || key === "T") {
    console.log("T key detected - starting transition");
    // Start transition animation
    transitionActive = true;
    transitionStartTime = millis();
  }
}

function mousePressed() {
  // Focus canvas when clicked
  let canvas = document.querySelector("#defaultCanvas0");
  if (canvas) {
    canvas.focus();
  }
}
