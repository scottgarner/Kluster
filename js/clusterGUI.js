var clusterGUI = {

	localMediaStream: null,

	init: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia;

	},

	drawKMeans: function() {

		image = $('#dropBox')[0];

		// Prepare canvas

		console.log('Prepare canvas');

		context = $('#kmeans')[0].getContext('2d');
		context.drawImage(image, 0, 0, image.width, image.height);

		var imageData = context.getImageData(0, 0, image.width, image.height);
		var data = imageData.data;

		// Pixel Array

		console.log('Canvas to pixel array');

		var clusterCount = 16;
		var pixelArray = [];

		for(var i = 0; i < data.length; i += 4) {
			pixelArray.push([data[i], data[i+1], data[i+2]]);
		}

		// Pick Centroids

		console.log('Prepare Centroids');

		var centroids = [];
		for (var i = 0; i < clusterCount; i++)
			centroids[i] = pixelArray[i * Math.floor(pixelArray.length / clusterCount)];

		// KMeans

		console.log('Kmeans');

		groups = kmeans (pixelArray, centroids, clusterCount);

		// Pixel array to canvas

		console.log('Redraw canvas');

		var k = 0;
		for (var i = 0; i < groups.length; i++) {
			currentGroup = groups[i];
			//console.log(currentGroup);
			currentGroup.sort(function(a,b) {
				return rgb2hsv(a[0], a[1], a[2]).v - rgb2hsv(b[0], b[1], b[2]).v;
			});

			for (var j = 0; j < currentGroup.length; j++) {
				currentPixel = currentGroup[j];

				data[k++] = currentPixel[0];
				data[k++] = currentPixel[1];
				data[k++] = currentPixel[2];
				data[k++] = 255;

			}
		}

		context.putImageData(imageData, 0,0);

		// 3D Scene

		clusterScene.drawClusters(centroids,groups);

	},

	showVideoChooser: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		navigator.getUserMedia({video: true},
			function(stream) {
				clusterGUI.localMediaStream = stream;
				$("#webcam")[0].src = window.URL.createObjectURL(stream);

				$("#webcam").show();
			},
			function(e) { console.log('Error!', e); });
	},

	takeVideoSnapshot: function() {

		if (clusterGUI.localMediaStream != null) {

			var context = $('#dropBox')[0].getContext('2d');
			context.drawImage($("#webcam")[0], 0, 0, 400, 200);
			
			$("#webcam").hide();
			
			clusterGUI.drawKMeans();

			clusterGUI.localMediaStream.stop();
		}
	}
}