/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

importScripts('vendor/figue.js');

self.onmessage = function(e) {

	var data = e.data.imageData;
	var clusterCount = e.data.clusters;
	var imageWidth = e.data.imageWidth;
	var imageHeight = e.data.imageHeight;

	var labels = new Array ;
	var vectors = new Array ;

	for(var i = 0; i < data.length; i += 4) {

		var pixelIndex = i/4.0;
		var imageY = Math.floor( pixelIndex / imageWidth );
		var imageX = pixelIndex % imageWidth;

		labels.push([imageX,imageY]);
		vectors.push([data[i], data[i+1], data[i+2]]);
	}

	var clusters = figue.kmeans(clusterCount, vectors) ;

	clusters.groups = [];

	for(var i = 0; i < clusters.centroids.length; i++ ) {		
		clusters.groups[i] = [];
	}

	for(var i = 0; i < clusters.assignments.length; i++ ) {
		var groupIndex = clusters.assignments[i];
		clusters.groups[groupIndex].push(vectors[i].concat(labels[i]));
	}

	self.postMessage(clusters);
};
