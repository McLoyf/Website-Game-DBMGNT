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

  // --- fall logic ---
  function fall() {
    if (!fallingShape) return;

    if(isCollision(fallingShape, fallingShapeRow + 1, fallingShapeCol)){
      mergeShapeIntoGrid(fallingShape,fallingShapeRow, fallingShapeCol,fallingShape.color);

      spawnShape();
      update();
      return;
    }

    // otherwise move down
    fallingShapeRow++;
    update();
  }

/*TODO: Fix the collision as it's a bit shit right now.
Known issues with collision: Clipping under game area which softlocks the game, clipping into other blocks which is very apparent when the blocks get stacked to top of screen*/

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
  for(let r = 0; r< gridRows; r++){
    grid[r] = new Array(gridCols).fill(null);
  }

  function rotateShape(){
  }

  window.addEventListener('keydown', function(a){
    if(a.code == 'KeyA'){
      fallingShapeCol -= 1;
      update();
    }
  });

   window.addEventListener('keydown', function(left){
    if(left.code == 'ArrowLeft'){
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

  window.addEventListener('keydown', function(right){
    if(right.code == 'ArrowRight'){
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

   window.addEventListener('keydown', function(down){
    if(down.code == 'ArrowDown'){
      fallingShapeRow += 1;
      update();
    }
  });

  window.addEventListener('keydown', function(w){
    //TODO: implement this later
  })

  window.addEventListener('keydown', function(up){
    //TODO: implement this later
  })
  // --- start game ---
  function startGame() {
    spawnShape();
    update();
    setInterval(fall, fallInterval);
  }

  startGame();
