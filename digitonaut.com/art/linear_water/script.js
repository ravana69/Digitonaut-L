const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const n = 5000;
let curl = 8;
let vectors;
let simplex = new SimplexNoise();

window.onload = window.onresize = function() {
  let scale = window.devicePixelRatio;
  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;
  ctx.scale(scale, scale);
  setup();
}

function setup() {
  let row = Math.floor(Math.sqrt(n));
  while (n % row != 0) row++;
  let col = n / row;

  if (window.innerWidth < window.innerHeight) {
    row ^= col;
    col ^= row;
    row ^= col;
  }
  
  let rowWidth = canvas.width / row;
  let colHeight = canvas.height / col;

  vectors = new Array(row);
  
  for (let i = 0; i < row; i++) {
    vectors[i] = new Array(col);
    for (let j = 0; j < col; j++)
      vectors[i][j] = new Vector(
        i * rowWidth  + rowWidth / 2,
        j * colHeight + colHeight / 2
      );
  }
  
  ctx.lineWidth = 2;
  ctx.fillStyle = '#1e1f26'; // Codepen color!
}

let off = 0;
function draw() {
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for (v in vectors) {
    for (w in vectors[v]) {
      vectors[v][w].update();
      vectors[v][w].show();
    }
  }
  off+=0.008;
  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);

class Vector {
  constructor(x,y) {
    if (typeof Vector.radius == 'undefined') Vector.radius = 10;
    this.x = x;
    this.y = y;
  }
  update() {
    this.angle = curl * Math.PI * simplex.noise3D(10*this.x/n, 10*this.y/n, off);
  }
  show() {
    // map angle from (-pi,pi) to (0,360)
    let s = (180 * (this.angle / (Math.PI * curl) + 1));
    if (s > 165 && s < 220) ctx.strokeStyle = "hsl(" + s + ",100%,50%)";
    else return; //ctx.strokeStyle = '#FFFFFF';
    
    ctx.beginPath();
    ctx.moveTo(this.x,this.y);
    ctx.lineTo(
      this.x + Math.cos(this.angle) * Vector.radius,
      this.y + Math.sin(this.angle) * Vector.radius
    );
    
    ctx.stroke();
  }
}