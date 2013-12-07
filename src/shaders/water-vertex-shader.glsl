precision mediump float;

varying vec4 pos;

void main() {

    pos =   projectionMatrix * 
            modelViewMatrix * 
            vec4(position,1.0);

    gl_Position = pos;
}