precision mediump float;

uniform float time;
uniform sampler2D reflectionMap;
uniform sampler2D refractionMap;
uniform vec3 viewPos;

varying vec4 pos;
varying vec4 pos3d;
varying vec3 vUv;

void main() {
    float epsilon = 0.01;
    float xScale = 0.05;
    float yScale = 0.1;
    float velocity1 = 0.7;
    float velocity2 = 0.3;
    float turbulence1 = 0.2;
    float turbulence2 = 0.5;
    float waveScale1 = .6;
    float waveScale2 = 2.0;
    float waveAmp1 = 2.0;
    float waveAmp2 = 0.5;

    /**
     * Procedural bump mapping
     */
    
    vec3 noiseSeed1 = vec3(vUv.x*xScale, vUv.y*yScale+time*velocity1, time*turbulence1);
    vec3 noiseSeed2 = vec3(vUv.x*xScale, vUv.y*yScale+time*velocity2, time*turbulence2);

    vec3 noiseSeedX1 = vec3(vUv.x*xScale-epsilon, vUv.y*yScale+time*velocity1, time*turbulence1);
    vec3 noiseSeedX2 = vec3(vUv.x*xScale-epsilon, vUv.y*yScale+time*velocity2, time*turbulence2);

    vec3 noiseSeedY1 = vec3(vUv.x*xScale, vUv.y*yScale+time*velocity1-epsilon, time*turbulence1);
    vec3 noiseSeedY2 = vec3(vUv.x*xScale, vUv.y*yScale+time*velocity2-epsilon, time*turbulence2);

    float noise = waveAmp1 * snoise(noiseSeed1*waveScale1);
    noise += waveAmp2 * snoise(noiseSeed2*waveScale2);

    float noiseX = waveAmp1 * snoise(noiseSeedX1*waveScale1);
    noiseX += waveAmp2 * snoise(noiseSeedX2*waveScale2);

    float noiseY = waveAmp1 * snoise(noiseSeedY1*waveScale1);
    noiseY += waveAmp2 * snoise(noiseSeedY2*waveScale2);

    //bump mapped gradient
    vec2 perturbation = vec2((noiseX-noise)/epsilon, (noiseY-noise)/epsilon);

    vec3 gradient = vec3(perturbation*0.5, 10.0);
    gradient = normalize(gradient);

    vec2 ripples = vec2(noiseX, noiseY);
    ripples -= 0.5;
    
    /**
     * Reflection/Refraction mapping
     */
    
    // clip coord -> perspective divide ([-1, -1]) -> [0,1]
    vec2 screenCoordRefl = vec2(
        1.0 - (0.5 * pos.x/pos.z + 0.5), //refl map is flipped in screen.x
        0.5 * pos.y/pos.z + 0.5
    );

    vec2 screenCoordRefr = vec2(
        0.5 * pos.x/pos.z + 0.5, //refr map is not
        0.5 * pos.y/pos.z + 0.5
    );

    vec4 reflColor = texture2D(reflectionMap, screenCoordRefl+ripples/pos.z);
    vec4 refrColor = texture2D(refractionMap, screenCoordRefr+ripples/pos.z);

    // THREE defines up as y
    gradient = vec3(gradient.x, -gradient.z, gradient.y);
    vec3 viewDir = normalize(pos3d.xyz - viewPos);

    float fresnelTerm = dot(gradient, viewDir);

    vec4 fresneldColor = (1.0 - fresnelTerm) * reflColor + fresnelTerm * refrColor;
    vec4 waterColor = vec4(0.3, 0.3, 0.5, 1.0);

    gl_FragColor = 0.8 * fresneldColor + 0.2 * waterColor;

}