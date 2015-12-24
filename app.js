(function(THREE){
	'use strict';

	var renderer = new THREE.WebGLRenderer({
			antialias: true
		}),
		scene = new THREE.Scene(),
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000),
		controls,
		spot = new THREE.SpotLight(0xffffff, 1),
		spotHelper = new THREE.SpotLightHelper( spot ),
		raycaster = new THREE.Raycaster(),
		down = new THREE.Vector3(0,-1,0),
		fpv,
		terrain,
		playerMesh,
		keys = {},
		useFPV = true,
		mousedown = false;

	if(useFPV){
		fpv = new FPV(camera);
	}
	else{
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.1;
		controls.minPolarAngle = Math.PI/8;
		controls.maxPolarAngle = Math.PI/2 - 0.1;
		camera.position.set(0,10,50);
	}

	function init(){

		document.body.appendChild(renderer.domElement);
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;

		spot.castShadow = true;
		spot.shadowCameraNear = 10;
		spot.shadowMapWidth = spot.shadowMapHeight = 2048;
		spot.shadowCameraFov = 30;
		spot.angle = 30*Math.PI/180;
		scene.add(spot, spotHelper);

		if(useFPV){
			scene.add(fpv);
		}

		spot.position.set(240,45,0);
		loadTerrain();

		window.addEventListener('keydown', keyDownHandler, false);
		window.addEventListener('keyup', keyUpHandler, false);
		window.addEventListener('resize', onWindowResize, false);
		window.addEventListener('mousedown', mouseDownHandler, false);
		window.addEventListener('mouseup', mouseUpHandler, false);

		animate();
	}

	init();

	function animate(){
		window.requestAnimationFrame(animate);
		if(useFPV){
			move();
		}
		else {
			controls.update();
		}

		spotHelper.update();
		renderer.render(scene, camera);
	}

	function loadTerrain(){
		var txLoad = new THREE.TextureLoader();
		txLoad.load('imbrium.jpg', function(tex){
			var detail = 128;
			var scale = 2;
			var mapGeo = new THREE.PlaneGeometry(100,100,detail,detail),
				mapCan = document.createElement('canvas'),
				mapCtx = mapCan.getContext('2d'),
				mapMat = new THREE.MeshStandardMaterial({
				roughness: 1,
				metalness: 0,
				color: 0xaaaaa0
			});
			mapCan.width = detail;
			mapCan.height = detail;
			mapCtx.drawImage(tex.image,0,0,detail,detail);
			var mapData = mapCtx.getImageData(0,0,mapCan.width,mapCan.height);
			mapGeo.vertices.forEach(function(vv){
				var vx = Math.round((vv.x + detail/2)*mapCan.width/detail);
				var vy = Math.round((vv.y + detail/2)*mapCan.height/detail);
				var pixel = mapData.data[vy*mapCan.width*4+vx*4];
				vv.z = scale*pixel/256; //just red channel
			});
			mapGeo.verticesNeedUpdate = true;
			mapGeo.computeVertexNormals();
			mapGeo.computeFaceNormals();
			mapGeo.elementsNeedUpdate = true;
			mapGeo.normalsNeedUpdate = true;
			terrain = new THREE.Mesh(mapGeo, mapMat);
			terrain.rotation.x -= Math.PI/2;
			terrain.castShadow = true;
			terrain.receiveShadow = true;
			scene.add(terrain);
			txLoad.load('imbrium-normal.jpg', function(tex){
				mapMat.normalMap = tex;
				mapMat.needsUpdate = true;
			});
		});
	}

	function FPV(camera){
		var pitch = new THREE.Object3D(),
			yaw = new THREE.Object3D(),
			debugGeo = new THREE.CylinderGeometry(0.25,0.25,1),
			debugMat = new THREE.MeshStandardMaterial({
				color: 0xff0000,
				metalness:0.1,
				roughness:0.8
			}),
			pi2 = Math.PI/2;
		playerMesh = new THREE.Mesh(debugGeo, debugMat);
		pitch.position.set(0,1.2,5);
		playerMesh.position.set(0,0.5,0);
		playerMesh.castShadow = true;
		pitch.add(camera);
		yaw.add(pitch,playerMesh);
		function mouseMoveHandler(e){
			if(mousedown){
				var du = (window.innerWidth/2 - e.clientX)/window.innerWidth,
					dv = (window.innerHeight/2 - e.clientY)/window.innerHeight;
				yaw.rotation.y += 0.05 * (du - mousedown.u);
				pitch.rotation.x += 0.05 * (dv - mousedown.v);
				pitch.rotation.x = Math.max(-pi2, Math.min(pi2, pitch.rotation.x));
			}
		}
		window.addEventListener('mousemove', mouseMoveHandler, false);
		return yaw;
	}

	function move(){
		var speed = 0.1;
		if(keys[87]){
			fpv.translateZ(-speed);
		}
		else if(keys[83]){
			fpv.translateZ(speed);
		}

		if(keys[65]){
			fpv.translateX(-speed);
		}
		else if(keys[68]){
			fpv.translateX(speed);
		}
		if(terrain){
			raycaster.set(new THREE.Vector3(fpv.position.x,fpv.position.y+10,fpv.position.z), down);
			var groundPt = raycaster.intersectObject(terrain, false);
			if(groundPt.length){
				fpv.position.y = groundPt[0].point.y;
			}
		}
	}

	function keyDownHandler(e){
		if(e.keyCode){
			keys[e.keyCode] = true;
		}
	}

	function keyUpHandler(e){
		if(e.keyCode){
			keys[e.keyCode] = false;
		}
	}

	function mouseDownHandler(e){
		e.preventDefault();
		var u = (window.innerWidth/2 - e.clientX)/window.innerWidth,
			v = (window.innerHeight/2 - e.clientY)/window.innerHeight;
		mousedown = {u:u, v:v};
	}

	function mouseUpHandler(){
		mousedown = false;
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

})(window.THREE);