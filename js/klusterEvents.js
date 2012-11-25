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

		// Buttons

		$('#reset').click(function(){
			klusterGUI.clearCanvases();
			klusterScene.clearClusters();
		});
		$('#expand').click(function( ){
			$('#render').toggleClass('full');
        	klusterEvents.resize();
		});
		$('#about').click(function( ){});

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

	keyUp: function(e) {
		switch (e.keyCode) {	
			case 27:
				$('#render').removeClass('full');
				klusterEvents.resize();
				break;
        	case "V".charCodeAt(0):
        		if(Modernizr.getusermedia)
					klusterGUI.showVideoChooser();
        		break;
        	case "S".charCodeAt(0):
        		if(Modernizr.getusermedia)
        			klusterGUI.takeVideoSnapshot();
        		break;
        	case "E".charCodeAt(0):
        		$('#render').toggleClass('full');
        		klusterEvents.resize();
        		break;
        	case "R".charCodeAt(0):
        		klusterGUI.clearCanvases();
        		klusterScene.clearClusters();
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

		$('#welcome').hide();

		klusterEvents.reader.readAsDataURL(file); 
	},

	ignoreEvent: function(e) {
		e.stopPropagation(); 
		e.preventDefault(); 
	}
}