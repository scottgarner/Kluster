/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

var klusterScene = {
	startTime: Date.now(),

	renderWidth: $("#render").width(),
	renderHeight: $("#render").height(),	

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

		klusterScene.renderWidth = $("#render").width();
		klusterScene.renderHeight = $("#render").height();		

		klusterScene.camera = new THREE.PerspectiveCamera( 24, klusterScene.renderWidth / klusterScene.renderHeight, 0.1, 5000 );
		klusterScene.camera.position.z = 200;

		klusterScene.controls = new THREE.OrbitControls( klusterScene.camera );

		klusterScene.scene = new THREE.Scene();

		klusterScene.universe = new THREE.Object3D();
		klusterScene.scene.add( klusterScene.universe );

		klusterScene.renderer = new THREE.WebGLRenderer();
		klusterScene.renderer.setSize( klusterScene.renderWidth, klusterScene.renderHeight );
		klusterScene.renderer.setClearColorHex( 0x121317, 1 );
		klusterScene.renderer.autoClear = false;
		//klusterScene.renderer.preserveDrawingBuffer  = true;

		// Post-processing

		var shaderVignette = THREE.VignetteShader;

		var renderModel = new THREE.RenderPass( klusterScene.scene, klusterScene.camera );
		var effectFilm = new THREE.FilmPass( 0.25, 0.025, 648, false);
		var effectVignette = new THREE.ShaderPass( shaderVignette );

		effectVignette.uniforms[ "offset" ].value = 0.35;
		effectVignette.uniforms[ "darkness" ].value = 2.5;	
		effectVignette.renderToScreen = true;

		klusterScene.composer = new THREE.EffectComposer( klusterScene.renderer );

		klusterScene.composer.addPass( renderModel );
		klusterScene.composer.addPass( effectFilm );
		klusterScene.composer.addPass( effectVignette );

		// Add environment

		// var r = "textures/cube/skybox/";
		// var urls = [ r + "px.jpg", r + "nx.jpg",
		// 			 r + "py.jpg", r + "ny.jpg",
		// 			 r + "pz.jpg", r + "nz.jpg" ];

		// var textureCube = THREE.ImageUtils.loadTextureCube( urls );
		// textureCube.format = THREE.RGBFormat;

		// var shader = THREE.ShaderUtils.lib[ "cube" ];
		// shader.uniforms[ "tCube" ].value = textureCube;

		// var material = new THREE.ShaderMaterial( {

		// 	fragmentShader: shader.fragmentShader,
		// 	vertexShader: shader.vertexShader,
		// 	uniforms: shader.uniforms,
		// 	depthWrite: false,
		// 	side: THREE.BackSide

		// } );

		// var mesh = new THREE.Mesh( new THREE.CubeGeometry( 500, 500, 500 ), material );
		// klusterScene.scene.add( mesh );		

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
			size: 2.0,map: klusterScene.starTexture , 
			depthTest: false,  blending: THREE.AdditiveBlending, 
			transparent : true} );
		coreMaterial.color.setHSV( .15, .1, 1.0 );

		var coreParticles = new THREE.ParticleSystem( coreGeometry, coreMaterial );

		klusterScene.universe.add(coreParticles);

	},

	drawClusters: function (centroids,groups) {

		var pixelCount = 0;

		for (var i = 0; i < groups.length; i++) {
			pixelCount += groups[i].length;
		}

		// cluster Shader 

		var clusterUniforms = THREE.UniformsUtils.clone( clusterShader.uniforms );

		klusterScene.clusterUniformsArray.push(clusterUniforms);

		clusterUniforms["map"].value = klusterScene.starTexture;
		clusterUniforms["scale"].value = 100;
		clusterUniforms["opacity"].value = .90;
		clusterUniforms["time"].value = 0.0		

		for (var i = 0; i < centroids.length; i++) {		

			var centroid = centroids[i];
			var group = groups[i];

			if (!group.length) continue;

			var groupWeight = group.length / pixelCount;

			var centroidColor = new THREE.Color();
			centroidColor.setRGB(centroid[0]/255,centroid[1]/255,centroid[2]/255);
			var centroidLAB = centroidColor.getLAB();

			var centroidPosition = new THREE.Vector3(
				centroidLAB.a /3,
				(50-centroidLAB.l) /3,
				centroidLAB.b /3);

			// cluster Shader 

	        var clusterAttributes = {
	                size: { type: 'f', value: [] },
	                offset: { type: 'v3', value: []}
	        };				

			// cluster Geometry

			var groupGeometry = new THREE.Geometry();
			var groupColors = [];
			groupGeometry.colors = groupColors;

			// Populate Geometry, Colors and Attributes

			for ( var j = 0; j < group.length; j+=1 ) {

				var pixelColor = new THREE.Color( 0xffffff );
				pixelColor.setRGB( group[j][0]/255, group[j][1]/255, group[j][2]/255);

				// var distance = new THREE.Vector3(pixelColor.r,pixelColor.g,pixelColor.b).
				// 	distanceTo(new THREE.Vector3(centroidColor.r,centroidColor.g,centroidColor.b));

				var radius = Math.random()  * (200 * groupWeight);
				//var radius = (distance  * 100 * (groupWeight * 10));
				var longitude = Math.PI - (Math.random() * (2*Math.PI));
				var latitude =  (Math.random() * Math.PI);

				var x = radius * Math.cos(longitude) * Math.sin(latitude);
				var z = radius * Math.sin(longitude) * Math.sin(latitude);
				var y = radius * Math.cos(latitude) ; 
				
				groupGeometry.vertices.push( centroidPosition );	
				groupColors.push(pixelColor)
				clusterAttributes.size.value.push(8.0 + Math.random() * 8.0);
				clusterAttributes.offset.value.push(new THREE.Vector3( x, y, z ));

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
			groupMesh.position.copy(centroidPosition);			

			klusterScene.universe.add(groupMesh);

		}

		klusterScene.startTime = Date.now();
	},

	clearClusters: function() {

		for ( var i = 1; i < klusterScene.universe.children.length; i ++ ) {

			var object = klusterScene.universe.children[ i ];
			klusterScene.universe.remove(object);
			i--;
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

    	// Rotate universe

    	klusterScene.universe.rotation.y += 0.001;

		// Render scene

		klusterScene.renderer.clear();
		klusterScene.composer.render( 0.01 );
		//klusterScene.render();

    },

    render: function() {
    	klusterScene.renderer.render( klusterScene.scene, klusterScene.camera );
    },

    saveImage: function() {
		klusterScene.renderer.clear();
		klusterScene.composer.render( 0.01 );

		var dataURL= klusterScene.renderer.domElement.toDataURL();
		var saveWindow = window.open("about:blank", "Kluster Image", "width="+klusterScene.renderer.domElement.width+", height="+klusterScene.renderer.domElement.height);
		var saveImage = saveWindow.document.createElement( 'img' );
		saveImage.src = dataURL;
		$(saveWindow.document.body).css({'margin':0, 'padding':0});
		saveWindow.document.body.appendChild( saveImage );		

    }


}