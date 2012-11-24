/**
 * @author Scott Garner / http://scott.j38.net/
 */

 "use strict";

var klusterEvents = {
	reader: null,
	worker: null,


	init: function() {

		// Bind Events

		$(document).bind('keypress', klusterEvents.keyPress);
		$(window).bind('resize', klusterEvents.resize);

		$('#content').bind('dragenter', klusterEvents.ignoreEvent); 
		$('#content').bind('dragover', klusterEvents.ignoreEvent); 
		$('#content').bind('dragleave', klusterEvents.ignoreEvent); 
		$('#content').bind('drop', klusterEvents.dropImage); 

		$('#render').bind('drop', klusterEvents.dropImage);

		// Setup file reader

		klusterEvents.reader = new FileReader(); 

		klusterEvents.reader.onload = function(e)
		{
			$("<img/>").attr('src',e.target.result).load(function() {

				var context = $('#dropBox')[0].getContext('2d');
				context.drawImage(this, 0, 0, 400, 200);
				
				klusterGUI.drawKMeans();
			})	
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

			klusterScene.camera.aspect = $("#render").width() / $("#render").height()
			klusterScene.camera.updateProjectionMatrix();

			klusterScene.renderer.setSize( $("#render").width() , $("#render").height());

			klusterScene.composer.reset();

	},

	keyPress: function(e) {

        switch (e.which){
        	case "v".charCodeAt(0):
        		klusterGUI.showVideoChooser();
        		break;
        	case "s".charCodeAt(0):
        		klusterGUI.takeVideoSnapshot();
        		break;
        	case "f".charCodeAt(0):
        		$('#render').toggleClass('full');
        		klusterEvents.resize();
        		break;
        	case "r".charCodeAt(0):
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

		klusterEvents.reader.readAsDataURL(file); 
	},

	ignoreEvent: function(e) {
		e.stopPropagation(); 
		e.preventDefault(); 
	}
}