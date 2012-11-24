/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

var clusterScene = {
	startTime: Date.now(),

	camera: null,
	controls: null,
	scene: null,
	renderer: null,

	geometry: null,
	material: null,
	mesh: null,

	cameraStep: -1,

	starTexture: THREE.ImageUtils.loadTexture( "textures/sprites/particle.png" ),

	clusterUniformsArray: [],

	init: function () {

		clusterScene.camera = new THREE.PerspectiveCamera( 18, $("#render").width() / $("#render").height(), 0.1, 5000 );
		clusterScene.camera.position.z = 400;

		clusterScene.controls = new THREE.OrbitControls( clusterScene.camera );

		clusterScene.scene = new THREE.Scene();

		clusterScene.universe = new THREE.Object3D();
		clusterScene.scene.add( clusterScene.universe );

		clusterScene.renderer = new THREE.WebGLRenderer();
		clusterScene.renderer.setSize( $("#render").width() , $("#render").height() );
		clusterScene.renderer.setClearColorHex( 0x0e0d13, 1 );
		clusterScene.renderer.autoClear = false;

		// Post-processing

		var shaderVignette = THREE.VignetteShader;

		var renderModel = new THREE.RenderPass( clusterScene.scene, clusterScene.camera );
		var effectFilm = new THREE.FilmPass( 0.65, 0.025, 648, false);
		var effectVignette = new THREE.ShaderPass( shaderVignette );

		effectVignette.uniforms[ "offset" ].value = 0.35;
		effectVignette.uniforms[ "darkness" ].value = 2.5;	
		effectVignette.renderToScreen = true;

		clusterScene.composer = new THREE.EffectComposer( clusterScene.renderer );

		clusterScene.composer.addPass( renderModel );
		clusterScene.composer.addPass( effectFilm );
		clusterScene.composer.addPass( effectVignette );

		// Add stars

		clusterScene.drawStars();

		// Append canvas

		$("#render").append( clusterScene.renderer.domElement );

	},

	drawStars: function() {

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
			transparent : true} );
		coreMaterial.color.setHSV( .15, .1, .8 );

		var coreParticles = new THREE.ParticleSystem( coreGeometry, coreMaterial );

		clusterScene.universe.add(coreParticles);

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
			var groupWeight = group.length / pixelCount;

			var centroidObject = new THREE.Object3D();

			var centroidRGB = new THREE.Color();
			centroidRGB.setRGB(centroid[0]/255,centroid[1]/255,centroid[2]/255);
			var centroidLAB = centroidRGB.getLAB();

			centroidObject.position.z = (64-centroidLAB.l) ;
			centroidObject.position.x = centroidLAB.a ;
			centroidObject.position.y = centroidLAB.b ;		

			// Cluster Shader 

			var clusterUniforms = THREE.UniformsUtils.clone( clusterShader.uniforms );

			clusterScene.clusterUniformsArray.push(clusterUniforms);

			clusterUniforms["map"].value = clusterScene.starTexture;
			clusterUniforms["scale"].value = 100;
			clusterUniforms["opacity"].value = 1.0;
			clusterUniforms["time"].value = 0.0

	        var clusterAttributes = {
	                size: { type: 'f', value: [] },
	        };				

			// Cluster Geometry

			var groupGeometry = new THREE.Geometry();
			var groupColors = [];
			groupGeometry.colors = groupColors;

			// Populate Geometry, Colors and Attributes

			for ( var j = 0; j < group.length; j+=1 ) {

				var radius = Math.random() * (200 * groupWeight);
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
				clusterAttributes.size.value.push(4.0 + Math.random() * 8.0);

			}

			// Cluster Material

			var groupMaterial = new THREE.ShaderMaterial( {
				uniforms: clusterUniforms,
				attributes: clusterAttributes,
				vertexShader: clusterShader.vertexShader,
				fragmentShader: clusterShader.fragmentShader,
				vertexColors: true,
				blending: THREE.AdditiveBlending, transparent:true,
				depthTest: false
			});				

			// Cluster Mesh

			var groupMesh = new THREE.ParticleSystem( groupGeometry, groupMaterial );			

			centroidObject.add(groupMesh);
			clusterScene.universe.add(centroidObject);

		}

		clusterScene.startTime = Date.now();
	},

	clearClusters: function() {

		for ( var i = 0; i < clusterScene.universe.children.length; i ++ ) {

			var object = clusterScene.universe.children[ i ];
			if ( object instanceof THREE.Object3D && !(object instanceof THREE.ParticleSystem)) {

				clusterScene.universe.remove(object);
				i--;

			}
		}

	},
	animate: function () {

        requestAnimationFrame( clusterScene.animate );
        clusterScene.controls.update();

        // Update Uniforms

        var time = Date.now() - clusterScene.startTime;
        if (clusterScene.clusterUniformsArray[0]) {
        	for (var i = 0; i < clusterScene.clusterUniformsArray.length; i++)
        		clusterScene.clusterUniformsArray[i]["time"].value = time / 1000;
        }

    	// Rotate Clusters and Stars

    	clusterScene.universe.rotation.y += 0.001;

		for ( var i = 0; i < clusterScene.universe.children.length; i ++ ) {

			var object = clusterScene.universe.children[ i ];
			if ( object instanceof THREE.Object3D && !(object instanceof THREE.ParticleSystem)) {

				object.rotation.y += 0.001;

			}
		}

		// Render scene

		clusterScene.renderer.clear();
		clusterScene.composer.render( 0.01 );
		//clusterScene.render();

    },

    render: function() {
    	        clusterScene.renderer.render( clusterScene.scene, clusterScene.camera );
    }


}