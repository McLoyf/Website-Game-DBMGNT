var myGameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, 20);
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function component(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.speedX = 0; // horizontal speed
  this.speedY = 1; // vertical speed
  this.update = function(){
    let ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  this.newPos = function(){
    this.x += this.speedX;
    this.y += this.speedY;

    // keep inside canvas (clamp)
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x + this.width > myGameArea.canvas.width) {
      this.x = myGameArea.canvas.width - this.width;
    }
    if (this.y + this.height > myGameArea.canvas.height) {
      this.y = myGameArea.canvas.height - this.height;
    }
  }
}

let myGamePiece;

function startGame() {
  myGamePiece = new component(30, 30, "red", 10, 120);
  myGameArea.start();
}

function updateGameArea() {
  myGameArea.clear();
  myGamePiece.newPos(); // apply movement with bounds
  myGamePiece.update();
}

window.onload = startGame;