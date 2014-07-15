 clusterShader = {
    uniforms: THREE.UniformsUtils.merge( [
        THREE.UniformsLib[ "particle" ],
        {
            time: { type: "f", value: 0.0 },
        }

    ] ),
    vertexShader: [
        "attribute vec3 origin; ",
        "attribute float size; ",
        "attribute float rotationSpeed; ",
        "uniform float time;",
        "uniform float scale; ",
        "uniform float amount; ",
        "varying vec3 vColor;",
        "varying float vRotation;",

        "mat4 rotate_y(float theta)",
        "{",
            "return mat4(",
        "        vec4(cos(theta),0.0,sin(theta),0.0),",
        "        vec4(0.0,1.0,0,0.0),",
        "        vec4(-sin(theta),0.0,cos(theta), 0.0),",
        "        vec4(0.0,0.0,0.0,1.0)",
        "    );",
        "}",

        "void main() {",

        "   vColor = color;",   
        "   vRotation = time * rotationSpeed;",    
        "   float amount = (time > size/2.0) ? 1.0 : 1.0 - pow(1.0 - (time / (size/2.0)), 5.0);",
        "   vec4 worldZero =  viewMatrix * vec4( origin ,1.0);",
        //"   vec4 mvPosition = modelViewMatrix * (vec4(position, 1.0) * rotate_y(time / length(position) * 2.0) ) ;",
        "   vec4 mvPosition = modelViewMatrix * (vec4(position, 1.0) ) ;",
        "   vec4 lerpPosition = mix(worldZero, mvPosition, amount)  ;",

        "   gl_PointSize = size * ( scale / length( lerpPosition.xyz ) );",
        "   gl_Position = projectionMatrix * lerpPosition;",

        "}",
    ].join("\n"),

    fragmentShader: [
        "uniform vec3 psColor;",
        "uniform float opacity;",
        "varying vec3 vColor;",
        "varying float vRotation;",
        "uniform sampler2D map;",
        
        "void main() {",
    	"	float mid = 0.5;",
        "	vec2 rotated = vec2(cos(vRotation) * (gl_PointCoord.x - mid) + sin(vRotation) * (gl_PointCoord.y - mid) + mid, cos(vRotation) * (gl_PointCoord.y - mid) - sin(vRotation) * (gl_PointCoord.x - mid) + mid);",
        "   gl_FragColor = vec4( psColor, opacity );",
        "   gl_FragColor = gl_FragColor * texture2D( map, rotated);",
        "   gl_FragColor = gl_FragColor * vec4( vColor, opacity );",

        "}",
    ].join("\n")
};