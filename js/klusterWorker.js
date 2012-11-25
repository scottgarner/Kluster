/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

self.onmessage = function(e) {

	var groups = kmeans ( e.data.arrayToProcess, e.data.centroids, e.data.clusters);
	self.postMessage(groups);
};

// K-Means function, adapted from Jonathan Spicer
// http://www.mymessedupmind.co.uk/index.php/javascript-multi-dimentional-k-means-algorithm


function kmeans( arrayToProcess, centroids, clusters )
{ 

	var groups = [];
	var tempdistance=0;
	var oldcentroids=centroids;

	var loopCount = 0;
	do
	{ 

		for( var reset=0; reset < clusters; reset++ )
		{
			groups[reset]=Array();
		}

		var changed=false;

		for( var i=0; i < arrayToProcess.length; i++)
		{   

			var lowdistance=-1;
			var lowclusters=0;  

			for( var clustersloop=0; clustersloop < clusters; clustersloop++ )
			{     

				var dist=0;   

				for( var j=0;  j < arrayToProcess[i].length; j++ )
				{

					dist+=Math.abs( Math.pow( arrayToProcess[i][j], 2 ) - Math.pow( centroids[clustersloop][j], 2 ) );

				}

				var tempdistance=Math.sqrt( dist );

				if ( lowdistance==-1 )
				{

					lowdistance=tempdistance;
					lowclusters=clustersloop;

				}
				else if ( tempdistance <= lowdistance )
				{

					lowclusters=clustersloop;
					lowdistance=tempdistance;

				}

			}

			groups[lowclusters].push( arrayToProcess[i].slice() );  

		}

		for( var clustersloop=0; clustersloop < clusters; clustersloop++)
		{

			for( var i=0; i < groups[clustersloop].length; i++ )
			{

				for( var j=0; j < groups[clustersloop][i].length; j++ )
				{

					centroids[clustersloop][j]+=groups[clustersloop][i][j]

				}

			}

			for( var i=0; i < centroids[clustersloop].length; i++ )
			{
				if (groups[clustersloop].length == 0) continue;
				
				centroids[clustersloop][i]=( centroids[clustersloop][i]/groups[clustersloop].length );

				if ( centroids[clustersloop][i]!=oldcentroids[clustersloop][i] )
				{

					if (loopCount++ < 100) {
						changed=true;
						oldcentroids=centroids;
					} 

				}

			}

		}

	}
	while(changed==true);

	return {'groups': groups, 'centroids': centroids};

}