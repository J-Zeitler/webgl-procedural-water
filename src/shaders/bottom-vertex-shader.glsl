precision mediump float;

varying vec4 pos;
varying vec3 vUv;
varying vec4 curvePos;

void main() {

    vUv = position;

    curvePos = modelMatrix * 
            		vec4(position,1.0);

    vec3 noiseSeedL = vec3(vUv.x*0.01, vUv.y*0.01, 1.0);
    vec3 noiseSeedS = vec3(vUv.x*0.05, vUv.y*0.03, 1.0);

    float noise = 0.5 * snoise(noiseSeedL);
    noise += 0.25 * snoise(noiseSeedS);

	curvePos.y = sin(curvePos.x*0.04 + 300.0 + noise)*20.0;

    pos =   projectionMatrix *
    		viewMatrix *
            curvePos;

    gl_Position = pos;
}