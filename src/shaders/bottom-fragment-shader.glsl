precision mediump float;

varying vec4 pos;
varying vec3 vUv;
varying vec4 curvePos;

void main() {
    // if(curvePos.y < 0.0) discard;

    vec3 noiseSeedL = vec3(vUv.x*0.3, vUv.y*0.1, 1.0);
    vec3 noiseSeedS = vec3(vUv.x*0.9, vUv.y*0.3, 1.0);

    float noise = 0.5 * snoise(noiseSeedL);
    noise += 0.25 * snoise(noiseSeedS);

    vec4 mud = vec4(0.6, 0.5, 0.4, 1.0);
    vec4 sand = vec4(0.7, 0.6, 0.5, 1.0);
    vec4 bottomColor = (1.0 - noise*2.0) * mud + noise*2.0 * sand;

    vec4 grass = vec4(0.1, 0.3, 0.0, 1.0);
    vec4 groundColor = mix(
    	grass,
    	mud,
    	clamp(noise, 0.0, 1.0)
	);

    vec4 finalMix = mix(
    	bottomColor,
    	groundColor,
    	clamp(curvePos.y, 0.0, 20.0) * 0.05
	);

    gl_FragColor = finalMix;
}