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

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.set(0,10,0);
        camera.lookAt(new THREE.Vector3(100,0,0));

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

        var flipCam = function (e) {
            if(e.which == '32') {

                var currentUp = new THREE.Vector3(0, 1, 0);
                currentUp.applyQuaternion( camera.quaternion );

                camera.up.set(
                    currentUp.x,
                    -currentUp.y,
                    currentUp.z
                );
                camera.position.set(
                    camera.position.x,
                    -camera.position.y,
                    camera.position.z
                );

                camera.lookAt(new THREE.Vector3(100,0,0));
            }
        }
        document.addEventListener("keydown", flipCam, false);
    }

    function animate() {

        requestAnimationFrame( animate );

        waterUniforms.time.value += 0.02;

        renderer.render( scene, camera );
        controls.update();

    }

});