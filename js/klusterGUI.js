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

		klusterGUI.showPanel('chooseImage');
		
		// Banner

		j38.loadAlerts();	
		j38.rotateAlerts();	

	},

	clearCanvases: function() {

		var canvas, context;

		canvas = $('#original')[0];
		context = canvas.getContext('2d')
		context.clearRect ( 0 , 0 , canvas.width, canvas.height );

		canvas = $('#kmeans')[0];
		canvas.getContext('2d').clearRect ( 0 , 0 , canvas.width, canvas.height );

	},

	loadImageData: function(imageData) {

			$("<img/>").attr('src',imageData).load(function() {
				klusterGUI.drawOriginal(this);
			})			
	},

	drawOriginal: function (image) {

		klusterGUI.clearCanvases();
		klusterScene.clearClusters();			

		var aspect = image.width / image.height;
		var context = $('#original')[0].getContext('2d');
		context.drawImage(image, 0, 0, $('#original')[0].width, $('#original')[0].height);

		$('#original').css('width',$('#original').height()* aspect);
		//$('#original').css('margin-left', - $('#original').width() / 2);
		
		klusterGUI.calculateKMeans();
	},

	calculateKMeans: function() {

		klusterGUI.showPanel('loading');

		// Prepare canvas

		var context = $('#original')[0].getContext('2d');
		var imageData = context.getImageData(0, 0, $('#original')[0].width, $('#original')[0].height);
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
		var imageData = context.getImageData(0, 0, $('#kmeans')[0].width, $('#kmeans')[0].height);
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
		//$('#kmeans').css('margin-left', parseInt($('#original').css('margin-left')));

		// Add to 3D Scene

		klusterScene.drawClusters(clusters);

	},

	showVideoChooser: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		if (klusterGUI.localMediaStream == null) {
			klusterGUI.showPanel('webcamPermission');
			navigator.getUserMedia({video: true},
				function(stream) {
					
					klusterGUI.localMediaStream = stream;
					$("#webcamFeed")[0].src = window.URL.createObjectURL(stream);	

					klusterGUI.showPanel('waiting');	

				    $("#webcamFeed")[0].onloadedmetadata = function(e) {
 						klusterGUI.showPanel('webcam');	
					};

								
				},
				function(e) {
					// Permission denied
					klusterGUI.showPanel("webcamDenied")
				});
		} else {
			klusterGUI.showPanel('webcam');
		}
	},

	takeVideoSnapshot: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		if (klusterGUI.localMediaStream != null) {

			klusterGUI.clearCanvases();
			klusterScene.clearClusters()	

			var aspect = $("#webcamFeed")[0].videoWidth / $("#webcamFeed")[0].videoHeight ;
			var context = $('#original')[0].getContext('2d');
			context.drawImage($("#webcamFeed")[0], 0, 0, $('#original')[0].width, $('#original')[0].height);

			$('#original').css('width',$('#original').height()* aspect);
			//$('#original').css('margin-left', - $('#original').width() / 2);
				
			klusterGUI.calculateKMeans();
			//klusterGUI.localMediaStream.stop();
		}
	},

	hideControls: function() {
		$("#render").toggleClass("full");
		klusterEvents.resize();
	},

	hidePanels: function() {
		$('.panel').fadeOut('fast');
	},

	hideBanner: function() {
		$('#main').removeClass('banner', 1000);
		klusterEvents.resize();
	},

	showPanel: function(panelName) {

		if ($("#" + panelName).is(":visible")) {
			//klusterGUI.hidePanels();
		}else {
			klusterGUI.hidePanels();
			$("#" + panelName).css({
				'left': '50%',
				'top': '50%',
				'margin-top': -$("#" + panelName).height()/2 - parseInt($("#" + panelName).css('padding-top')),
				'margin-left': -$("#" + panelName).width()/2 - parseInt($("#" + panelName).css('padding-left'))
			});
			$("#" + panelName).fadeIn('fast');
		}

	}
}