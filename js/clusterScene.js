"use strict";

var clusterScene = {
	camera: null,
	scene: null,
	renderer: null,

	geometry: null,
	material: null,
	mesh: null,

	cameraStep: -1,

	init: function () {

		clusterScene.camera = new THREE.PerspectiveCamera( 24, $("#render").width() / $("#render").height(), 0.1, 5000 );
		clusterScene.camera.position.z = 1000;

		clusterScene.scene = new THREE.Scene();
		//clusterScene.scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );

		clusterScene.universe = new THREE.Object3D();
		clusterScene.scene.add( clusterScene.universe );

		clusterScene.renderer = new THREE.WebGLRenderer();
		clusterScene.renderer.setSize( $("#render").width() , $("#render").height() );
		clusterScene.renderer.setClearColorHex( 0x000000, 1 );


		$("#render").append( clusterScene.renderer.domElement );

	},

	drawClusters: function (centroids,groups) {

		console.log("culsterScene.drawClusters()");
		
		var centroidGeometry = new THREE.SphereGeometry( 5, 16, 16);

		for (var i = 0; i < centroids.length; i++) {		

			var centroid = centroids[i];
			var group = groups[i];
			//console.log(centroid);

			var centroidObject = new THREE.Object3D();
			centroidObject.position.x = centroid[0] - 128;
			centroidObject.position.y = centroid[1] - 128;
			centroidObject.position.z = centroid[2] - 128;				

			var centroidMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
			centroidMaterial.color.setRGB(centroid[0]/255,centroid[1]/255,centroid[2]/255);

			var centroidMesh = new THREE.Mesh( centroidGeometry, centroidMaterial );
			// centroidMesh.position.x = centroid[0] - 128;
			// centroidMesh.position.y = centroid[1] - 128;
			// centroidMesh.position.z = centroid[2] - 128;

			// centroidObject.add( centroidMesh);		

			// Material

			var particleShader = THREE.ShaderUtils.lib["cluster"];
			var particleUniforms = THREE.UniformsUtils.clone( particleShader.uniforms );

			particleUniforms["map"].value = THREE.ImageUtils.loadTexture( "textures/sprites/particle.png" );
			particleUniforms["size"].value = 8;
			particleUniforms["scale"].value = 100;
		
			var groupMaterial = new THREE.ShaderMaterial( {
				uniforms: particleUniforms,
				vertexShader: particleShader.vertexShader,
				fragmentShader: particleShader.fragmentShader,
				vertexColors: true,
				blending: THREE.AdditiveBlending, transparent:true,
				depthTest: false
			});				

			console.log(groupMaterial);

			// Geometry

			var groupGeometry = new THREE.Geometry();
			var groupColors = [];

			for ( var j = 0; j < group.length; j+=2 ) {

				var radius = Math.random() * 32;
				var longitude = Math.PI - (Math.random() * (2*Math.PI));
				var latitude =  (Math.random() * Math.PI);

				var x = radius * Math.cos(longitude) * Math.sin(latitude);
				var z = radius * Math.sin(longitude) * Math.sin(latitude);
				var y = radius * Math.cos(latitude); 

				var vector = new THREE.Vector3( x, y, z );
				groupGeometry.vertices.push( vector );	

				var pixelColor = new THREE.Color( 0xffffff );
				pixelColor.setRGB( group[j][0]/255, group[j][1]/255, group[j][2]/255);	

				groupColors.push(pixelColor)			

			}

			groupGeometry.colors = groupColors;

			//var groupMaterial = new THREE.ParticleBasicMaterial( { map: THREE.ImageUtils.loadTexture( "textures/sprites/particle.png"),size: 6, depthTest: false,  blending: THREE.AdditiveBlending, transparent : true, vertexColors: true } );
			//console.log(groupMaterial);

			var groupMesh = new THREE.ParticleSystem( groupGeometry, groupMaterial );			

			centroidObject.add(groupMesh);
			clusterScene.universe.add(centroidObject);

		}
	},

	animate: function () {

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( clusterScene.animate );

        clusterScene.universe.rotation.y += 0.0001;

        if (clusterScene.camera.position.z < 0 || clusterScene.camera.position.z > 1500)
        	clusterScene.cameraStep *= -1;
    	
    	clusterScene.camera.position.z += clusterScene.cameraStep;


		for ( var i = 0; i < clusterScene.universe.children.length; i ++ ) {

			var object = clusterScene.universe.children[ i ];

			if ( object instanceof THREE.Object3D ) {

				object.rotation.y += 0.01;

			}

		}


        clusterScene.renderer.render( clusterScene.scene, clusterScene.camera );

    }


}