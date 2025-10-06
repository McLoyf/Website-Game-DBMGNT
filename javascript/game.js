'use strict';
var canvas = document.querySelector('canvas');
canvas.width = 640;
canvas.height = 640;

var g = canvas.getContext('2d');

// --- constants from your setup ---
var blockSize = 30;
var leftMargin = 20;
var topMargin = 50;
var colors = ['green', 'red', 'blue', 'purple', 'orange', 'blueviolet', 'magenta'];

// --- Example shape data ---
// A "T" shape in a 3x3 grid representation
var Tshape = [
  [0, 1, 0],
  [1, 1, 1]
];
var tColor = colors[2]; // blue
var fallingShapeRow = 5;
var fallingShapeCol = 4;

var Oshape = [
  [1,1,0],
  [1,1,0],
];
var oColor = colors[4]; // orange

var iShape = [
  [0,1,0],
  [0,1,0],
  [0,1,0],
  [0,1,0]
];
var iColor = colors[5]; // blueviolet

var sShape = [
  [0,1,1],
  [1,1,0]
];
var sColor = colors[1]; // red

var zShape = [
  [1,1,0],
  [0,1,1]
];
var zColor = colors[0]; // green

var lShape = [
  [1,0,0],
  [1,0,0],
  [1,1,0]
]
var lColor = colors[3]; // purple

var jShape = [
  [0,1],
  [0,1],
  [1,1]
];
var jColor = colors[6]; // magenta


// --- draw one square ---
function drawBlock(x, y, color) {
  g.fillStyle = color;
  g.fillRect(
    leftMargin + x * blockSize,
    topMargin + y * blockSize,
    blockSize,
    blockSize
  );
  g.strokeStyle = 'white';
  g.lineWidth = 2;
  g.strokeRect(
    leftMargin + x * blockSize,
    topMargin + y * blockSize,
    blockSize,
    blockSize
  );
}

// --- draw the shape on the grid ---
function drawShape(shape, row, col, color) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        drawBlock(col + c, row + r, color);
      }
    }
  }
}

// --- background ---
g.fillStyle = '#DDEEFF';
g.fillRect(0, 0, canvas.width, canvas.height);

// --- draw the example blocks ---
// drawShape(Tshape, fallingShapeRow, fallingShapeCol, tColor);
// drawShape(Oshape, fallingShapeRow, fallingShapeCol, oColor);
// drawShape(iShape, fallingShapeRow, fallingShapeCol, iColor);
// drawShape(sShape, fallingShapeRow, fallingShapeCol, sColor);
// drawShape(zShape, fallingShapeRow, fallingShapeCol, zColor);
// drawShape(lShape, fallingShapeRow, fallingShapeCol, lColor);
drawShape(jShape, fallingShapeRow, fallingShapeCol, jColor);