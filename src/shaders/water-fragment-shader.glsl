precision mediump float;

uniform float time;
uniform sampler2D reflectionMap;

varying vec4 pos;

void main() {

    vec4 noiseSeed1 = vec4(pos.x*6.0, pos.y*50.0+time*24.0, pos.z, time*5.0);
    vec4 noiseSeed2 = vec4(pos.x*2.45, pos.y*5.0+time*0.5, pos.z, time*2.0);
    vec4 noiseSeed3 = vec4(pos.x*1.57, pos.y*5.0+time*0.25, pos.z, time*3.0);

    // float noise = 0.5 * snoise(noiseSeed1*0.03);
    // noise += 0.25 * snoise(noiseSeed2*0.17);
    // noise += 0.125 * snoise(noiseSeed3*0.41);

    float noise = 0.5 * snoise(noiseSeed1*0.05);
    noise += 0.25 * snoise(noiseSeed2*0.3);
    noise += 0.125 * snoise(noiseSeed3*0.7);

    vec2 ripples = vec2(noise, noise);
    // ripples -= 0.5;
    
    // clip coord -> perspective divide ([-1, -1]) -> [0,1]
    vec2 screenCoord = vec2(
        1.0 - (0.5 * pos.x/pos.z + 0.5), //refl map is flipped
        0.5 * pos.y/pos.z + 0.5
    );

    vec4 waterColor = vec4(0.4, 0.5, 0.6, 1.0);

    vec4 reflColor = texture2D(reflectionMap, screenCoord+ripples/pos.z);
    // reflColor.xyz *= vec3(clamp(screenCoord.y*2.5, 0.2, 2.5));

    gl_FragColor = mix(
        reflColor*0.95,
        reflColor,
        smoothstep(
            0.4,
            0.6,
            1.0 - sin(noise*3.1415))
    );
    
    // vec3 bumpMap = vec3(noise, 1.0-noise, 1.0);
    // bumpMap = normalize(bumpMap);
    
    // gl_FragColor = reflColor;
}