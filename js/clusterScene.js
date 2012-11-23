"use strict";

var clusterScene = {
	camera: null,
	scene: null,
	renderer: null,

	geometry: null,
	material: null,
	mesh: null,

	cameraStep: -1,

	starTexture: THREE.ImageUtils.loadTexture( "textures/sprites/particle.png" ),

	init: function () {

		clusterScene.camera = new THREE.PerspectiveCamera( 24, $("#render").width() / $("#render").height(), 0.1, 5000 );
		clusterScene.camera.position.z = 500;

		clusterScene.scene = new THREE.Scene();

		clusterScene.universe = new THREE.Object3D();
		clusterScene.scene.add( clusterScene.universe );

		clusterScene.renderer = new THREE.WebGLRenderer();
		clusterScene.renderer.setSize( $("#render").width() , $("#render").height() );
		clusterScene.renderer.setClearColorHex( 0x000000, 1 );


		// Add stars

		var coreGeometry = new THREE.Geometry();
		
		for (var i = 0; i < 1800; i++) {
		
				var radius = Math.random() * 380;
				var longitude = Math.PI - (Math.random() * (2*Math.PI));
				var latitude =  (Math.random() * Math.PI);
				
				var x = radius * Math.cos(longitude) * Math.sin(latitude);
				var z = radius * Math.sin(longitude) * Math.sin(latitude);
				var y = radius * Math.cos(latitude); 	

			coreGeometry.vertices.push( new THREE.Vector3( x, y, z ) );				
		
		}	
		
		var coreMaterial = new THREE.ParticleBasicMaterial( { 
			size: 8,map: clusterScene.starTexture , 
			depthTest: false,  blending: THREE.AdditiveBlending, 
			transparent : true , opacity: .75} );
		coreMaterial.color.setHSV( .65, .0, .8 );

		var coreParticles = new THREE.ParticleSystem( coreGeometry, coreMaterial );

		clusterScene.universe.add(coreParticles);


		// Append canvas

		$("#render").append( clusterScene.renderer.domElement );

	},

	drawClusters: function (centroids,groups) {

		console.log("culsterScene.drawClusters()");

		var pixelCount = 0;

		for (var i = 0; i < groups.length; i++) {
			pixelCount += groups[i].length;
		}
		
		var centroidGeometry = new THREE.SphereGeometry( 5, 16, 16);

		for (var i = 0; i < centroids.length; i++) {		

			var centroid = centroids[i];
			var group = groups[i];
			//console.log(centroid);

			var groupWeight = group.length / pixelCount;
			console.log(groupWeight);

			var centroidObject = new THREE.Object3D();
			//centroidObject.position.x = centroid[0] - 128;
			//centroidObject.position.y = centroid[1] - 128;
			//centroidObject.position.z = centroid[2] - 128;	

			var centroidRGB = new THREE.Color();
			centroidRGB.setRGB(centroid[0]/255,centroid[1]/255,centroid[2]/255);
			var centroidLAB = centroidRGB.getLAB();
			console.log(centroidLAB);

			centroidObject.position.y = (64-centroidLAB.l) ;
			centroidObject.position.x = centroidLAB.a * 2;
			centroidObject.position.z = centroidLAB.b * 2;	

			//var centroidMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
			//centroidMaterial.color.setRGB(centroid[0]/255,centroid[1]/255,centroid[2]/255);

			//var centroidMesh = new THREE.Mesh( centroidGeometry, centroidMaterial );
			// centroidMesh.position.x = centroid[0] - 128;
			// centroidMesh.position.y = centroid[1] - 128;
			// centroidMesh.position.z = centroid[2] - 128;

			// centroidObject.add( centroidMesh);		

			// Shader 

			var particleShader = THREE.ShaderUtils.lib["cluster"];
			var particleUniforms = THREE.UniformsUtils.clone( particleShader.uniforms );

			particleUniforms["map"].value = clusterScene.starTexture;
			particleUniforms["scale"].value = 100;
			particleUniforms["opacity"].value = .75;

	        var particleAttributes = {
	                size: { type: 'f', value: [] },
	        };				

	    	var groupColors = [];

			// Geometry

			var groupGeometry = new THREE.Geometry();
			groupGeometry.colors = groupColors;

			// Populate

			for ( var j = 0; j < group.length; j+=2 ) {

				var radius = Math.random() * (256 * groupWeight);
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
				particleAttributes.size.value.push(4.0 + Math.random() * 8.0);

			}

			// Material 

			var groupMaterial = new THREE.ShaderMaterial( {
				uniforms: particleUniforms,
				attributes: particleAttributes,
				vertexShader: particleShader.vertexShader,
				fragmentShader: particleShader.fragmentShader,
				vertexColors: true,
				blending: THREE.AdditiveBlending, transparent:true,
				depthTest: false
			});				

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

        clusterScene.universe.rotation.y += 0.001;

        if (clusterScene.camera.position.z < 0 || clusterScene.camera.position.z > 500)
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