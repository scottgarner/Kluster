//http://cookbooks.adobe.com/post_Useful_color_equations__RGB_to_LAB_converter-14227.html

THREE.Color.prototype.getXYZ = function() {

	 var r = this.r;
	 var g = this.g;
	 var b = this.b;

	if (r > 0.04045){ r = Math.pow((r + 0.055) / 1.055, 2.4); }
	else { r = r / 12.92; }
	if ( g > 0.04045){ g = Math.pow((g + 0.055) / 1.055, 2.4); }
	else { g = g / 12.92; }
	if (b > 0.04045){ b = Math.pow((b + 0.055) / 1.055, 2.4); }
	else {	b = b / 12.92; }

	r = r * 100;
	g = g * 100;
	b = b * 100;

	var xyz = {x:0, y:0, z:0};
	xyz.x = r * 0.4124 + g * 0.3576 + b * 0.1805;
	xyz.y = r * 0.2126 + g * 0.7152 + b * 0.0722;
	xyz.z = r * 0.0193 + g * 0.1192 + b * 0.9505;

	return xyz;

}

THREE.Color.prototype.getLAB = function() {

	var xyz = this.getXYZ();

	const REF_X = 95.047;
	const REF_Y = 100.000; 
	const REF_Z = 108.883; 
	
	var x = xyz.x / REF_X;   
	var y = xyz.y / REF_Y;  
	var z = xyz.z / REF_Z;  

	if ( x > 0.008856 ) { x = Math.pow( x , 1/3 ); }
	else { x = ( 7.787 * x ) + ( 16/116 ); }
	if ( y > 0.008856 ) { y = Math.pow( y , 1/3 ); }
	else { y = ( 7.787 * y ) + ( 16/116 ); }
	if ( z > 0.008856 ) { z = Math.pow( z , 1/3 ); }
	else { z = ( 7.787 * z ) + ( 16/116 ); }

	var lab = {l:0, a:0, b:0};
	lab.l = ( 116 * y ) - 16;
	lab.a = 500 * ( x - y );
	lab.b = 200 * ( y - z );

	return lab;

}


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