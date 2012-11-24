/**
 * @author Scott Garner / http://scott.j38.net/
 */

 "use strict";

var clusterEvents = {
	reader: null,
	worker: null,


	init: function() {

		// Bind Events

		$(document).bind('keypress', clusterEvents.keyPress);
		$(window).bind('resize', clusterEvents.resize);

		$('#content').bind('dragenter', clusterEvents.ignoreEvent); 
		$('#content').bind('dragover', clusterEvents.ignoreEvent); 
		$('#content').bind('dragleave', clusterEvents.ignoreEvent); 
		$('#content').bind('drop', clusterEvents.dropImage); 

		$('#render').bind('drop', clusterEvents.dropImage);

		// Setup file reader

		clusterEvents.reader = new FileReader(); 

		clusterEvents.reader.onload = function(e)
		{
			$("<img/>").attr('src',e.target.result).load(function() {

				var context = $('#dropBox')[0].getContext('2d');
				context.drawImage(this, 0, 0, 400, 200);
				
				clusterGUI.drawKMeans();
			})	
		};

		// Setup worker thread

		clusterEvents.worker = new Worker("js/clusterWorker.js");

		clusterEvents.worker.onmessage = function(e) {
			var groups = e.data;
			clusterGUI.drawGroups(groups);
		};

		clusterEvents.worker.onerror = function(e) {
			alert("Error in file: "+e.filename+"\nline: "+e.lineno+"\nDescription: "+e.message);
		};					

	},

	resize: function(e) {

			clusterScene.camera.aspect = $("#render").width() / $("#render").height()
			clusterScene.camera.updateProjectionMatrix();

			clusterScene.renderer.setSize( $("#render").width() , $("#render").height());

			clusterScene.composer.reset();

	},

	keyPress: function(e) {

        switch (e.which){
        	case "v".charCodeAt(0):
        		clusterGUI.showVideoChooser();
        		break;
        	case "s".charCodeAt(0):
        		clusterGUI.takeVideoSnapshot();
        		break;
        	case "f".charCodeAt(0):
        		$('#render').toggleClass('full');
        		clusterEvents.resize();
        		break;
        	case "r".charCodeAt(0):
        		clusterGUI.clearCanvases();
        		clusterScene.clearClusters();
        		break;

        }
	},
	
	dropImage: function(e)  
	{ 
		clusterEvents.ignoreEvent(e);

		var readFileSize = 0; 
		var files = e.originalEvent.dataTransfer.files; 

		var file = files[0]; 
		readFileSize += file.fileSize; 

		var imageType = /image.*/; 

		if (!file.type.match(imageType))  
		{ 
			return; 
		} 

		clusterEvents.reader.readAsDataURL(file); 
	},

	ignoreEvent: function(e) {
		e.stopPropagation(); 
		e.preventDefault(); 
	}
}