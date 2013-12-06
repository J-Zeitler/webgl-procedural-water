require([
    "../libs/text!../shaders/water-vertex-shader.glsl",
    "../libs/text!../shaders/water-fragment-shader.glsl",
    "../libs/text!../shaders/simplex-noise.glsl",
    "../libs/orbit-controls"
],

function (VertexShader, FragmentShader, Noise, OrbitControls) {

    "use strict";

    var camera, controls, scene, renderer;
    var waterGeometry, waterMaterial, waterMesh, waterUniforms;
    var skyBoxGeometry, skyBoxMaterial, skyBoxMesh;

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 300 );
        camera.position.x = 0;
        camera.position.y = -1;
        camera.position.z = 0;

        scene = new THREE.Scene();

        /**
         * Water
         */
        waterGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
        
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
        waterMesh.rotation.x = Math.PI*3/2;
        waterMesh.position.y -= 1.5;
        scene.add( waterMesh );

        /**
         * SkyBox
         */
        
        var imagePrefix = "textures/";
        var directions  = ["posx", "negx", "posy", "negy", "posz", "negz"];
        var imageSuffix = ".jpg";
        var skyBoxGeometry = new THREE.CubeGeometry( 200, 200, 200 );
        
        var imageURLs = [];
        for (var i = 0; i < 6; i++)
            imageURLs.push( imagePrefix + directions[i] + imageSuffix );
        var textureCube = THREE.ImageUtils.loadTextureCube( imageURLs );
        var skyBoxShader = THREE.ShaderLib[ "cube" ];
        skyBoxShader.uniforms[ "tCube" ].value = textureCube;
        var skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: skyBoxShader.fragmentShader,
            vertexShader: skyBoxShader.vertexShader,
            uniforms: skyBoxShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        } );

        skyBoxMesh = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        scene.add( skyBoxMesh );


        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        controls = new THREE.OrbitControls(camera, renderer.domElement);

        document.body.appendChild( renderer.domElement );

    }

    function animate() {

        requestAnimationFrame( animate );

        waterUniforms.time.value += 0.02;

        renderer.render( scene, camera );
        controls.update();

    }

});