THREE.ShaderUtils.lib["cluster"] = {
    uniforms: THREE.UniformsUtils.merge( [
        THREE.UniformsLib[ "particle" ],
        {
            amount: { type: "f", value: 0.02 },
        }

    ] ),
    vertexShader: [
        "uniform float size; ",
        "uniform float scale; ",
        "uniform float amount; ",
        "varying vec3 vColor;",

        "void main() {",
        "   vColor = color;",
        "   vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
        "   gl_PointSize = size * ( scale / length( mvPosition.xyz ) );",
        "   gl_Position = projectionMatrix * mvPosition;",

        "}",
    ].join("\n"),

    fragmentShader: [
        "uniform vec3 psColor;",
        "uniform float opacity;",
        "varying vec3 vColor;",
        "uniform sampler2D map;",
        
        "void main() {",
        "   gl_FragColor = vec4( psColor, opacity );",
        "   gl_FragColor = gl_FragColor * texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );",
        "   gl_FragColor = gl_FragColor * vec4( vColor, opacity );",

        "}",
    ].join("\n")
};