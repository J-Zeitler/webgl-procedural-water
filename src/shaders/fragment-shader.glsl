precision mediump float;

uniform float time;
varying vec3 pos;

void main() {

    vec4 noiseSeed1 = vec4(pos.x, pos.y*15.0+time*6.0, pos.z, time*0.5);
    vec4 noiseSeed2 = vec4(pos.x, pos.y*5.0+time*0.5, pos.z, time*0.25);
    vec4 noiseSeed3 = vec4(pos.x, pos.y*5.0+time*0.25, pos.z, time*0.125);

    float noise = 0.5 * snoise(noiseSeed1*0.1);
    noise += 0.25 * snoise(noiseSeed2*2.0);
    noise += 0.125 * snoise(noiseSeed3*4.0);

    // noise = clamp(noise, 0.1, 1.0);
    gl_FragColor = vec4(noise*0.6, noise*0.7, noise*1.0, 1.0);
}