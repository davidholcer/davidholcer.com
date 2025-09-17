#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision highp float;

uniform vec3 u_pointColor;
uniform vec3 u_pointColorA;
uniform vec3 u_pointColorB;
uniform float u_alpha;
uniform int u_colorMode; // 0=fixed, 1=variable, 2=depth
uniform float u_time;

varying vec3 v_worldPos;
varying float v_depth;
varying float v_pointId;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    // Smooth circular points with antialiasing
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    if (alpha < 0.01) discard;
    
    vec3 finalColor = u_pointColor;
    
    // Apply color mode
    if (u_colorMode == 1) {
        // Variable color mode - use point ID for stable variation
        float colorT = fract(sin(v_pointId * 12.9898) * 43758.5453);
        finalColor = mix(u_pointColorA, u_pointColorB, colorT);
    } else if (u_colorMode == 2) {
        // Depth color mode - use normalized depth
        float depthT = clamp((v_depth + 400.0) / 800.0, 0.0, 1.0);
        finalColor = mix(u_pointColorA, u_pointColorB, depthT);
    }
    
    gl_FragColor = vec4(finalColor, alpha * u_alpha);
}
