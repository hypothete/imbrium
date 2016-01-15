(function(THREE, localStorage){
	'use strict';

	window.FPV = function(camera, renderer){
		var fpv = {
				speed: 0.3,
				terrain: null,
				camera: camera,
			},
			keys = {},
			mousedown,
			pitch = new THREE.Object3D(),
			yaw = new THREE.Object3D(),
			debugGeo = new THREE.CylinderGeometry(0.25,0.25,1),
			debugMat = new THREE.MeshStandardMaterial({
				color: 0xff0000,
				metalness:0.1,
				roughness:0.8
			}),
			pi2 = Math.PI/2,
			playerMesh = new THREE.Mesh(debugGeo, debugMat);

		fpv.obj = yaw;
		yaw.name = 'FPV';
		pitch.position.set(0,1.2,5);
		playerMesh.position.set(0,0.5,0);
		playerMesh.castShadow = true;
		playerMesh.receiveShadow = true;
		pitch.add(camera);
		yaw.add(pitch,playerMesh);

		fpv.setTerrain = function(terrain){
			fpv.terrain = terrain;
		};

		fpv.move = function(){
			if(fpv.obj === null || !fpv.terrain.imageData) return;

			if(keys[87]){
				fpv.obj.translateZ(-fpv.speed);
			}
			else if(keys[83]){
				fpv.obj.translateZ(fpv.speed);
			}

			if(keys[65]){
				fpv.obj.translateX(-fpv.speed);
			}
			else if(keys[68]){
				fpv.obj.translateX(fpv.speed);
			}
			fpv.obj.position.y = fpv.terrain.getAltitude(fpv.obj.position) || fpv.obj.position.y || 0;

			localStorage.setItem('fpv-position', JSON.stringify([
				fpv.obj.position,
				fpv.obj.children[0].rotation.x,
				fpv.obj.rotation.y,
				camera.position.z
			]));
		};

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

		function mouseMoveHandler(e){
			if(mousedown){
				var du = (window.innerWidth/2 - e.clientX)/window.innerWidth,
					dv = (window.innerHeight/2 - e.clientY)/window.innerHeight;
				yaw.rotation.y += 0.05 * (du - mousedown.u);
				pitch.rotation.x += 0.05 * (dv - mousedown.v);
				pitch.rotation.x = Math.max(-pi2, Math.min(pi2, pitch.rotation.x));
			}
		}

		function mouseUpHandler(){
			mousedown = false;
		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		function wheelHandler(e){
			var length = camera.position.length();
			camera.position.z += (0.1*length+0.01)*Math.abs(e.deltaY)/e.deltaY;
		}

		window.addEventListener('mousemove', mouseMoveHandler, false);
		window.addEventListener('keydown', keyDownHandler, false);
		window.addEventListener('keyup', keyUpHandler, false);
		window.addEventListener('resize', onWindowResize, false);
		window.addEventListener('mousedown', mouseDownHandler, false);
		window.addEventListener('mouseup', mouseUpHandler, false);
		window.addEventListener('wheel', wheelHandler, false);

		return fpv;
	};
	
})(window.THREE, window.localStorage);
