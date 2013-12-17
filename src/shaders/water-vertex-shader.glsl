precision mediump float;

varying vec4 pos;
varying vec4 pos3d;
varying vec3 vUv;

void main() {

    vUv = position;
    pos3d = modelMatrix * 
            vec4(position, 1.0);

    pos =   projectionMatrix * 
            modelViewMatrix * 
            vec4(position,1.0);

    gl_Position = pos;
}