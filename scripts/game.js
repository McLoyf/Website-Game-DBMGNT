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

// --- shapes ---
const shapes = [
  { matrix: [[0, 1, 0], [1, 1, 1]], color: colors[2] }, // T
  { matrix: [[1, 1], [1, 1]], color: colors[4] },     // O
  { matrix: [[1], [1], [1], [1]], color: colors[5] }, // I
  { matrix: [[0, 1, 1], [1, 1, 0]], color: colors[1] }, // S
  { matrix: [[1, 1, 0], [0, 1, 1]], color: colors[0] }, // Z
  { matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 0]], color: colors[3] }, // L
  { matrix: [[0, 1], [0, 1], [1, 1]], color: colors[6] }        // J
];

// --- current falling piece ---
let fallingShape = null;
let fallingShapeRow = 0;
let fallingShapeCol = 4;
let gridRows = Math.floor((canvas.height - topMargin) / blockSize);
let gridCols = Math.floor((canvas.width - leftMargin) / blockSize);

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
    const res = await fetch(`${BACKEND_URL}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, score })
    });
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
    sendScoreToServer("Test", scoreValue);
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

//**TODO: Add game over state. A way to do it is to simply write a gameover function that ends the game 
// and have the function be called when drawing a new shape. If the shape is going to be spawned in an invalid
// grid placement (like in the eventListeners) then set gameover to true and end game*/

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

/**
window.addEventListener('keydown', function (w) {
  if(w.code === 'KeyW'){
    if(!isCollision(fallingShape, fallingShapeRow+1,fallinfShapeCol+1)){
      //TODO: implement this
    }
  }
});

window.addEventListener('keydown', function (up) {
  if(w.code === 'ArrowUp'){
    if(!isCollision(fallingShape, fallingShapeRow+1,fallinfShapeCol+1)){
      //TODO: implement this
    }
  }
});
*/
// --- start game ---
function startGame() {
  spawnShape();
  update();
  setInterval(fall, fallInterval);
  updateScore(0);
}

startGame();
