require([
    "../libs/text!../shaders/vertex-shader.glsl",
    "../libs/text!../shaders/fragment-shader.glsl",
    "../libs/text!../shaders/simplex-noise.glsl"
],

function (VertexShader, FragmentShader, Noise) {

    "use strict";

    var camera, scene, renderer;
    var waterGeometry, waterMaterial, waterMesh, waterUniforms;
    var skyBoxGeometry, skyBoxMaterial, skyBoxMesh;

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.z = 5;

        scene = new THREE.Scene();

        /**
         * Water
         */

        waterGeometry = new THREE.PlaneGeometry(10, 5, 1, 1);

        // console.log(VertexShader);
        // console.log(FragmentShader);
        
        waterUniforms = {
            time: { type: 'f', value: 1.0 }
        };

        waterMaterial = new THREE.ShaderMaterial({
            uniforms: waterUniforms,
            vertexShader: VertexShader,
            fragmentShader: Noise + FragmentShader
        });

        //wireframe
        // waterMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

        waterMesh = new THREE.Mesh( waterGeometry, waterMaterial );
        waterMesh.rotation.x += 200.0;
        scene.add( waterMesh );

        /**
         * SkyBox
         */
        
        // var imagePrefix = "images/mountains-";
        // var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        // var imageSuffix = ".jpg";
        // var skyGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );  
        
        // var imageURLs = [];
        // for (var i = 0; i < 6; i++)
        //     imageURLs.push( imagePrefix + directions[i] + imageSuffix );
        // var textureCube = THREE.ImageUtils.loadTextureCube( imageURLs );
        // var shader = THREE.ShaderLib[ "cube" ];
        // shader.uniforms[ "tCube" ].value = textureCube;
        // var skyMaterial = new THREE.ShaderMaterial( {
        //     fragmentShader: shader.fragmentShader,
        //     vertexShader: shader.vertexShader,
        //     uniforms: shader.uniforms,
        //     depthWrite: false,
        //     side: THREE.BackSide
        // } );

        skyBoxGeometry = new THREE.CubeGeometry(2, 2, 2, 1, 1, 1);

        skyBoxMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture("skybox_texture.jpg")
        });

        // skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

        skyBoxMesh = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        // skyBoxMesh.rotation.x += 200.0;
        scene.add( skyBoxMesh );


        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );

    }

    function animate() {

        requestAnimationFrame( animate );

        waterUniforms.time.value += 0.01;

        renderer.render( scene, camera );

    }

});