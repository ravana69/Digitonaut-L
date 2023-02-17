var Colors = {
	red:0xf25346,
	yellow:0xedeb27,
	white:0xd8d0d1,
	brown:0x59332e,
	brownLight:0x987950,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
	green:0x458248,
	purple:0x551A8B,
	lightgreen:0x629265,
};



var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;


function createScene() {
	// Get the width and height of the screen
	// and use them to setup the aspect ratio
	// of the camera and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene.
	scene = new THREE.Scene();

	// Add FOV Fog effect to the scene. Same colour as the BG int he stylesheet.
	scene.fog = new THREE.Fog(0xf7d9aa, 150, 780);

	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 50;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);
	// Position the camera
	camera.position.x = 150;
	camera.position.y = 50;
	camera.rotation.y = Math.PI/8;
	//camera.rotation.x = -Math.PI/1;
	camera.position.z = 0;	

	// Create the renderer

	renderer = new THREE.WebGLRenderer ({
	// Alpha makes the background transparent, antialias is performant heavy
		alpha: true,
		antialias:true
	});

	//set the size of the renderer to fullscreen
	renderer.setSize (WIDTH, HEIGHT);
	//enable shadow rendering
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// Add the Renderer to the DOM, in the world div.
	container = document.getElementById('world');
	container.appendChild (renderer.domElement);

	//RESPONSIVE LISTENER
	window.addEventListener('resize', handleWindowResize, false);
}

//RESPONSIVE FUNCTION
function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	//camera.position.x = window.innerWidth/8;
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}


var hemispshereLight, shadowLight;

function createLights(){
	// Gradient coloured light - Sky, Ground, Intensity
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	// Parallel rays
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	shadowLight.position.set(0,350,350);
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -350;
	shadowLight.shadow.camera.right = 450;
	shadowLight.shadow.camera.top = 650;
	shadowLight.shadow.camera.bottom = -50;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// Shadow map size
	shadowLight.shadow.mapSize.width = 800;
	shadowLight.shadow.mapSize.height = 800;

	// Add the lights to the scene
	scene.add(hemisphereLight);  

	scene.add(shadowLight);
}	


Land = function(){
	var geom = new THREE.CylinderBufferGeometry(600,600,1700,40,10);
	//rotate on the x axis
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	//create a material
	var mat = new THREE.MeshPhongMaterial({
		color: Colors.lightgreen,
		shading:THREE.FlatShading,
	});

	//create a mesh of the object
	this.mesh = new THREE.Mesh(geom, mat);
	//receive shadows
	this.mesh.receiveShadow = true;
}

Sun = function(){

	this.mesh = new THREE.Object3D();

	var sunGeom = new THREE.SphereBufferGeometry( 400, 20, 10 );
	var sunMat = new THREE.MeshPhongMaterial({
		color: Colors.yellow,
		shading:THREE.FlatShading,
	});
	var sun = new THREE.Mesh(sunGeom, sunMat);
	//sun.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	sun.castShadow = false;
	sun.receiveShadow = false;
	this.mesh.add(sun);
}

Cloud = function(){
	// Create an empty container for the cloud
	this.mesh = new THREE.Object3D();
	// Cube geometry and material
	var geom = new THREE.DodecahedronGeometry(20,0);
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.white,  
	});

	var nBlocs = 3+Math.floor(Math.random()*3);

	for (var i=0; i<nBlocs; i++ ){
		//Clone mesh geometry
		var m = new THREE.Mesh(geom, mat);
			//Randomly position each cube
			m.position.x = i*15;
			m.position.y = Math.random()*10;
			m.position.z = Math.random()*10;
			m.rotation.z = Math.random()*Math.PI*2;
			m.rotation.y = Math.random()*Math.PI*2;

			//Randomly scale the cubes
			var s = .1 + Math.random()*.9;
			m.scale.set(s,s,s);

			// m.castShadow = true;
			// m.receiveShadow = true;
			//add to the container mesh
			this.mesh.add(m);
	}
}

Sky = function(){

	this.mesh = new THREE.Object3D();

	// Number of cloud groups
	this.nClouds = 25;

	// Space the consistenly
	var stepAngle = Math.PI*2 / this.nClouds;

	// Create the Clouds

	for(var i=0; i<this.nClouds; i++){
	
		var c = new Cloud();

		//set rotation and position using trigonometry
		var a = stepAngle*i;
		// this is the distance between the center of the axis and the cloud itself
		var h = 800 + Math.random()*200;
		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.x = Math.cos(a)*h;		

		// rotate the cloud according to its position
		c.mesh.rotation.z = a + Math.PI/2;

		// random depth for the clouds on the z-axis
		c.mesh.position.z = 0-Math.random()*600;

		// random scale for each cloud
		var s = 1+Math.random()*2;
		c.mesh.scale.set(s,s,s);

		this.mesh.add(c.mesh);
	}
}

Tree = function () {

	this.mesh = new THREE.Object3D();

	var matTreeLeaves = new THREE.MeshPhongMaterial( { color:Colors.green, shading:THREE.FlatShading});

	var geonTreeBase = new THREE.BoxBufferGeometry( 10,20,10 );
	var matTreeBase = new THREE.MeshBasicMaterial( { color:Colors.brown});
	var treeBase = new THREE.Mesh(geonTreeBase,matTreeBase);
	treeBase.castShadow = true;
	treeBase.receiveShadow = true;
	this.mesh.add(treeBase);

	var geomTreeLeaves1 = new THREE.CylinderBufferGeometry(1, 12*3, 12*3, 4 );
	var treeLeaves1 = new THREE.Mesh(geomTreeLeaves1,matTreeLeaves);
	treeLeaves1.castShadow = true;
	treeLeaves1.receiveShadow = true;
	treeLeaves1.position.y = 20
	this.mesh.add(treeLeaves1);

	var geomTreeLeaves2 = new THREE.CylinderBufferGeometry( 1, 9*3, 9*3, 4 );
	var treeLeaves2 = new THREE.Mesh(geomTreeLeaves2,matTreeLeaves);
	treeLeaves2.castShadow = true;
	treeLeaves2.position.y = 40;
	treeLeaves2.receiveShadow = true;
	this.mesh.add(treeLeaves2);

	var geomTreeLeaves3 = new THREE.CylinderBufferGeometry( 1, 6*3, 6*3, 4);
	var treeLeaves3 = new THREE.Mesh(geomTreeLeaves3,matTreeLeaves);
	treeLeaves3.castShadow = true;
	treeLeaves3.position.y = 55;
	treeLeaves3.receiveShadow = true;
	this.mesh.add(treeLeaves3);

}

Flower = function () {

	this.mesh = new THREE.Object3D();

	var geomStem = new THREE.BoxBufferGeometry( 5,50,5,1,1,1 );
	var matStem = new THREE.MeshPhongMaterial( { color:Colors.green, shading:THREE.FlatShading});
	var stem = new THREE.Mesh(geomStem,matStem);
	stem.castShadow = true;
	stem.receiveShadow = true;
	this.mesh.add(stem);


	var geomPetalCore = new THREE.BoxBufferGeometry(10,10,10,1,1,1);
	var matPetalCore = new THREE.MeshPhongMaterial({color:Colors.yellow, shading:THREE.FlatShading});
	petalCore = new THREE.Mesh(geomPetalCore, matPetalCore);
	petalCore.castShadow = true;
	petalCore.receiveShadow = true;

	var petalColor = petalColors [Math.floor(Math.random()*3)];

	var geomPetal = new THREE.BoxGeometry( 15,20,5,1,1,1 );
	var matPetal = new THREE.MeshBasicMaterial( { color:petalColor});
	geomPetal.vertices[5].y-=4;
	geomPetal.vertices[4].y-=4;
	geomPetal.vertices[7].y+=4;
	geomPetal.vertices[6].y+=4;
	geomPetal.translate(12.5,0,3);

		var petals = [];
		for(var i=0; i<4; i++){	

			petals[i]=new THREE.Mesh(geomPetal,matPetal);
			petals[i].rotation.z = i*Math.PI/2;
			petals[i].castShadow = true;
			petals[i].receiveShadow = true;
		}

	petalCore.add(petals[0],petals[1],petals[2],petals[3]);
	petalCore.position.y = 25;
	petalCore.position.z = 3;
	this.mesh.add(petalCore);

}

var petalColors = [Colors.red, Colors.yellow, Colors.blue];



Forest = function(){

	this.mesh = new THREE.Object3D();

	// Number of Trees
	this.nTrees = 300;

	// Space the consistenly
	var stepAngle = Math.PI*2 / this.nTrees;

	// Create the Trees

	for(var i=0; i<this.nTrees; i++){
	
		var t = new Tree();

		//set rotation and position using trigonometry
		var a = stepAngle*i;
		// this is the distance between the center of the axis and the tree itself
		var h = 605;
		t.mesh.position.y = Math.sin(a)*h;
		t.mesh.position.x = Math.cos(a)*h;		

		// rotate the tree according to its position
		t.mesh.rotation.z = a + (Math.PI/2)*3;

		// random depth for the tree on the z-axis
		t.mesh.position.z = -200-Math.random()*550;

		// random scale for each tree
		var s = .3+Math.random()*1.1;
		t.mesh.scale.set(s,s,s);

		this.mesh.add(t.mesh);
	}


		// Number of Trees
	this.nTreesForeground = 75;

	// Space the consistenly
	var stepAngleForeground = Math.PI*2 / this.nTreesForeground;

	// Create the Trees

	for(var i=0; i<this.nTreesForeground; i++){
	
		var tFore = new Tree();

		//set rotation and position using trigonometry
		var a = stepAngleForeground*i;
		// this is the distance between the center of the axis and the tree itself
		var h = 602;
		tFore.mesh.position.y = Math.sin(a)*h;
		tFore.mesh.position.x = Math.cos(a)*h;		

		// rotate the tree according to its position
		tFore.mesh.rotation.z = a + (Math.PI/2)*3;

		// random depth for the tree on the z-axis
		tFore.mesh.position.z = -40-Math.random()*80;

		// random scale for each tree
		var s = .3+Math.random()*0.8;
		tFore.mesh.scale.set(s,s,s);

		this.mesh.add(tFore.mesh);
	}

	// Number of Trees
	this.nFlowers = 300;

	var stepAngleFlowers = Math.PI*2 / this.nFlowers;


	for(var i=0; i<this.nFlowers; i++){	

		var f = new Flower();
		var a = stepAngleFlowers*i;

		var h = 602;
		f.mesh.position.y = Math.sin(a)*h;
		f.mesh.position.x = Math.cos(a)*h;		

		f.mesh.rotation.z = a + (Math.PI/2)*3;

		f.mesh.position.z = 0-Math.random()*450;

		var s = .1+Math.random()*.25;
		f.mesh.scale.set(s,s,s);

		this.mesh.add(f.mesh);
	}

}

var Fox = function(_color = Colors.red) {
	
	this.mesh = new THREE.Object3D();
	
	var redFurMat = new THREE.MeshPhongMaterial({color:_color, shading:THREE.FlatShading});

	// Create the Body
	var geomBody = new THREE.BoxGeometry(100,50,50,1,1,1);
	var body = new THREE.Mesh(geomBody, redFurMat);
	body.castShadow = true;
	body.receiveShadow = true;
	this.mesh.add(body);
	
	// Create the Chest
	var geomChest = new THREE.BoxGeometry(50,60,70,1,1,1);
	var chest = new THREE.Mesh(geomChest, redFurMat);
	chest.position.x = 60;
	chest.castShadow = true;
	chest.receiveShadow = true;
	this.mesh.add(chest);

	// Create the Head
	var geomHead = new THREE.BoxGeometry(40,55,50,1,1,1);
	this.head = new THREE.Mesh(geomHead, redFurMat);
	this.head.position.set(80, 35, 0);
	this.head.castShadow = true;
	this.head.receiveShadow = true;

	// Create the Snout
	var geomSnout = new THREE.BoxGeometry(40,30,30,1,1,1);
	var snout = new THREE.Mesh(geomSnout, redFurMat);
	geomSnout.vertices[0].y-=5;
	geomSnout.vertices[0].z+=5;
	geomSnout.vertices[1].y-=5;
	geomSnout.vertices[1].z-=5;
	geomSnout.vertices[2].y+=5;
	geomSnout.vertices[2].z+=5;
	geomSnout.vertices[3].y+=5;
	geomSnout.vertices[3].z-=5;
	snout.castShadow = true;
	snout.receiveShadow = true;
	snout.position.set(30,0,0);
	this.head.add(snout);

	// Create the Nose
	var geomNose = new THREE.BoxGeometry(10,15,20,1,1,1);
	var matNose = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	var nose = new THREE.Mesh(geomNose, matNose);
	nose.position.set(55,0,0);
	this.head.add(nose);

	// Create the Ears
	var geomEar = new THREE.BoxGeometry(10,40,30,1,1,1);
	var earL = new THREE.Mesh(geomEar, redFurMat);
	earL.position.set(-10,40,-18);
	this.head.add(earL);
	earL.rotation.x=-Math.PI/10;
	geomEar.vertices[1].z+=5;
	geomEar.vertices[4].z+=5;
	geomEar.vertices[0].z-=5;
	geomEar.vertices[5].z-=5;

	// Create the Ear Tips
	var geomEarTipL = new THREE.BoxGeometry(10,10,20,1,1,1);
	var matEarTip = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var earTipL = new THREE.Mesh(geomEarTipL, matEarTip);
	earTipL.position.set(0,25,0);
	earL.add(earTipL);

	var earR = earL.clone();
	earR.position.z = -earL.position.z;
	earR.rotation.x = -	earL.rotation.x;
	this.head.add(earR);

	this.mesh.add(this.head);

	
	// Create the tail
	var geomTail = new THREE.BoxGeometry(80,40,40,2,1,1);
	geomTail.vertices[4].y-=10;
	geomTail.vertices[4].z+=10;
	geomTail.vertices[5].y-=10;
	geomTail.vertices[5].z-=10;
	geomTail.vertices[6].y+=10;
	geomTail.vertices[6].z+=10;
	geomTail.vertices[7].y+=10;
	geomTail.vertices[7].z-=10;
	this.tail = new THREE.Mesh(geomTail, redFurMat);
	this.tail.castShadow = true;
	this.tail.receiveShadow = true;

	// Create the tail Tip
	var geomTailTip = new THREE.BoxGeometry(20,40,40,1,1,1);
	var matTailTip = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var tailTip = new THREE.Mesh(geomTailTip, matTailTip);
	tailTip.position.set(80,0,0);
	tailTip.castShadow = true;
	tailTip.receiveShadow = true;
	this.tail.add(tailTip);
	this.tail.position.set(-40,10,0);
	geomTail.translate(40,0,0);
	geomTailTip.translate(10,0,0);
	//this.tail.rotation.z = Math.PI/1.5;
	this.mesh.add(this.tail);


	// Create the Legs
	var geomLeg = new THREE.BoxGeometry(20,60,20,1,1,1);
	this.legFR = new THREE.Mesh(geomLeg, redFurMat);
	this.legFR.castShadow = true;
	this.legFR.receiveShadow = true;

	// Create the feet
	var geomFeet = new THREE.BoxGeometry(20,20,20,1,1,1);
	var matFeet = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var feet = new THREE.Mesh(geomFeet, matFeet);
	feet.position.set(0,0,0);
	feet.castShadow = true;
	feet.receiveShadow = true;
	this.legFR.add(feet);
	this.legFR.position.set(70,-12,25);
	geomLeg.translate(0,-40,0);
	geomFeet.translate(0,-80,0);
	//this.legFR.rotation.z = 16;
	this.mesh.add(this.legFR);

	this.legFL = this.legFR.clone();
	this.legFL.position.z = -this.legFR.position.z;
	//this.legFL.rotation.z = -this.legFR.rotation.z;
	this.mesh.add(this.legFL);

	this.legBR = this.legFR.clone();
	this.legBR.position.x = -(this.legFR.position.x)+50;
	//this.legBR.rotation.z = -this.legFR.rotation.z;
	this.mesh.add(this.legBR);

	this.legBL = this.legFL.clone();
	this.legBL.position.x = -(this.legFL.position.x)+50;
	//this.legBL.rotation.z = -this.legFL.rotation.z;
	this.mesh.add(this.legBL);

};


var fox;


var sky;
var forest;
var land;
var orbit;
var sun;


var mousePos={x:0, y:0};
var offSet = -600;


function createSky(){
  sky = new Sky();
  sky.mesh.position.y = offSet;
  scene.add(sky.mesh);
}

function createLand(){
  land = new Land();
  land.mesh.position.y = offSet;
  scene.add(land.mesh);
}


function createForest(){
  forest = new Forest();
  forest.mesh.position.y = offSet;
  scene.add(forest.mesh);
}

function createSun(){ 
	sun = new Sun();
	sun.mesh.scale.set(1,1,.3);
	sun.mesh.position.set(0,-30,-850);
	scene.add(sun.mesh);
}

function createFox(){ 
	fox = new Fox();
	fox.mesh.scale.set(.15,.15,.15);
	//fox.mesh.rotation.y = -Math.PI/4 ;
	fox.mesh.position.set(50,12,-150);
	scene.add(fox.mesh);
}

function createFoxMini(){ 
	foxMini = new Fox(Colors.brownLight);
	foxMini.mesh.scale.set(.075,.075,.075);
	foxMini.mesh.position.set(25,6,-130);
	scene.add(foxMini.mesh);
}

function createFoxMiniTwo(){ 
	foxMiniTwo = new Fox();
	foxMiniTwo.mesh.scale.set(.075,.075,.075);
	foxMiniTwo.mesh.position.set(0,6,-135);
	scene.add(foxMiniTwo.mesh);
}

function updateFox() {
  	if ( fox.mesh) {
        fox.mesh.rotation.z = Math.sin(Date.now() * 0.006) * Math.PI * 0.08 ;
    }

	if ( fox.legFR) {
        fox.legFR.rotation.z = Math.sin(Date.now() * 0.006 + 1.2) * Math.PI * 0.3 ;
    }
   if ( fox.legBR) {
        fox.legBR.rotation.z = Math.sin(Date.now() * 0.006) * Math.PI * 0.3 ;
    }

   if ( fox.legFL) {
        fox.legFL.rotation.z = Math.sin(Date.now() * 0.006 + 1.2) * -(Math.PI * 0.3) ;
    }

    if ( fox.legBL) {
        fox.legBL.rotation.z = Math.sin(Date.now() * 0.006) * -Math.PI * 0.3 ;
    }
    if ( fox.tail) {
        fox.tail.rotation.z = Math.sin(Date.now() * 0.006) * (Math.PI * 0.08) + Math.PI/1.2 ;
        fox.tail.rotation.x = Math.sin(Date.now() * 0.006) * Math.PI * 0.08;
        fox.tail.rotation.y = Math.sin(Date.now() * 0.006) * Math.PI * 0.2;
    }
    if ( fox.head) {
        fox.head.rotation.z = Math.sin(Date.now() * 0.006) * -Math.PI * 0.05 ;
         fox.head.rotation.x = Math.sin(Date.now() * 0.006) * -Math.PI * 0.05 ;
    }
}

function updateFoxMini() {
  	if ( foxMini.mesh) {
        foxMini.mesh.rotation.z = Math.sin(Date.now() * 0.0075) * Math.PI * 0.08 ;
    }

	if ( foxMini.legFR) {
        foxMini.legFR.rotation.z = Math.sin(Date.now() * 0.0075 + 1.2) * Math.PI * 0.3 ;
    }
   if ( foxMini.legBR) {
        foxMini.legBR.rotation.z = Math.sin(Date.now() * 0.0075) * Math.PI * 0.3 ;
    }

   if ( foxMini.legFL) {
        foxMini.legFL.rotation.z = Math.sin(Date.now() * 0.0075 + 1.2) * -(Math.PI * 0.3) ;
    }

    if ( foxMini.legBL) {
        foxMini.legBL.rotation.z = Math.sin(Date.now() * 0.0075) * -Math.PI * 0.3 ;
    }
    if ( foxMini.tail) {
        foxMini.tail.rotation.z = Math.sin(Date.now() * 0.0075) * (Math.PI * 0.08) + Math.PI/1.2 ;
        foxMini.tail.rotation.x = Math.sin(Date.now() * 0.0075) * Math.PI * 0.08;
        foxMini.tail.rotation.y = Math.sin(Date.now() * 0.0075) * Math.PI * 0.2;
    }
    if ( foxMini.head) {
        foxMini.head.rotation.z = Math.sin(Date.now() * 0.0075) * -Math.PI * 0.05 ;
         foxMini.head.rotation.x = Math.sin(Date.now() * 0.0075) * -Math.PI * 0.05 ;
    }
}

function updateFoxMiniTwo() {
  	if ( foxMiniTwo.mesh) {
        foxMiniTwo.mesh.rotation.z = Math.sin(Date.now() * 0.0075 + 1) * Math.PI * 0.08 ;
    }

	if ( foxMiniTwo.legFR) {
        foxMiniTwo.legFR.rotation.z = Math.sin(Date.now() * 0.0075 + 2.2) * Math.PI * 0.3 ;
    }
   if ( foxMiniTwo.legBR) {
        foxMiniTwo.legBR.rotation.z = Math.sin(Date.now() * 0.0075 + 1) * Math.PI * 0.3 ;
    }

   if ( foxMiniTwo.legFL) {
        foxMiniTwo.legFL.rotation.z = Math.sin(Date.now() * 0.0075 + 2.2) * -(Math.PI * 0.3) ;
    }

    if ( foxMiniTwo.legBL) {
        foxMiniTwo.legBL.rotation.z = Math.sin(Date.now() * 0.0075 + 1) * -Math.PI * 0.3 ;
    }
    if ( foxMiniTwo.tail) {
        foxMiniTwo.tail.rotation.z = Math.sin(Date.now() * 0.0075 + 1) * (Math.PI * 0.08) + Math.PI/1.2 ;
        foxMiniTwo.tail.rotation.x = Math.sin(Date.now() * 0.0075 + 1) * Math.PI * 0.08;
        foxMiniTwo.tail.rotation.y = Math.sin(Date.now() * 0.0075 + 1) * Math.PI * 0.2;
    }
    if ( foxMiniTwo.head) {
        foxMiniTwo.head.rotation.z = Math.sin(Date.now() * 0.0075 + 1) * -Math.PI * 0.05 ;
         foxMiniTwo.head.rotation.x = Math.sin(Date.now() * 0.0075 + 1) * -Math.PI * 0.05 ;
    }
}

function loop(){
  land.mesh.rotation.z += .003;
  sky.mesh.rotation.z += .001;
  forest.mesh.rotation.z += .003;
  updateFox();
  updateFoxMini();
  updateFoxMiniTwo();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}


function init(event) {
	createScene();
	createLights();
	createFox();
	createFoxMini();
	createFoxMiniTwo();
	createSun();
	createLand();
	createForest();
	createSky();
	loop();
}

window.addEventListener('load', init, false);