/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

var klusterScene = {
	
	clock: new THREE.Clock(),
	autoPilotIndex: 0,
	postProcessing: true,
	starTexture: THREE.ImageUtils.loadTexture( "textures/sprites/particle.png" ),

	init: function () {

		klusterScene.renderWidth = $("#render").width();
		klusterScene.renderHeight = $("#render").height();		

		klusterScene.camera = new THREE.PerspectiveCamera( 24, klusterScene.renderWidth / klusterScene.renderHeight, 0.1, 5000 );
		klusterScene.camera.position.z = 200;

		klusterScene.scene = new THREE.Scene();

		klusterScene.universe = new THREE.Object3D();
		klusterScene.scene.add( klusterScene.universe );

		klusterScene.clusters = new THREE.Object3D();
		klusterScene.universe.add(klusterScene.clusters);

		klusterScene.renderer = new THREE.WebGLRenderer();
		klusterScene.renderer.setSize( klusterScene.renderWidth, klusterScene.renderHeight );
		klusterScene.renderer.setClearColor( 0x0a0b0e, 1 );
		klusterScene.renderer.autoClear = false;

		// Controls

		klusterScene.controls = new THREE.OrbitControls( klusterScene.camera );
		klusterScene.controls.maxDistance = 400;
		klusterScene.controls.minPolarAngle = Math.PI * .2;
		klusterScene.controls.maxPolarAngle = Math.PI * .8;		

		// Post-processing

		var shaderVignette = THREE.VignetteShader;

		var renderModel = new THREE.RenderPass( klusterScene.scene, klusterScene.camera );
		var effectFilm = new THREE.FilmPass( 0.25, 0.025, 648, false);
		var effectVignette = new THREE.ShaderPass( shaderVignette );

		effectVignette.uniforms[ "offset" ].value = 0.55;
		effectVignette.uniforms[ "darkness" ].value = 1.55;	
		effectVignette.renderToScreen = true;

		klusterScene.composer = new THREE.EffectComposer( klusterScene.renderer );

		klusterScene.composer.addPass( renderModel );
		klusterScene.composer.addPass( effectFilm );
		klusterScene.composer.addPass( effectVignette );

		klusterScene.composer.setSize( klusterScene.renderWidth+1, klusterScene.renderHeight );

		// Add scene elements

		klusterScene.addEnvironment();
		klusterScene.addStars();

		// Append canvas

		$("#render").append( klusterScene.renderer.domElement );
		$(klusterScene.renderer.domElement).bind('mousedown', klusterEvents.mouseDown); 
	},

	addEnvironment: function() {

		var skyTexture = THREE.ImageUtils.loadTexture( 'textures/stars.jpg');
		skyTexture.wrapS = THREE.RepeatWrapping;
		skyTexture.wrapT = THREE.RepeatWrapping;
		skyTexture.repeat.x = 5;
		skyTexture.repeat.y = 3;

		var skyMaterial = new THREE.MeshBasicMaterial( { map: skyTexture } );

		var skyMesh = new THREE.Mesh( new THREE.SphereGeometry( 600, 60, 40 ), skyMaterial );
		skyMesh.scale.x = -1;
		//klusterScene.universe.add( skyMesh );	

	},

	addStars: function() {

		var starColors = [];
		var coreGeometry = new THREE.Geometry();
		coreGeometry.colors = starColors;
		
		for (var i = 0; i < 6000; i++) {	

			var x = 120 - Math.random() * 240;
			var y = 120 - Math.random() * 240;
			var z = 120 - Math.random() * 240;

			coreGeometry.vertices.push( new THREE.Vector3( x, y, z ) );
			var starColor = new THREE.Color(0xffffff);
			starColor.setRGB(
				.8 + Math.random() * .2,
				.8 + Math.random() * .2,
				.8 + Math.random() * .2);
			starColors.push(starColor)				
		
		}	
		
		var coreMaterial = new THREE.ParticleBasicMaterial( { 
			size: 2.0,map: klusterScene.starTexture , 
			depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, 
			transparent : true, vertexColors: true} );

		var coreParticles = new THREE.ParticleSystem( coreGeometry, coreMaterial );

		klusterScene.universe.add(coreParticles);

	},

	drawClusters: function (clusters) {
		var groups = clusters.groups;
		var centroids = clusters.centroids;

		var pixelCount = 0;

		for (var i = 0; i < groups.length; i++) {
			pixelCount += groups[i].length;
		}

		// cluster Shader 

		var clusterUniforms = THREE.UniformsUtils.clone( clusterShader.uniforms );

		clusterUniforms["map"].value = klusterScene.starTexture;
		clusterUniforms["scale"].value = 100;
		clusterUniforms["opacity"].value = 1.0;
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
				centroidLAB.a ,
				(50-centroidLAB.l) ,
				centroidLAB.b );

			// cluster Shader 

	        var clusterAttributes = {
	                size: { type: 'f', value: [] },
	                origin: { type: 'v3', value: [] },
	        };				

			// cluster Geometry

			var clusterGeometry = new THREE.Geometry();
			var clusterColors = [];
			clusterGeometry.colors = clusterColors;

			// Populate Geometry, Colors and Attributes

			for ( var j = 0; j < group.length; j+=1 ) {

				var pixelColor = new THREE.Color( 0xffffff );
				pixelColor.setRGB( group[j][0]/255, group[j][1]/255, group[j][2]/255);

				var distance = new THREE.Vector3(pixelColor.r,pixelColor.g,pixelColor.b).
					distanceTo(new THREE.Vector3(centroidColor.r,centroidColor.g,centroidColor.b));

				//var radius = Math.random()  * (200 * groupWeight);
				var radius = (distance  * 96 * (groupWeight * 12));
				var longitude = Math.PI - (Math.random() * (2*Math.PI));
				var latitude =  (Math.random() * Math.PI);

				var x = radius * Math.cos(longitude) * Math.sin(latitude);
				var z = radius * Math.sin(longitude) * Math.sin(latitude);
				var y = radius * Math.cos(latitude) ; 

				var originX = 0; //(100 - group[j][3]) / 1.0;
				var originY = 0; //(100 - group[j][4]) / 1.0;
				var originZ = 0;				
				
				clusterGeometry.vertices.push( new THREE.Vector3( x, y, z ) );	
				clusterColors.push(pixelColor)
				clusterAttributes.origin.value.push(new THREE.Vector3( originX, originY, originZ ) );	
				clusterAttributes.size.value.push(8.0 + pixelColor.getHSL().s * 8.0);
			}

			// cluster Material

			var clusterMaterial = new THREE.ShaderMaterial( {
				uniforms: clusterUniforms,
				attributes: clusterAttributes,
				vertexShader: clusterShader.vertexShader,
				fragmentShader: clusterShader.fragmentShader,
				vertexColors: true,
				blending: THREE.AdditiveBlending, transparent:true,
				depthTest: false, depthWrite: false
			});				

			// cluster Mesh

			var clusterMesh = new THREE.ParticleSystem( clusterGeometry, clusterMaterial );
			clusterMesh.position.copy(centroidPosition);		

			clusterMesh.startTime = klusterScene.clock.getElapsedTime();	
			clusterMesh.rotationSpeed = ((Math.random() * 8.0) - 4.0) / 1000.0;

			// var testMesh = new THREE.Mesh( new THREE.SphereGeometry( 1, 60, 40 ), new THREE.MeshBasicMaterial( ) );
			// groupMesh.add( testMesh );	

			klusterScene.clusters.add(clusterMesh);

		}

	
	},

	clearClusters: function() {

		for ( var i = 0; i < klusterScene.clusters.children.length; i ++ ) {
			var object = klusterScene.clusters.children[ i ];
			klusterScene.clusters.remove(object);
			i--;
		}

		klusterScene.autoPilotStop();

	},

	autoPilot: function() {

		if (klusterScene.autoPilotTween == null && klusterScene.clusters.children.length > 0)
			klusterScene.autoPilotStart();
		else
			klusterScene.autoPilotStop();

	},

	autoPilotStart: function () {

		var previousTarget = klusterScene.clusters.children[klusterScene.previousTarget()];
		var currentTarget = klusterScene.clusters.children[ klusterScene.autoPilotIndex ];
		var nextTarget = klusterScene.clusters.children[ klusterScene.nextTarget() ];

		var previousPosition = previousTarget.matrixWorld.getPosition().clone();
		var currentPosition = currentTarget.matrixWorld.getPosition().clone();
		var nextPosition = nextTarget.matrixWorld.getPosition().clone();

		var timeOffset = previousPosition.distanceTo(nextPosition) * 100;

		klusterScene.autoPilotTween = new TWEEN.Tween( previousPosition )
			.to(nextPosition, 6000 + timeOffset)
			.onUpdate(function() {
				klusterScene.camera.lookAt(this);
			})
			.onComplete(function() {
				klusterScene.autoPilotIndex = klusterScene.nextTarget();
				klusterScene.autoPilotStart();
			})			
            // .interpolation(TWEEN.Interpolation.CatmullRom)
            // .easing( TWEEN.Easing.Quintic.InOut)			
			.start();

		klusterScene.camera.position.copy(currentPosition);

	},

	autoPilotStop: function() {
		if (klusterScene.autoPilotTween != null) {
			klusterScene.autoPilotTween.stop();
			klusterScene.autoPilotTween = null;

			klusterScene.camera.position.x = 0;
			klusterScene.camera.position.y = 0;
			klusterScene.camera.position.z = 200;
		}
	},

	nextTarget: function() {
		var nextTarget = klusterScene.autoPilotIndex + 1;
		if (nextTarget == klusterScene.clusters.children.length)
			nextTarget = 0;
		return nextTarget;
	},

	previousTarget: function() {
		var previousTarget = klusterScene.autoPilotIndex - 1;
		if (previousTarget == -1)
			previousTarget = klusterScene.clusters.children.length-1;
		return previousTarget;		
	},

	reset: function() {
			klusterScene.autoPilotStop();
			klusterGUI.clearCanvases();
        	klusterScene.clearClusters();
        	klusterGUI.hidePanels();
	},

	animate: function () {

        requestAnimationFrame( klusterScene.animate );

        // Controls and auto pilot

        if (klusterScene.autoPilotTween == null)
        	klusterScene.controls.update(klusterScene.clock.getDelta());
        else
        	TWEEN.update();

        // Update Uniforms

        var time = klusterScene.clock.getElapsedTime();

		for ( var i = 0; i < klusterScene.clusters.children.length; i ++ ) {

			var cluster = klusterScene.clusters.children[ i ];
			cluster.rotation.y += cluster.rotationSpeed;
			
			var clusterUniforms = cluster.material.uniforms;
			clusterUniforms["time"].value = klusterScene.clock.getElapsedTime() - cluster.startTime;

		}        

    	// Rotate universe

    	klusterScene.universe.rotation.y += 0.001;

		// Render scene

		klusterScene.render();

    },

    render: function() {
    	if (klusterScene.postProcessing) {
			klusterScene.renderer.clear();
			klusterScene.composer.render( 0.01 );    	
		}  else {
    		klusterScene.renderer.render( klusterScene.scene, klusterScene.camera );
    	}
    },

    saveImage: function() {

		klusterScene.camera.aspect = 1920 / 1080;
		klusterScene.camera.updateProjectionMatrix();
		klusterScene.renderer.setSize( 1920,1080);
		klusterScene.composer.setSize( 1921,1080);

		klusterScene.render();
		
		//var dataURL= klusterScene.renderer.domElement.toDataURL();
		klusterScene.renderer.domElement.toBlobHD(function(blob) {
   			saveAs(blob, "kluster.png");
		});
		
		klusterEvents.resize();

		/*

		//take apart data URL
		var parts = dataURL.match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);

		//assume base64 encoding
		var binStr = atob(parts[3]);

		//convert to binary in ArrayBuffer
		var buf = new ArrayBuffer(binStr.length);
		var view = new Uint8Array(buf);
		for(var i = 0; i < view.length; i++)
		  view[i] = binStr.charCodeAt(i);

		var blob = new Blob([view], {'type': parts[1]});
		var blobURL = window.URL.createObjectURL(blob)

		window.open(blobURL, "_blank", "width=1280, height=720");

		*/

    }


}