(function(THREE, console, localStorage, loadTerrain, FPV){
	'use strict';

	var renderer = new THREE.WebGLRenderer({
			antialias: true
		}),
		scene = new THREE.Scene(),
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000),
		spot = new THREE.SpotLight(0xffffff, 1),
		spotHelper = new THREE.SpotLightHelper( spot ),
		terrain,
		fpv = new FPV(camera, renderer);

	function init(){
		document.body.appendChild(renderer.domElement);
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		renderer.domElement.setAttribute('oncontextmenu', 'return false');

		spot.castShadow = true;
		spot.shadowCameraNear = 100;
		spot.shadowMapWidth = spot.shadowMapHeight = 2048;
		spot.shadowCameraFov = 25;
		spot.angle = 25*Math.PI/180;

		var storedPositions = JSON.parse(localStorage.getItem('fpv-position'));

		if (storedPositions && storedPositions.length){
			fpv.obj.position.set(storedPositions[0].x, storedPositions[0].y, storedPositions[0].z);
			fpv.obj.children[0].rotation.x = storedPositions[1];
			fpv.obj.rotation.y = storedPositions[2];
			camera.position.z = storedPositions[3];
		}
		scene.add(fpv.obj);
		scene.add(spot, spotHelper);
		spot.position.set(250,45,0);
		terrain = loadTerrain(scene, function(){
			// for(var i=0; i<3; i++){
			// 	for(var j=0; j<3; j++){
			// 		terrain.makeChunk(new THREE.Vector3(i*10,0,j*10));
			// 	}
			// }
			terrain.makeChunk(fpv.obj.position);
			animate();
		});
		fpv.setTerrain(terrain);
	}

	init();

	function animate(){
		window.requestAnimationFrame(animate);
		fpv.move();
		spotHelper.update();
		renderer.render(scene, camera);
	}

	// function getWorldPosition(ob){
	// 	scene.updateMatrixWorld();
	// 	var obWorldPosition = new THREE.Vector3();
	// 	obWorldPosition.setFromMatrixPosition( ob.matrixWorld );
	// 	return obWorldPosition;
	// }


})(window.THREE, window.console, window.localStorage, window.loadTerrain, window.FPV);
