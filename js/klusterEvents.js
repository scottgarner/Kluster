/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

var klusterEvents = {
	reader: null,
	worker: null,


	init: function() {

		// Bind Events

		$(document).bind('keyup', klusterEvents.keyUp);
		$(window).bind('resize', klusterEvents.resize);

		$('#main').bind('dragenter', klusterEvents.ignoreEvent); 
		$('#main').bind('dragover', klusterEvents.ignoreEvent); 
		$('#main').bind('dragleave', klusterEvents.ignoreEvent); 
		$('#main').bind('drop', klusterEvents.dropImage); 

		// Welcome
		
		$('#imageDisk').click(function( ){
			$("#imageSelect").val("");
			$("#imageSelect").click();
		});

		$('#imageWebcam').click(function( ){
			klusterGUI.hidePanels();
			klusterGUI.showVideoChooser();
		});
		$('#imageSelect').change(klusterEvents.selectImage);

		$("#webcamSnapshot").click(klusterGUI.takeVideoSnapshot);
		$("#webcamCancel").click(function( ){
			klusterGUI.showPanel('chooseImage');
		});

		$("#imageSample").click(function( ){
			klusterGUI.showPanel('samples');
		});

		$("#imageDragDrop").click(function( ){
			klusterGUI.showPanel('dragDrop');
		});		

		$("#samples").find("img").click( function() {
			klusterGUI.hidePanels();
			klusterGUI.drawOriginal(this);
		});

		// UI Buttons

		$('#reset').click(function(){
			klusterScene.reset();
		});
		$('#snapshot').click(function(){
			klusterGUI.showPanel('chooseImage');	
		});		
		$('#expand').click(function( ){
			$(document).toggleFullScreen();
        	klusterEvents.resize();
		});
		$('#save').click(function( ){
			klusterScene.saveImage();
		});		
		$('#auto').click(function( ){
			klusterScene.autoPilot();
		});			
		$('#about').click(function( ){
			klusterGUI.showPanel("info");
		});
		$('#hide').click(function( ){
			klusterGUI.hideControls();
		});

		$('.close').click(function( ){
			klusterGUI.hidePanels();
		});

		// Webcam
		
        if(!Modernizr.getusermedia)	$('#imageWebcam').hide();

		// Setup file reader

		klusterEvents.reader = new FileReader(); 

		klusterEvents.reader.onload = function(e)
		{
			klusterGUI.loadImageData(e.target.result);
		};

		// Setup worker thread

		klusterEvents.worker = new Worker("js/klusterWorker.js");

		klusterEvents.worker.onmessage = function(e) {
			klusterGUI.hidePanels();
			var groups = e.data;
			klusterGUI.drawGroups(groups);
		};

		klusterEvents.worker.onerror = function(e) {
			alert("Error in file: "+e.filename+"\nline: "+e.lineno+"\nDescription: "+e.message);
		};					

	},

	resize: function(e) {

			klusterScene.renderWidth = $("#render").width();
			klusterScene.renderHeight = $("#render").height();

			klusterScene.camera.aspect = klusterScene.renderWidth / klusterScene.renderHeight;
			klusterScene.camera.updateProjectionMatrix();
			klusterScene.renderer.setSize( klusterScene.renderWidth , klusterScene.renderHeight);
			klusterScene.composer.setSize( klusterScene.renderWidth+1 , klusterScene.renderHeight);

	},

	mouseDown: function(e) {
		klusterScene.autoPilotStop();

	},

	keyUp: function(e) {
		switch (e.keyCode) {	
			case 27:
				$(document).fullScreen(false);
	        	klusterEvents.resize();
				break;
        	case "N".charCodeAt(0):
        		klusterGUI.showPanel("chooseImage");
        		break;						
        	case "I".charCodeAt(0):
        		klusterGUI.showPanel("info");
        		break;				
        	case "S".charCodeAt(0):
        		klusterScene.saveImage();
        		break;
        	case "F".charCodeAt(0):
				$(document).toggleFullScreen();
        		klusterEvents.resize();
        		break;
        	case "R".charCodeAt(0):
        		klusterScene.reset();
        		break;
        	case "A".charCodeAt(0):
        		klusterScene.autoPilot();
        		break;
        	case "H".charCodeAt(0):
        		klusterGUI.hideControls();
        		break;
        	case "P".charCodeAt(0):
        		klusterScene.postProcessing = !klusterScene.postProcessing;
        		break;
        }
	},
	selectImage: function(e)
	{
		klusterEvents.ignoreEvent(e);
		klusterEvents.handleImage(e.target.files[0]);
	},
	dropImage: function(e)  
	{ 
		klusterEvents.ignoreEvent(e);
		klusterEvents.handleImage(e.originalEvent.dataTransfer.files[0]);
	},

	handleImage: function(file) {
		var readFileSize = 0; 		
		readFileSize += file.fileSize; 

		var imageType = /image.*/; 

		if (!file.type.match(imageType))  
		{ 
			return; 
		} 

		klusterGUI.hidePanels();

		klusterEvents.reader.readAsDataURL(file); 
	},

	ignoreEvent: function(e) {
		e.stopPropagation(); 
		e.preventDefault(); 
	}
}