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
		$('#main').bind('mousedown', klusterEvents.mouseDown); 

		// Buttons

		$('#reset').click(function(){
			klusterGUI.clearCanvases();
			klusterScene.clearClusters();
			klusterGUI.hidePanels();
		});
		$('#snapshot').click(function(){
			klusterGUI.showVideoChooser();	
		});		
		$('#expand').click(function( ){
			$('#render').toggleClass('full');
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
		$('#close').click(function( ){
			klusterGUI.hidePanels();
		});

		// Webcam
		
        if(!Modernizr.getusermedia)	$('#snapshot').hide();

		// Setup file reader

		klusterEvents.reader = new FileReader(); 

		klusterEvents.reader.onload = function(e)
		{
			klusterGUI.drawOriginal(e.target.result);
		};

		// Setup worker thread

		klusterEvents.worker = new Worker("js/klusterWorker.js");

		klusterEvents.worker.onmessage = function(e) {
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
			klusterScene.composer.reset();

	},

	mouseDown: function(e) {
		klusterScene.autoPilotStop();

	},

	keyUp: function(e) {
		switch (e.keyCode) {	
			case 27:
				klusterGUI.hidePanels();
				$('#render').removeClass('full');
				klusterEvents.resize();
				break;
        	case "V".charCodeAt(0):
        		if(Modernizr.getusermedia)
					klusterGUI.showVideoChooser();
        		break;
        	case "G".charCodeAt(0):
        		if(Modernizr.getusermedia)
        			klusterGUI.takeVideoSnapshot();
        		break;
        	case "S".charCodeAt(0):
        		klusterScene.saveImage();
        		break;
        	case "E".charCodeAt(0):
        		$('#render').toggleClass('full');
        		klusterEvents.resize();
        		break;
        	case "R".charCodeAt(0):
        		klusterGUI.clearCanvases();
        		klusterScene.clearClusters();
        		klusterGUI.hidePanels();
        		break;
        	case "A".charCodeAt(0):
        		klusterScene.autoPilot();
        		break;

        }
	},
	
	dropImage: function(e)  
	{ 
		klusterEvents.ignoreEvent(e);

		var readFileSize = 0; 
		var files = e.originalEvent.dataTransfer.files; 

		var file = files[0]; 
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
		klusterGUI.hidePanels();
		e.stopPropagation(); 
		e.preventDefault(); 
	}
}