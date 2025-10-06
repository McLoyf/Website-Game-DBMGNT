'use strict';
  const canvas = document.querySelector('canvas');
  canvas.width = 620;
  canvas.height = 650;
  const g = canvas.getContext('2d');


  const blockSize = 30;
  const leftMargin = 20;
  const topMargin = 50;
  const colors = ['green', 'red', 'blue', 'purple', 'orange', 'blueviolet', 'magenta'];
  const bgColor = '#DDEEFF';
  const fallInterval = 800; // ms between downward moves

  // --- shapes ---
  const shapes = [
    { matrix: [[0,1,0],[1,1,1]], color: colors[2] }, // T
    { matrix: [[1,1],[1,1]], color: colors[4] },     // O
    { matrix: [[1],[1],[1],[1]], color: colors[5] }, // I
    { matrix: [[0,1,1],[1,1,0]], color: colors[1] }, // S
    { matrix: [[1,1,0],[0,1,1]], color: colors[0] }, // Z
    { matrix: [[1,0,0],[1,0,0],[1,1,0]], color: colors[3] }, // L
    { matrix: [[0,1],[0,1],[1,1]], color: colors[6] }        // J
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
    if (fallingShape) {
      drawShape(fallingShape, fallingShapeRow, fallingShapeCol, fallingShape.color);
    }
  }

  // --- fall logic ---
  function fall() {
    if (!fallingShape) return;

    // check if we hit bottom
    const bottomRow = fallingShapeRow + fallingShape.length;
    if (bottomRow * blockSize + topMargin >= canvas.height - 5) {
      // landed -> spawn new
      spawnShape();
      update();
      return;
    }

    // otherwise move down
    fallingShapeRow++;
    update();
  }
  function rotateShape(){
    
  }

  window.addEventListener('keydown', function(a){
    if(a.code == 'KeyA'){
      fallingShapeCol -= 1;
      update();
    }
  });

  window.addEventListener('keydown', function(d){
    if(d.code == 'KeyD'){
      fallingShapeCol += 1;
      update();
    }
  });

  window.addEventListener('keydown', function(s){
    if(s.code == 'KeyS'){
      fallingShapeRow += 1;
      update();
    }
  });

  window.addEventListener('keydown', function(w){
    //TODO: implement this later
  })
  // --- start game ---
  function startGame() {
    spawnShape();
    update();
    setInterval(fall, fallInterval);
  }

  startGame();
