var clusterEvents = {
	reader: null,


	init: function() {

		$(document).bind('keypress', clusterEvents.keyPress);

		$('#dropBox').bind('dragenter', clusterEvents.ignoreEvent); 
		$('#dropBox').bind('dragover', clusterEvents.ignoreEvent); 
		$('#dropBox').bind('dragleave', clusterEvents.ignoreEvent); 
		$('#dropBox').bind('drop', clusterEvents.dropImage); 


		clusterEvents.reader = new FileReader(); 

		clusterEvents.reader.onload = function(e)
		{
			$("<img/>").attr('src',e.target.result).load(function() {

				var context = $('#dropBox')[0].getContext('2d');
				context.drawImage(this, 0, 0, 400, 200);
				
				clusterGUI.drawKMeans();
			})	
		};


	},
	keyPress: function(e) {

        switch (e.which){
        	case "v".charCodeAt(0):
        		clusterGUI.showVideoChooser();
        		break;
        	case "s".charCodeAt(0):
        		clusterGUI.takeVideoSnapshot();
        		break;

        }
	},
	
	dropImage: function(e)  
	{ 
		clusterEvents.ignoreEvent(e);

		var readFileSize = 0; 
		var files = e.originalEvent.dataTransfer.files; 

		//console.log(files);

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