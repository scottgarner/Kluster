// http://www.easyrgb.com/index.php?X=MATH

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
