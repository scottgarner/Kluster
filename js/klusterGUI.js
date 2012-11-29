/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

var klusterGUI = {

	localMediaStream: null,

	init: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia;

		// Welcome

		klusterGUI.showPanel('welcome');

	},

	clearCanvases: function() {

		var canvas;

		canvas = $('#original')[0];
		canvas.getContext('2d').clearRect ( 0 , 0 , canvas.width, canvas.height );

		canvas = $('#kmeans')[0];
		canvas.getContext('2d').clearRect ( 0 , 0 , canvas.width, canvas.height );

	},

	drawOriginal: function(imageData) {

			$("<img/>").attr('src',imageData).load(function() {
				var aspect = this.width / this.height;
				var context = $('#original')[0].getContext('2d');
				context.drawImage(this, 0, 0, $('#original')[0].width, $('#original')[0].height);

				$('#original').css('width',$('#original').height()* aspect);
				$('#original').css('left', - $('#original').width() / 2);
				
				klusterGUI.calculateKMeans();
			})			
	},

	calculateKMeans: function() {

		// Prepare canvas

		var context = $('#original')[0].getContext('2d');
		var imageData = context.getImageData(0, 0, $('#original')[0].width, $('#original')[0].width);
		var data = imageData.data;

		// KMeans

		klusterEvents.worker.postMessage({
			'imageData': data,
			'clusters':12,
			'imageWidth': $('#original')[0].width,
			'imageHeight': $('#original')[0].height
		});

	},

	drawGroups: function(clusters) {

		var groups = clusters.groups;
		var centroids = clusters.centroids;
		
		var context = $('#kmeans')[0].getContext('2d');	
		var imageData = context.getImageData(0, 0, $('#kmeans')[0].width, $('#kmeans')[0].width);
		var data = imageData.data;

		var k = 0;
		for (var i = 0; i < groups.length; i++) {
			var currentGroup = groups[i];

			for (var j = 0; j < currentGroup.length; j++) {
				var currentPixel = currentGroup[j];
				data[k++] = currentPixel[0];
				data[k++] = currentPixel[1];
				data[k++] = currentPixel[2];
				data[k++] = 255;

			}
		}

		// Draw to Canvas

		context.putImageData(imageData, 0,0);

		$('#kmeans').css('width',$('#original').width());
		$('#kmeans').css('left', parseInt($('#original').css('left')));

		// Add to 3D Scene

		klusterScene.drawClusters(clusters);

	},

	showVideoChooser: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		if (klusterGUI.localMediaStream == null) {
			navigator.getUserMedia({video: true},
				function(stream) {
					klusterGUI.clearCanvases();
					klusterGUI.localMediaStream = stream;
					$("#webcam")[0].src = window.URL.createObjectURL(stream);
					$("#webcam").show();
				},
				function(e) { console.log('Error!', e); });
		} else {
			$("#webcam").show();
		}
	},

	takeVideoSnapshot: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		if (klusterGUI.localMediaStream != null) {
			var aspect = $("#webcam")[0].videoWidth / $("#webcam")[0].videoHeight ;
			var context = $('#original')[0].getContext('2d');
			context.drawImage($("#webcam")[0], 0, 0, $('#original')[0].width, $('#original')[0].height);

			$('#original').css('width',$('#original').height()* aspect);
			$('#original').css('left', - $('#original').width() / 2);
						
			$("#webcam").hide();
			
			klusterGUI.calculateKMeans();
			//klusterGUI.localMediaStream.stop();
		}
	},
	hidePanels: function() {
		$('.panel').fadeOut('fast');
	},
	showPanel: function(panelName) {

		if ($("#" + panelName).is(":visible")) {
			klusterGUI.hidePanels();
		}else {
			klusterGUI.hidePanels();
			$("#" + panelName).css({
				'margin-left': '50%',
				'margin-top': '50%',
				'top': -$("#" + panelName).height()/2 - parseInt($("#" + panelName).css('padding-top')),
				'left': -$("#" + panelName).width()/2 - parseInt($("#" + panelName).css('padding-left'))
			});
			$("#" + panelName).show();
		}

	}
}