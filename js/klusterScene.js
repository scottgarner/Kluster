/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

var klusterScene = {
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

		klusterScene.camera = new THREE.PerspectiveCamera( 24, $("#render").width() / $("#render").height(), 0.1, 5000 );
		klusterScene.camera.position.z = 200;

		klusterScene.controls = new THREE.OrbitControls( klusterScene.camera );

		klusterScene.scene = new THREE.Scene();

		klusterScene.universe = new THREE.Object3D();
		klusterScene.scene.add( klusterScene.universe );

		klusterScene.renderer = new THREE.WebGLRenderer();
		klusterScene.renderer.setSize( $("#render").width() , $("#render").height() );
		klusterScene.renderer.setClearColorHex( 0x0e0d13, 1 );
		klusterScene.renderer.autoClear = false;

		// Post-processing

		var shaderVignette = THREE.VignetteShader;

		var renderModel = new THREE.RenderPass( klusterScene.scene, klusterScene.camera );
		var effectFilm = new THREE.FilmPass( 0.65, 0.025, 648, false);
		var effectVignette = new THREE.ShaderPass( shaderVignette );

		effectVignette.uniforms[ "offset" ].value = 0.35;
		effectVignette.uniforms[ "darkness" ].value = 2.5;	
		effectVignette.renderToScreen = true;

		klusterScene.composer = new THREE.EffectComposer( klusterScene.renderer );

		klusterScene.composer.addPass( renderModel );
		klusterScene.composer.addPass( effectFilm );
		klusterScene.composer.addPass( effectVignette );

		// Add stars

		klusterScene.drawStars();

		// Append canvas

		$("#render").append( klusterScene.renderer.domElement );

	},

	drawStars: function() {

		var coreGeometry = new THREE.Geometry();
		
		for (var i = 0; i < 2400; i++) {
		
				var radius = Math.random() * 128;
				var longitude = Math.PI - (Math.random() * (2*Math.PI));
				var latitude =  (Math.random() * Math.PI);
				
				var x = radius * Math.cos(longitude) * Math.sin(latitude);
				var z = radius * Math.sin(longitude) * Math.sin(latitude);
				var y = radius * Math.cos(latitude); 	

			coreGeometry.vertices.push( new THREE.Vector3( x, y, z ) );				
		
		}	
		
		var coreMaterial = new THREE.ParticleBasicMaterial( { 
			size: 4,map: klusterScene.starTexture , 
			depthTest: false,  blending: THREE.AdditiveBlending, 
			transparent : true} );
		coreMaterial.color.setHSV( .15, .1, .8 );

		var coreParticles = new THREE.ParticleSystem( coreGeometry, coreMaterial );

		klusterScene.universe.add(coreParticles);

	},

	drawClusters: function (centroids,groups) {

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

			// cluster Shader 

			var clusterUniforms = THREE.UniformsUtils.clone( clusterShader.uniforms );

			klusterScene.clusterUniformsArray.push(clusterUniforms);

			clusterUniforms["map"].value = klusterScene.starTexture;
			clusterUniforms["scale"].value = 100;
			clusterUniforms["opacity"].value = 1.0;
			clusterUniforms["time"].value = 0.0

	        var clusterAttributes = {
	                size: { type: 'f', value: [] },
	        };				

			// cluster Geometry

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
				var y = radius * Math.cos(latitude) ; 

				var vector = new THREE.Vector3( x, y, z );
				groupGeometry.vertices.push( vector );	

				var pixelColor = new THREE.Color( 0xffffff );
				pixelColor.setRGB( group[j][0]/255, group[j][1]/255, group[j][2]/255);	

				groupColors.push(pixelColor)
				clusterAttributes.size.value.push(4.0 + Math.random() * 8.0);

			}

			// cluster Material

			var groupMaterial = new THREE.ShaderMaterial( {
				uniforms: clusterUniforms,
				attributes: clusterAttributes,
				vertexShader: clusterShader.vertexShader,
				fragmentShader: clusterShader.fragmentShader,
				vertexColors: true,
				blending: THREE.AdditiveBlending, transparent:true,
				depthTest: false
			});				

			// cluster Mesh

			var groupMesh = new THREE.ParticleSystem( groupGeometry, groupMaterial );			

			centroidObject.add(groupMesh);
			klusterScene.universe.add(centroidObject);

		}

		klusterScene.startTime = Date.now();
	},

	clearClusters: function() {

		for ( var i = 0; i < klusterScene.universe.children.length; i ++ ) {

			var object = klusterScene.universe.children[ i ];
			if ( object instanceof THREE.Object3D && !(object instanceof THREE.ParticleSystem)) {

				klusterScene.universe.remove(object);
				i--;

			}
		}

	},
	animate: function () {

        requestAnimationFrame( klusterScene.animate );
        klusterScene.controls.update();

        // Update Uniforms

        var time = Date.now() - klusterScene.startTime;
        if (klusterScene.clusterUniformsArray[0]) {
        	for (var i = 0; i < klusterScene.clusterUniformsArray.length; i++)
        		klusterScene.clusterUniformsArray[i]["time"].value = time / 1000;
        }

    	// Rotate clusters and Stars

    	klusterScene.universe.rotation.y += 0.001;

		for ( var i = 0; i < klusterScene.universe.children.length; i ++ ) {

			var object = klusterScene.universe.children[ i ];
			if ( object instanceof THREE.Object3D && !(object instanceof THREE.ParticleSystem)) {

				object.rotation.y += 0.001;

			}
		}

		// Render scene

		klusterScene.renderer.clear();
		klusterScene.composer.render( 0.01 );
		//klusterScene.render();

    },

    render: function() {
    	        klusterScene.renderer.render( klusterScene.scene, klusterScene.camera );
    }


}