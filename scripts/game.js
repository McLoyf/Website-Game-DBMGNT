'use strict';
const canvas = document.querySelector('canvas');
const score = document.getElementById('score');
const BACKEND_URL = "https://website-game-dbmgnt-production.up.railway.app";

canvas.width = 620;
canvas.height = 650;
const g = canvas.getContext('2d');


const blockSize = 30;
const leftMargin = 20;
const topMargin = 50;
const colors = ['green', 'red', 'blue', 'purple', 'orange', 'blueviolet', 'magenta'];
const bgColor = '#DDEEFF';
const fallInterval = 700; // ms between downward moves
let scoreValue = 0;
let gameOver = false;
let fallTimer = null;

// --- shapes ---
const shapes = [
  { matrix: [[0, 1, 0], [1, 1, 1]], color: colors[2] }, // T, color blue
  { matrix: [[1, 1], [1, 1]], color: colors[4] },     // O, color orange
  { matrix: [[1], [1], [1], [1]], color: colors[5] }, // I, blueviolet
  { matrix: [[0, 1, 1], [1, 1, 0]], color: colors[1] }, // S, red
  { matrix: [[1, 1, 0], [0, 1, 1]], color: colors[0] }, // Z, green
  { matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 0]], color: colors[3] }, // L, purple
  { matrix: [[0, 1], [0, 1], [1, 1]], color: colors[6] }        // J, magenta
];

// --- current falling piece ---
let fallingShape = null;
let fallingShapeRow = 0;
let gridRows = Math.floor((canvas.height - topMargin) / blockSize);
let gridCols = Math.floor((canvas.width - leftMargin) / blockSize);
let fallingShapeCol = gridCols/2;

// --- draw one block ---
function drawBlock(x, y, color) {
  g.fillStyle = color;
  g.fillRect(leftMargin + x * blockSize, topMargin + y * blockSize, blockSize, blockSize);
  g.strokeStyle = 'white';
  g.lineWidth = 2;
  g.strokeRect(leftMargin + x * blockSize, topMargin + y * blockSize, blockSize, blockSize);
}

// --- draw shape ---
function drawShape(shape, row, col, color) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        drawBlock(col + c, row + r, color);
      }
    }
  }
}

// --- clear background ---
function clearScreen() {
  g.fillStyle = bgColor;
  g.fillRect(0, 0, canvas.width, canvas.height);
}

// --- spawn new shape ---
function spawnShape() {
  const next = shapes[Math.floor(Math.random() * shapes.length)];
  fallingShape = next.matrix;
  fallingShapeRow = 0;
  fallingShapeCol = Math.floor(gridCols / 2) - 2;
  fallingShape.color = next.color;

  //  Check if spawning here is immediately invalid — means game over
  if (isCollision(fallingShape, fallingShapeRow, fallingShapeCol)) {
    gameOver = true;
    endGame();
  }
}

// --- draw current game state ---
function update() {
  clearScreen();

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (grid[r][c]) {
        drawBlock(c, r, grid[r][c]); // draw color stored in grid
      }
    }
  }
  if (fallingShape) {
    drawShape(fallingShape, fallingShapeRow, fallingShapeCol, fallingShape.color);
  }
}
function updateScore(amount) {
  scoreValue += amount;
  if (score) {
    score.textContent = scoreValue;
  }
}

async function sendScoreToServer(username, score) {
  try {
    const res = await fetch(
  "https://website-game-dbmgnt-production.up.railway.app/api/score",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score })
  }
);

    const data = await res.json();
    console.log(data.message);
  } catch (err) {
    console.error("Error sending score:", err);
  }
}

// --- fall logic ---
function fall() {
  if (!fallingShape) return;

  if (isCollision(fallingShape, fallingShapeRow + 1, fallingShapeCol)) {
    mergeShapeIntoGrid(fallingShape, fallingShapeRow, fallingShapeCol, fallingShape.color);

    updateScore(10);
    spawnShape();
    update();
    return;
  }

  // otherwise move down
  fallingShapeRow++;
  update();
}

function isCollision(shape, nextRow, nextCol) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        let newRow = nextRow + r;
        let newCol = nextCol + c;

        // bottom collision
        if (newRow >= gridRows) {
          return true;
        }

        // side collision
        if (newCol < 0 || newCol >= gridCols) {
          return true;
        }

        // block-on-block collision
        if (grid[newRow][newCol]) {
          return true;
        }
      }
    }
  }
  return false;
}


async function endGame() {
  console.log("GAME OVER");

  clearInterval(fallTimer);
  fallingShape = null;

  await sendScoreToServer("Test", scoreValue);

  g.fillStyle = "black";
  g.font = "40px Arial";
  g.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2 - 20);

  g.font = "30px Arial";
  g.fillText("Press R to Restart", canvas.width / 2 - 140, canvas.height / 2 + 30);
}


function restartGame() {
  // reset everything
  scoreValue = 0;
  score.textContent = scoreValue;
  gameOver = false;

  // reset grid
  grid = [];
  for (let r = 0; r < gridRows; r++) {
    grid[r] = new Array(gridCols).fill(null);
  }

  // restart loop
  spawnShape();
  update();
  fallTimer = setInterval(fall, fallInterval);
}


function mergeShapeIntoGrid(shape, row, col, color) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        grid[row + r][col + c] = color;
      }
    }
  }
}

let grid = [];
for (let r = 0; r < gridRows; r++) {
  grid[r] = new Array(gridCols).fill(null);
}


function rotateShape() {
  if (!fallingShape || gameOver) return;

  // Transpose + reverse rows to rotate
  const rotated = fallingShape[0].map((_, i) =>
    fallingShape.map(row => row[i]).reverse()
  );

  // Only apply rotation if it's valid
  if (!isCollision(rotated, fallingShapeRow, fallingShapeCol)) {
    fallingShape = rotated;
    update();
  }
}


window.addEventListener('keydown', function (a) {
  if (a.code === 'KeyA') {
    if (!isCollision(fallingShape, fallingShapeRow, fallingShapeCol - 1)) {
      fallingShapeCol -= 1;
      update();
    }
  }
});

window.addEventListener('keydown', function (left) {
  if (left.code === 'ArrowLeft') {
    if (!isCollision(fallingShape, fallingShapeRow, fallingShapeCol - 1)) {
      fallingShapeCol -= 1;
      update();
    }
  }
});

window.addEventListener('keydown', function (d) {
  if (d.code === 'KeyD') {
    if (!isCollision(fallingShape, fallingShapeRow, fallingShapeCol + 1)) {
      fallingShapeCol += 1;
      update();
    }
  }
});

window.addEventListener('keydown', function (right) {
  if (right.code === 'ArrowRight') {
    if (!isCollision(fallingShape, fallingShapeRow, fallingShapeCol + 1)) {
      fallingShapeCol += 1;
      update();
    }
  }
});

window.addEventListener('keydown', function (s) {
  if (s.code === 'KeyS') {
    // only move down if the next row is valid
    if (!isCollision(fallingShape, fallingShapeRow + 1, fallingShapeCol)) {
      fallingShapeRow += 1;
      update();
    }
  }
});

window.addEventListener('keydown', function (down) {
  if (down.code === 'ArrowDown') {
    // only move down if the next row is valid
    if (!isCollision(fallingShape, fallingShapeRow + 1, fallingShapeCol)) {
      fallingShapeRow += 1;
      update();
    }
  }
});

window.addEventListener("keydown", function (w) {
  if (w.code === "ArrowUp" || w.code === "KeyW") {
    rotateShape();
  }
});

window.addEventListener('keydown', function (up) {
  if (w.code === "ArrowUp" || w.code === "KeyW") {
    rotateShape();
  }
});

window.addEventListener('keydown', function (e) {
  if (e.code === "KeyR" && gameOver) {
    restartGame();
  }
});


// --- start game ---
function startGame() {
  spawnShape();
  update();
  fallTimer = setInterval(fall, fallInterval);
  updateScore(0);
}

startGame();