precision mediump float;

uniform float time;
uniform sampler2D reflectionMap;
uniform vec3 viewPos;

varying vec4 pos;
varying vec4 pos3d;
varying vec3 vUv;

void main() {
    float epsilon = 0.01;
    float xScale = 0.05;
    float yScale = 0.1;
    float velocity1 = 0.25;
    float velocity2 = 0.1;
    float turbulence1 = 0.2;
    float turbulence2 = 0.5;
    float waveScale1 = 2.0;
    float waveScale2 = 5.0;
    float waveAmp1 = 0.75;
    float waveAmp2 = 0.2;

    /**
     * Procedural bump mapping
     */
    vec3 noiseSeed1 = vec3(vUv.x*xScale, vUv.y*yScale+time*velocity1, time*turbulence1);
    vec3 noiseSeed2 = vec3(vUv.x*xScale, vUv.y*yScale+time*velocity2, time*turbulence2);
    // vec3 noiseSeed3 = vec3(vUv.x*1.57, vUv.y*5.0+time*0.25, time*3.0);

    vec3 noiseSeedX1 = vec3(vUv.x*xScale-epsilon, vUv.y*yScale+time*velocity1, time*turbulence1);
    vec3 noiseSeedX2 = vec3(vUv.x*xScale-epsilon, vUv.y*yScale+time*velocity2, time*turbulence2);
    // vec3 noiseSeedX3 = vec3(vUv.x*1.57-epsilon, vUv.y*5.0+time*0.25, time*3.0);

    vec3 noiseSeedY1 = vec3(vUv.x*xScale, vUv.y*yScale+time*velocity1-epsilon, time*turbulence1);
    vec3 noiseSeedY2 = vec3(vUv.x*xScale, vUv.y*yScale+time*velocity2-epsilon, time*turbulence2);
    // vec3 noiseSeedY3 = vec3(vUv.x*1.57, vUv.y*5.0+time*0.25-epsilon, time*3.0);

    float noise = waveAmp1 * snoise(noiseSeed1*waveScale1);
    noise += waveAmp2 * snoise(noiseSeed2*waveScale2);
    // noise += 0.125 * snoise(noiseSeed3*0.7); 

    float noiseX = waveAmp1 * snoise(noiseSeedX1*waveScale1);
    noiseX += waveAmp2 * snoise(noiseSeedX2*waveScale2);
    // noiseX += 0.125 * snoise(noiseSeedX3*0.7);

    float noiseY = waveAmp1 * snoise(noiseSeedY1*waveScale1);
    noiseY += waveAmp2 * snoise(noiseSeedY2*waveScale2);
    // noiseY += 0.125 * snoise(noiseSeedY3*0.7);

    //bump mapped gradient
    vec3 gradient = vec3((noiseX-noise)/epsilon+5.0, (noiseY-noise)/epsilon+5.0, 15.0);
    gradient = normalize(gradient);
    gradient.xy = (gradient.xy - 0.5) * 2.0;

    vec2 ripples = vec2(noiseX, noiseY);
    ripples -= 0.5;
    
    // clip coord -> perspective divide ([-1, -1]) -> [0,1]
    vec2 screenCoord = vec2(
        1.0 - (0.5 * pos.x/pos.z + 0.5), //refl map is flipped
        0.5 * pos.y/pos.z + 0.5
    );

    vec4 waterColor = vec4(0.4, 0.5, 0.6, 1.0);

    vec4 reflColor = texture2D(reflectionMap, screenCoord+ripples/pos.z);
    // reflColor.xyz *= vec3(clamp(screenCoord.y*2.5, 0.2, 2.5));

      
    gradient = vec3(gradient.x, -gradient.z, gradient.y);
    vec3 viewDir = normalize(pos3d.xyz - viewPos);

    float fresneld = dot(gradient, viewDir);
    gl_FragColor = (1.0 - fresneld) * reflColor;
    
    // gl_FragColor = mix(
    //     vec4(0.6, 0.7, 0.6, 1.0),
    //     reflColor,
    //     step(0.5, 1.0-fresneld)
    // );


    // gl_FragColor = vec4(vec3(-fresneld), 1.0);
    // gl_FragColor = vec4(vec3(intensity), 1.0);
    // gl_FragColor = vec4(gradient, 1.0);
}