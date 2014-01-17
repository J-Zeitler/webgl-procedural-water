require([
    "../libs/text!../shaders/water-vertex-shader.glsl",
    "../libs/text!../shaders/water-fragment-shader.glsl",
    "../libs/text!../shaders/simplex-noise-3d.glsl",
    "../libs/text!../shaders/bottom-vertex-shader.glsl",
    "../libs/text!../shaders/bottom-fragment-shader.glsl",
    "../libs/orbit-controls"
],

function (VertexShader, FragmentShader, Noise, BottomVertexShader, BottomFragmentShader) {

    "use strict";

    var camera, secCam, controls, scene, reflScene, refrScene, renderer;
    var waterGeometry, waterMaterial, waterMesh, waterUniforms;
    var bottomGeometry, bottomMaterial, bottomMesh, bottomMeshRefr;
    var skyBoxGeometry, skyBoxMaterial, skyBoxMesh;
    var sphereMesh;
    var directionalLight;
    var reflectionMap, refractionMap;

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.set(0,10,0);
        camera.lookAt(new THREE.Vector3(100,0,0));

        scene = new THREE.Scene();
        reflScene = new THREE.Scene();
        refrScene = new THREE.Scene();

        reflectionMap = new THREE.WebGLRenderTarget( 
            window.innerWidth,
            window.innerHeight,
            { 
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBFormat
            }
        );

        refractionMap = new THREE.WebGLRenderTarget( 
            window.innerWidth,
            window.innerHeight,
            { 
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBFormat
            }
        );

        /**
         * Objects
         */
        sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(5, 30, 30),
            new THREE.MeshLambertMaterial( { color: 'red' } )
        );
        sphereMesh.position.x = 50;
        sphereMesh.position.y = 5;
        sphereMesh.position.z = -10;

        // scene.add(sphereMesh);

        sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(10, 30, 30),
            new THREE.MeshLambertMaterial( { color: 'green' } )
        );
        sphereMesh.position.x = 75;
        sphereMesh.position.y = 10;
        // scene.add(sphereMesh);

        sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(7.5, 30, 30),
            new THREE.MeshLambertMaterial( { color: 'blue' } )
        );
        sphereMesh.position.x = 60;
        sphereMesh.position.y = 7.5;
        sphereMesh.position.z = 12;
        // scene.add(sphereMesh);

        directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(-1, 0, 0).normalize();
        scene.add(directionalLight);

        /**
         * Water
         */
        waterGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
        // waterNormalMap = new THREE.ImageUtils.loadTexture("textures/water-normal-map.jpg");
        
        waterUniforms = {
            time: { type: "f", value: 1.0 },
            reflectionMap: { type: "t", value: reflectionMap },
            refractionMap: { type: "t", value: refractionMap },
            viewPos: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
            screenWH: { type: "v2", value: new THREE.Vector2( window.innerWidth, window.innerHeight ) }
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
         * Bottom
         */
        bottomGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);

        bottomMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: Noise + BottomVertexShader,
            fragmentShader: Noise + BottomFragmentShader
        });

        bottomMesh = new THREE.Mesh( bottomGeometry, bottomMaterial );
        bottomMesh.rotation.x = Math.PI*3/2;
        bottomMesh.position.y = -10;
        scene.add( bottomMesh );

        bottomMeshRefr = new THREE.Mesh( bottomGeometry, bottomMaterial );
        bottomMeshRefr.rotation.x = Math.PI*3/2;
        bottomMeshRefr.position.y = -10;
        refrScene.add( bottomMeshRefr );

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
        console.log(textureCube);
        var skyBoxShader = THREE.ShaderLib[ "cube" ];
        skyBoxShader.uniforms[ "tCube" ].value = textureCube;
        var skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: skyBoxShader.fragmentShader,
            vertexShader: skyBoxShader.vertexShader,
            uniforms: skyBoxShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        } );

        // skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        skyBoxMesh = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        reflScene.add( skyBoxMesh );

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( 0xffffff, 1);
    
        controls = new THREE.OrbitControls(camera);
        updateReflectionCamera();
        document.body.appendChild( renderer.domElement );
    }

    function updateReflectionCamera() {
        secCam = camera.clone(camera);

        var currentUp = new THREE.Vector3(0, 1, 0);
        currentUp.applyQuaternion( camera.quaternion );

        secCam.up.set(
            currentUp.x,
            -currentUp.y,
            currentUp.z
        );
        secCam.position.set(
            camera.position.x,
            -camera.position.y,
            camera.position.z
        );

        var currentAt = new THREE.Vector3(0, 0, 0);
        secCam.lookAt(currentAt);
    }

    function animate() {

        requestAnimationFrame( animate );

        // update viewDirection
        var viewPos = new THREE.Vector3(
            camera.position.x, 
            camera.position.y,
            camera.position.z);

        waterUniforms.time.value += 0.02;
        waterUniforms.viewPos.value = viewPos;

        updateReflectionCamera();
        // render to reflection texture
        renderer.render( scene, secCam, reflectionMap, true );

        // render to refraction texture
        renderer.render( refrScene, camera, refractionMap, true );

        // render to screen
        renderer.render( scene, camera );
        controls.update();
    }

});