(function(THREE){
	'use strict';

	var raycaster = new THREE.Raycaster(),
		down = new THREE.Vector3(0,-1,0),
		groundPt,
		txLoad = new THREE.TextureLoader(),

		terrain = {
			obj: new THREE.Object3D(),
			width: 1145, //meters
			height: 1145,
			imageData: null,
			imageWidth: null,
			imageHeight: null,
			material: new THREE.MeshStandardMaterial({
				roughness: 1,
				metalness: 0,
				color: 0xaaaaa0
			}),
			chunkSize: 10, //meters
			chunkDetail: 16, //vertices
			normalMap: null,

			loadImageData: function(callback){
				txLoad.load('imbrium.jpg', function(tex){
					var mapCan = document.createElement('canvas'),
						mapCtx = mapCan.getContext('2d');
					mapCan.width = tex.image.width;
					mapCan.height = tex.image.height;
					mapCtx.drawImage(tex.image,0,0,mapCan.width,mapCan.height);
					terrain.imageData = mapCtx.getImageData(0,0,mapCan.width,mapCan.height).data;
					terrain.imageWidth = tex.image.width;
					terrain.imageHeight = tex.image.height;
					if(callback) callback();
				});
			},

			loadNormalMap: function(){
				txLoad.load('imbrium-normal.jpg', function(tex){
					this.material.normalMap = tex;
					this.material.needsUpdate = true;
				});
			},

			getHeightAt: function(pos){
				//pos is assumed to be in the scene, so xz
				var vx = Math.round(terrain.imageWidth * (pos.x + terrain.width/2)/terrain.width);
				var vy = Math.round(terrain.imageHeight * (pos.y + terrain.height/2)/terrain.height);
				var pixel = terrain.imageData[vy*terrain.imageWidth*4+vx*4];
				return pixel/256; //just red channel, returns between 0 and 1
			},

			makeChunk: function(pos){
				var chunkGeo = new THREE.PlaneGeometry(terrain.chunkSize,terrain.chunkSize,terrain.chunkDetail,terrain.chunkDetail),
					chunkMat = terrain.material.clone(),
					chunk = new THREE.Mesh(chunkGeo, chunkMat);

				//reading in values from the scene, so xz are coords in pos
				chunk.position.x = Math.round((pos.x + terrain.width/2)/(terrain.width/ terrain.chunkSize));
				chunk.position.z = Math.round((pos.z + terrain.height/2)/(terrain.height/ terrain.chunkSize));

				chunk.name = chunk.position.x + '-' + chunk.position.z;

				//set chunk heightmap
				chunkGeo.vertices.forEach(function(vv){
					vv.z = terrain.getHeightAt(new THREE.Vector3(vv.x+terrain.chunkSize/2, 0, vv.y+terrain.chunkSize/2).add(chunk.position));
				});

				chunkGeo.verticesNeedUpdate = true;
				chunkGeo.computeFaceNormals();
				chunkGeo.computeVertexNormals();
				chunkGeo.normalsNeedUpdate = true;

				chunk.rotation.x -= Math.PI/2;
				chunk.castShadow = true;
				chunk.receiveShadow = true;

				//update texture position

				terrain.obj.add(chunk);
			},

			getAltitude: function(pt){
				raycaster.set(new THREE.Vector3(pt.x,pt.y+100,pt.z), down);
				groundPt = raycaster.intersectObject(terrain.obj, true);
				if(groundPt.length){
					return groundPt[0].point.y;
				}
			}
	};

	window.loadTerrain = function(scene, callback){
		terrain.obj.name = 'terrain';
		terrain.loadImageData(callback);
		scene.add(terrain.obj);
		return terrain;
	};

})(window.THREE);
