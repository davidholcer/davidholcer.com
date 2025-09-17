attribute vec3 a_position;
attribute float a_sizeMultiplier;
attribute float a_pointId;

uniform mat4 u_mvp;
uniform float u_pointSize;
uniform float u_sizeVariation;
uniform float u_time;

varying vec3 v_worldPos;
varying float v_depth;
varying float v_pointId;

void main() {
    gl_Position = u_mvp * vec4(a_position, 1.0);
    
    // Apply size variation if enabled
    float finalSize = u_pointSize;
    if (u_sizeVariation > 0.0) {
        finalSize *= a_sizeMultiplier;
    }
    
    gl_PointSize = finalSize;
    
    // Pass data to fragment shader
    v_worldPos = a_position;
    v_depth = a_position.z;
    v_pointId = a_pointId;
}
