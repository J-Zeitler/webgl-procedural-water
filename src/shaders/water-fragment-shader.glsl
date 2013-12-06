precision mediump float;

uniform float time;
varying vec3 pos;

void main() {

    vec4 noiseSeed1 = vec4(pos.x*6.0, pos.y*24.0+time*24.0, pos.z, time);
    vec4 noiseSeed2 = vec4(pos.x*2.45, pos.y*5.0+time*0.5, pos.z, time*2.0);
    vec4 noiseSeed3 = vec4(pos.x*1.57, pos.y*5.0+time*0.25, pos.z, time*3.0);

    float noise = 0.5 * snoise(noiseSeed1*0.03);
    noise += 0.25 * snoise(noiseSeed2*0.17);
    noise += 0.125 * snoise(noiseSeed3*0.41);

    // noise = clamp(noise, 0.1, 1.0);
    gl_FragColor = vec4(noise*0.6, noise*0.7, noise*1.0, 1.0);
}