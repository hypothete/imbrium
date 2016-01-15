(function(THREE){
	'use strict';

	var raycaster = new THREE.Raycaster(),
		down = new THREE.Vector3(0,-1,0),
		groundPt,

		terrain = {
			loaded: false,
			obj: null,

			load: function(scene){
				var txLoad = new THREE.TextureLoader();
				txLoad.load('imbrium.jpg', function(tex){
					var detail = 256,
						scale = 3,
						mapGeo = new THREE.PlaneGeometry(115,115,detail,detail),
						mapCan = document.createElement('canvas'),
						mapCtx = mapCan.getContext('2d'),
						mapMat = new THREE.MeshStandardMaterial({
						roughness: 1,
						metalness: 0,
						color: 0xaaaaa0
					});

					mapCan.width = 1024;
					mapCan.height = 1024;
					mapCtx.drawImage(tex.image,0,0,mapCan.width,mapCan.height);
					var mapData = mapCtx.getImageData(0,0,mapCan.width,mapCan.height);

					mapGeo.vertices.forEach(function(vv){
						var vx = Math.round((vv.x + detail/2)*mapCan.width/detail);
						var vy = Math.round((vv.y + detail/2)*mapCan.height/detail);
						var pixel = mapData.data[vy*mapCan.width*4+vx*4];
						vv.z = scale*pixel/256; //just red channel
					});

					mapGeo.verticesNeedUpdate = true;
					mapGeo.computeFaceNormals();
					mapGeo.computeVertexNormals();
					mapGeo.normalsNeedUpdate = true;
					terrain.obj = new THREE.Mesh(mapGeo, mapMat);
					terrain.obj.rotation.x -= Math.PI/2;
					terrain.obj.castShadow = true;
					terrain.obj.receiveShadow = true;
					scene.add(terrain.obj);

					txLoad.load('imbrium-normal.jpg', function(tex){
						mapMat.normalMap = tex;
						mapMat.needsUpdate = true;
						terrain.loaded = true;
					});

				});
			},

			getAltitude: function(pt){
				if(this.loaded){
					raycaster.set(new THREE.Vector3(pt.x,pt.y+100,pt.z), down);
					groundPt = raycaster.intersectObject(terrain.obj, false);
					if(groundPt.length){
						return groundPt[0].point.y;
					}
				}
				return undefined;
			}
	};

	window.loadTerrain = function(scene){
		terrain.load(scene);
		return terrain;
	}


})(window.THREE);
