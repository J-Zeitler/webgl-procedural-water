precision mediump float;

uniform float time;
uniform sampler2D reflectionMap;
uniform sampler2D normalMap;
uniform vec3 viewPos;

varying vec4 pos;
varying vec4 pos3d;
varying vec3 vUv;

void main() {
    
    // clip coord -> perspective divide ([-1, -1]) -> [0,1]
    vec2 screenCoord = vec2(
        1.0 - (0.5 * pos.x/pos.z + 0.5), //refl map is flipped
        0.5 * pos.y/pos.z + 0.5
    );

    float translation = mod(time*0.05, 1.0);
    vec2 transVec = vec2(0, translation);
    vec3 gradient = texture2D(normalMap, (pos3d.xz*0.005+0.5)+transVec).xyz;
    gradient = vec3((gradient.xy-0.5)*2.0, 1.0);

    vec4 reflColor = texture2D(reflectionMap, screenCoord);
    
    // THREE defines up as y
    gradient = vec3(gradient.x, -gradient.z, gradient.y);
    
    vec3 viewDir = normalize(pos3d.xyz - viewPos);

    float fresneld = dot(gradient, viewDir);
    gl_FragColor = (1.0 - fresneld) * reflColor;
    
    // // gl_FragColor = vec4(gradient, 1.0);
}