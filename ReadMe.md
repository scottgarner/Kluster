Kluster
=======

[Kluster](http://kluster.j38.net/) is an experiment/technology demo that uses [k-means clustering](http://en.wikipedia.org/wiki/K-means_clustering) to create a 3D star system using the pixels of an image.

The inspiration to use k-means on image pixels came from a [post](http://0xfe.blogspot.com/2011/12/k-means-clustering-and-art.html) by [Mohit Muthanna](https://plus.google.com/u/0/111867441083313519234/about).

[View it live](http://kluster.j38.net/).

This work is licensed under a [Creative Commons Attribution 3.0 Unported License](http://creativecommons.org/licenses/by/3.0/).

Technologies
------------

I used this project as an opportunity to experiment with a number of new technologies.

* WebGL

	[WebGL](http://en.wikipedia.org/wiki/WebGL) allows for hardware-accelerated graphics in a browser without plug-ins. I use the excellent [Three.js](https://github.com/mrdoob/three.js/) to make it more manageable.

* WebRTC

	Part of [WebRTC](http://en.wikipedia.org/wiki/WebRTC) is support for accessing user hardware. Using getUserMedia(), I can display the user's webcam and allow them to grab a frame for processing.

* File API

	With the [File API](http://en.wikipedia.org/wiki/HTML5_File_API), I can get drag-and-dropped images into a canvas all on the client side using FileReader.

* Web Workers

	The k-means calculation takes a few moments and normally this locks up the browser and stops the animation. Using [Web Workers](http://en.wikipedia.org/wiki/Web_Workers), I can do these calculations in the background.
