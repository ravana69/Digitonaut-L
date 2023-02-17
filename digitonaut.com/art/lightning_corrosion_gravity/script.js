let theShader;

function preload(){
  theShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
	pixelDensity(1.0);
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  shader(theShader);

  theShader.setUniform("u_resolution", [width, height]);
  theShader.setUniform("u_time", millis() / 1000.0);

  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}