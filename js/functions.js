// http://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript

function rgb2hsv () {
    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

// http://www.mymessedupmind.co.uk/index.php/javascript-multi-dimentional-k-means-algorithm

function kmeans( arrayToProcess, centroids, clusters )
{ 

	var Groups = [];
	var tempdistance=0;
	var oldcentroids=centroids;

	do
	{ 

		for( reset=0; reset < clusters; reset++ )
		{

			Groups[reset]=Array();

		}

		changed=false;

		for( i=0; i < arrayToProcess.length; i++)
		{   

			lowdistance=-1;
			lowclusters=0;  

			for( clustersloop=0; clustersloop < clusters; clustersloop++ )
			{     

				dist=0;   

				for( j=0;  j < arrayToProcess[i].length; j++ )
				{

					dist+=Math.abs( Math.pow( arrayToProcess[i][j], 2 ) - Math.pow( centroids[clustersloop][j], 2 ) );

				}

				tempdistance=Math.sqrt( dist );

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

			Groups[lowclusters].push( arrayToProcess[i].slice() );  

		}

		for( clustersloop=0; clustersloop < clusters; clustersloop++)
		{

			for( i=0; i < Groups[clustersloop].length; i++ )
			{

				for( j=0; j < Groups[clustersloop][i].length; j++ )
				{

					centroids[clustersloop][j]+=Groups[clustersloop][i][j]

				}

			}

			for( i=0; i < centroids[clustersloop].length; i++ )
			{

				centroids[clustersloop][i]=( centroids[clustersloop][i]/Groups[clustersloop].length );

				if ( centroids[clustersloop][i]!=oldcentroids[clustersloop][i] )
				{

					changed=true;
					oldcentroids=centroids;

				}

			}

		}

	}
	while(changed==true);

	return Groups;

}