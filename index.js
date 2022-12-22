import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/GLTFLoader.js';

    let scene, 
        camera, 
        renderer, 
        orbitControls, 
        particles,
        clock, 
        raycaster,
        audioPlayer,
        arrowModel
        
    let lerping = false
    let cameraTarget = new THREE.Vector3(2.5, 1.5, 2.5)
    let zoomedIn = false
    const positionArray = {}
    const mixerArray = []
    const animationDict = {}
    const pointer = new THREE.Vector2();
    
    const particleNum = 1000;
    const maxRange = 1000;
    const minRange = maxRange / 2;
    const textureSize = 64.0;

    const drawRadialGradation = (ctx, canvasRadius, canvasW, canvasH) => {
        ctx.save();
        const gradient = ctx.createRadialGradient(canvasRadius,canvasRadius,0,canvasRadius,canvasRadius,canvasRadius);
        gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,canvasW,canvasH);
        ctx.restore();
    }

    const getTexture = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const diameter = textureSize;
        canvas.width = diameter;
        canvas.height = diameter;
        const canvasRadius = diameter / 2;

        /* gradation circle
        ------------------------ */
        drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height);
        
        /* snow crystal
        ------------------------ */
        const texture = new THREE.Texture(canvas);
        texture.type = THREE.FloatType;
        texture.needsUpdate = true;
        return texture;
    }

    const render = (timeStamp) => {

        if(mixerArray.length > 0){
            const delta = clock.getDelta()
            mixerArray.forEach(mixer => mixer.update(delta))       
        }

        const posArr = particles.geometry.vertices;
        const velArr = particles.geometry.velocities;

        posArr.forEach((vertex, i) => {
            const velocity = velArr[i];

            const x = i * 3;
            const y = i * 3 + 1;
            const z = i * 3 + 2;
            
            const velX = Math.sin(timeStamp * 0.001 * velocity.x) * 0.1;
            const velZ = Math.cos(timeStamp * 0.0015 * velocity.z) * 0.1;
            
            vertex.x += velX;
            vertex.y += velocity.y;
            vertex.z += velZ;

            if (vertex.y < -minRange ) {
                vertex.y = minRange;
            }

        })

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObject(scene, true);
        let intersecting = false

        intersects.forEach(object => {
            if(object.object.name.includes('flap') || object.object.name.includes('heart')){
                intersecting = true
              }
        })

        if (intersecting === true) { document.body.style.cursor = 'pointer' } else { document.body.style.cursor = 'default' }

        particles.geometry.verticesNeedUpdate = true;

        orbitControls.update();
        
        if(lerping === false){
            cameraTarget = orbitControls.object.position
        }
        camera.position.lerp(cameraTarget, 0.1);
             

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    const onResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    function onPointerMove( e ) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    const init = () => {
        // const month = new Date().getMonth()
        const date = 24//new Date().getDate()
        raycaster = new THREE.Raycaster();
        
        /* scene
        -------------------------------------------------------------*/
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000036, 0, minRange * 3);

        /* camera
        -------------------------------------------------------------*/
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(2.5, 1.5, 2.5);

        /* audio
        -------------------------------------------------------------*/
        const listener = new THREE.AudioListener();
        camera.add( listener );
        audioPlayer = new THREE.Audio( listener );
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( './openFlap.mp3', function( buffer ) {
            audioPlayer.setBuffer( buffer );
            audioPlayer.setLoop( false );
            audioPlayer.setVolume( 1 );
        });

        /* renderer
        -------------------------------------------------------------*/
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(new THREE.Color(0x000036));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        //renderer.setClearAlpha(0);

        /* OrbitControls
        -------------------------------------------------------------*/
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControls.autoRotate = false;
        orbitControls.enableDamping = true;
        orbitControls.enablePan = false
        orbitControls.enableZoom = false
        orbitControls.dampingFactor = 0.2;
        orbitControls.target = new THREE.Vector3(0, 0.25, 0)

        /* AmbientLight
        -------------------------------------------------------------*/
        const ambientLight = new THREE.AmbientLight(0x666666);
        scene.add(ambientLight);

        /* SpotLight
        -------------------------------------------------------------*/
        const spotLight = new THREE.PointLight(0xffffff, 4);
        spotLight.distance = 2000;
        spotLight.position.set(50, 10, 50);
        spotLight.castShadow = true;
        scene.add(spotLight);
        
        const spotLight2 = new THREE.PointLight(0xffffff, 4);
        spotLight2.distance = 2000;
        spotLight2.position.set(-50, 10, -50);
        spotLight2.castShadow = true;
        scene.add(spotLight2);

        const spotLight3 = new THREE.PointLight(0xffffff, 4);
        spotLight3.distance = 1000;
        spotLight3.position.set(25, -10, 50);
        spotLight3.castShadow = true;
        scene.add(spotLight3);

        /* Clock */

        clock = new THREE.Clock()

        /* Color change functions */

        const forestGreen = new THREE.Color( 0x007152 )

        function vertexShader() {
            return `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    vec2 resolution = vec2(480, 360);

                    vec4 snapToPixel = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
                    vec4 vertex = snapToPixel;
                    vertex.xyz = snapToPixel.xyz / snapToPixel.w;
                    vertex.x = floor(resolution.x * vertex.x) / resolution.x;
                    vertex.y = floor(resolution.y * vertex.y) / resolution.y;
                    vertex.xyz *= snapToPixel.w;

                    gl_Position = vertex;
                }
            `
          }

          function fragmentShader(){
            return `
                uniform sampler2D uTexture;
                varying vec2 vUv;
        
                void main() {
                    vec4 textureColor = texture2D(uTexture, vUv);
                    gl_FragColor = textureColor;
                }
            `
          }

        /* Snow Particles
        -------------------------------------------------------------*/
        const pointGeometry = new THREE.Geometry();
        for (let i = 0; i < particleNum; i++) {
            const x = Math.floor(Math.random() * maxRange - minRange);
            const y = Math.floor(Math.random() * maxRange - minRange);
            const z = Math.floor(Math.random() * maxRange - minRange);
            const particle = new THREE.Vector3(x, y, z);
            pointGeometry.vertices.push(particle);
        }
        
        const pointMaterial = new THREE.PointsMaterial({
            size: 8,
            color: 0xffffff,
            vertexColors: false,
            map: getTexture(),
            transparent: true,
            fog: true,
            depthWrite: false
        });

        const velocities = [];
        for (let i = 0; i < particleNum; i++) {
            const x = Math.floor(Math.random() * 6 - 3) * 0.1;
            const y = Math.floor(Math.random() * 10 + 3) * - 0.05;
            const z = Math.floor(Math.random() * 6 - 3) * 0.1;
            const particle = new THREE.Vector3(x, y, z);
            velocities.push(particle);
        }

        particles = new THREE.Points(pointGeometry, pointMaterial);
        particles.geometry.velocities = velocities;
        scene.add(particles);

        const loader = new GLTFLoader();
        const textureLoader = new THREE.TextureLoader();

        let calendarState
        if(window.localStorage.getItem("calendarState") !== null){
            calendarState = JSON.parse(window.localStorage.getItem("calendarState")) 
        } else {
            calendarState = false
        }

        const loadModels = [loader.loadAsync('./models/heart1.glb'), 
        loader.loadAsync('./models/heart2.glb'),
        loader.loadAsync('./models/heart3.glb'),
        loader.loadAsync('./models/heart4.glb'),
        loader.loadAsync('./models/heart5.glb'),
        loader.loadAsync('./models/heart6.glb'),
        loader.loadAsync('./models/heart7.glb'),
        loader.loadAsync('./models/heart8.glb'),
        loader.loadAsync('./models/heart9.glb'),
        loader.loadAsync('./models/heart10.glb'),
        loader.loadAsync('./models/heart11.glb'),
        loader.loadAsync('./models/heart12.glb'),
        loader.loadAsync('./models/heart13.glb'),
        loader.loadAsync('./models/heart14.glb'),
        loader.loadAsync('./models/heart15.glb'),
        loader.loadAsync('./models/heart16.glb'),
        loader.loadAsync('./models/heart17.glb'),
        loader.loadAsync('./models/heart18.glb'),
        loader.loadAsync('./models/heart19.glb'),
        loader.loadAsync('./models/heart20.glb'),
        loader.loadAsync('./models/heart21.glb'),
        loader.loadAsync('./models/heart22.glb'),
        loader.loadAsync('./models/tree.glb'), 
        loader.loadAsync('./models/candles.glb'), 
        loader.loadAsync('./models/flap00.glb'), 
        loader.loadAsync('./models/flap01.glb'),
        loader.loadAsync('./models/flap02.glb'),
        loader.loadAsync('./models/flap03.glb'), 
        loader.loadAsync('./models/flap04.glb'),
        loader.loadAsync('./models/flap05.glb'), 
        loader.loadAsync('./models/flap06.glb'),
        loader.loadAsync('./models/flap07.glb'),
        loader.loadAsync('./models/flap08.glb'), 
        loader.loadAsync('./models/flap09.glb'),
        loader.loadAsync('./models/flap10.glb'), 
        loader.loadAsync('./models/flap11.glb'),
        loader.loadAsync('./models/flap12.glb'),
        loader.loadAsync('./models/flap13.glb'), 
        loader.loadAsync('./models/flap14.glb'),
        loader.loadAsync('./models/flap15.glb'), 
        loader.loadAsync('./models/flap16.glb'),
        loader.loadAsync('./models/flap17.glb'),
        loader.loadAsync('./models/flap18.glb'), 
        loader.loadAsync('./models/flap19.glb'),
        loader.loadAsync('./models/flap20.glb'),
        loader.loadAsync('./models/flap21.glb'),
        loader.loadAsync('./models/flap22.glb'), 
        loader.loadAsync('./models/flap23.glb')]

        Promise.all(loadModels).then(models => {
            models.forEach(model => {
                model.scene.position.y = -1

                
                if(model.scene.children[0].name === "Circle") {
                    textureLoader.load( "./pine.png", function ( map ) {
                        map.needsUpdate = true
                        let treeModel = model.scene.children[0];

                        let uniforms = {
                            uTexture: { value: map }
                        }

                        let material =  new THREE.ShaderMaterial({
                            uniforms: uniforms,
                            fragmentShader: fragmentShader(),
                            vertexShader: vertexShader(),
                        })

                        // material.uniforms.texture.value = map;
                        treeModel.material = material
                        treeModel.material.needsUpdate = true;

                        scene.add(model.scene);
                    });
                    let treeModel = model.scene.children[0];
                    treeModel.material.color = forestGreen
                    scene.add(model.scene)
                } else if(model.scene.children[0].name.includes("heart")){
                    positionArray[model.scene.name] = model.scene.children[0].position
                    scene.add(model.scene)
                } else if(model.scene.children[0].name.includes('candle')){
                    scene.add(model.scene)

                    textureLoader.load( './candle.png', function ( map ) {

                        const material = new THREE.SpriteMaterial({
                            map: map,
                            transparent: true,
                          });

                        model.scene.children.forEach((candle, index) => {
                            const labelCanvas = makeLabelCanvas(40, 28, `candle${index}`);
                            const texture = new THREE.CanvasTexture(labelCanvas);
                            // because our canvas is likely not a power of 2
                            // in both dimensions set the filtering appropriately.
                            texture.minFilter = THREE.LinearFilter;
                            texture.wrapS = THREE.ClampToEdgeWrapping;
                            texture.wrapT = THREE.ClampToEdgeWrapping;

                            const root = new THREE.Object3D()
                            root.position.x = candle.position.x;
                            root.position.y = candle.position.y - 0.84;
                            root.position.z = candle.position.z;

                            const labelBaseScale = 0.01;
                            const label = new THREE.Sprite(material);
                            root.add(label);
                            
                            label.scale.x = labelCanvas.width  * labelBaseScale;
                            label.scale.y = labelCanvas.height * labelBaseScale;

                            scene.add(root)
                        })
                    })
                } else {
                    const dayNumber = parseInt(model.scene.children[0].name.slice(5))+1

                    if(calendarState === false || (dayNumber in calendarState) === false){
                        
                        let flapModel = model.scene.children[0];

                        let uniforms = {
                            uTexture: { value: model.scene.children[0].material.map }
                        }

                        let material =  new THREE.ShaderMaterial({
                            uniforms: uniforms,
                            fragmentShader: fragmentShader(),
                            vertexShader: vertexShader(),
                        })

                        flapModel.material = material
                        flapModel.material.needsUpdate = true;
                        
                        const mixer = new THREE.AnimationMixer( model.scene );
                
                        model.animations.forEach( ( clip ) => {
                            animationDict[flapModel.name] = mixer.clipAction(clip)
                        } );
                        mixerArray.push(mixer)

                        scene.add(model.scene);
                    }                    
                }
                
                
            })
          })

          const arrowmodelLoader = [loader.loadAsync('./models/rotatingArrow.glb')]

            Promise.all(arrowmodelLoader).then(models => {
                models.forEach(model => {
                    arrowModel = model
                }) 
            })

        /* pointer click
        -------------------------------------------------------------*/
          let pointerElement
          function pointerDownFunction(event) {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
            raycaster.setFromCamera(pointer, camera);
          
            const intersects = raycaster.intersectObject(scene, true);
            let hasIntersected = false

            intersects.forEach(object => {
                if(object.object.name.includes('flap') && hasIntersected === false){
                    hasIntersected = true
                    pointerElement = object.object.id
                } else if(object.object.name.includes('heart') && hasIntersected === false){
                    hasIntersected = true
                    pointerElement = object.object.id
                }
            })
          }

        function pointerUpFunction(event) {

            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
            raycaster.setFromCamera(pointer, camera);
          
            const intersects = raycaster.intersectObject(scene, true);
            let hasIntersected = false

            intersects.forEach(object => {
                const dateString = parseInt(object.object.name.slice(5)) + 1

                if(object.object.name.includes('flap') && hasIntersected === false 
                && object.object.id === pointerElement && date >= dateString){
                    hasIntersected = true
                    
                    if(calendarState === false){
                        calendarState = {
                            [dateString]: true
                        }
                    } else {
                        calendarState[dateString] = true
                    }
                    window.localStorage.setItem('calendarState', JSON.stringify(calendarState))

                    const offsetWorldDirectionVector = object.object.getWorldDirection()
                    const zAxis = new THREE.Vector3( 0, 1, 0 )
                    const ninetyDegrees = Math.PI / 1.5
                    offsetWorldDirectionVector.applyAxisAngle( zAxis, ninetyDegrees );
                    offsetWorldDirectionVector.setLength(0.1)

                    const worldDirectionVector = object.object.getWorldDirection()
                    worldDirectionVector.setLength(1.5)

                    const newCameraPosition = new THREE.Vector3( object.object.position.x + worldDirectionVector.x, object.object.position.y - 1, object.object.position.z + 1 * worldDirectionVector.z )
                    const newLookAtPosition = new THREE.Vector3( object.object.position.x + offsetWorldDirectionVector.x , object.object.position.y - 0.9, object.object.position.z + offsetWorldDirectionVector.z )

                    const axis = new THREE.Vector3( 0, 1, 0 )
                    const angle = Math.PI / 1.5
                    newCameraPosition.applyAxisAngle( axis, angle )

                    // orbitControls.object.position.copy(newCameraPosition)
                    cameraTarget = newCameraPosition
                    orbitControls.target = newLookAtPosition
                    orbitControls.update()
                
                    camera.updateProjectionMatrix()

                    const animation = animationDict[object.object.name]
                    animation.setLoop(0,0)
                    animation.clampWhenFinished = true;
                    animation.play()
                    audioPlayer.play();

                    const arrowModelScene = arrowModel.scene
                    const mixer = new THREE.AnimationMixer( arrowModelScene );
                    animationDict['arrow'] = mixer.clipAction(arrowModel.animations[0])
                    const arrowAnimation = animationDict['arrow']
                    arrowAnimation.setLoop(1)
                    arrowAnimation.play()
                    mixerArray.push(mixer)
                    arrowModelScene.position.set(positionArray["Scene"].x, positionArray["Scene"].y, positionArray["Scene"].z)
                    scene.add(arrowModelScene)
                    arrowModelScene.position.set(positionArray["Scene"].x, positionArray["Scene"].y - 1.11, positionArray["Scene"].z)

                    if(zoomedIn === false){
                        toggleZoomButton()
                    } else {
                        lerping = true
                        setTimeout(() => {
                            lerping = false
                        }, 1000)
                    }
                    
                } else if(object.object.name.includes('heart') && hasIntersected === false && object.object.id === pointerElement){
                    hasIntersected = true
                    window.open(`./days/${object.object.name.slice(5,7).replace('_','')}december.pdf`,'_blank');
                }
            })

            if(hasIntersected === false) pointerElement = ''
          }

        renderer.domElement.addEventListener( 'pointerdown', pointerDownFunction );
        renderer.domElement.addEventListener( 'pointerup', pointerUpFunction );

        /* pointer move
        -------------------------------------------------------------*/
        renderer.domElement.addEventListener( 'pointermove', onPointerMove );

        /* resize
        -------------------------------------------------------------*/
        window.addEventListener('resize', onResize);

        const button = document.getElementById("zoomOutButton")
        button.addEventListener("click", toggleZoomButton)

        /* rendering start
        -------------------------------------------------------------*/
        document.getElementById('WebGL-output').appendChild(renderer.domElement);
        requestAnimationFrame(render);
    }

    function toggleZoomButton(){
        lerping = true
        const button = document.getElementById("zoomOutButton")
        const titleImage = document.getElementById('titleImage')
        const audioPlayer = document.getElementById('audioPlayer')
        if(zoomedIn === true){
            button.style.display = "none"
            titleImage.style.display = 'block'
            audioPlayer.style.display = 'block'
            zoomedIn = false
            cameraTarget = new THREE.Vector3(2.5, 1, 2.5)
            orbitControls.target = new THREE.Vector3(0, 0.25, 0)
            orbitControls.update()
        } else {
            button.style.display = "flex"
            titleImage.style.display = 'none'
            audioPlayer.style.display = 'none'
            zoomedIn = true
        }

        setTimeout(() => {
            lerping = false
        }, 1000)
    }

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });

    function makeLabelCanvas(baseWidth, size, name) {
        const borderSize = 2;
        const ctx = document.createElement('canvas').getContext('2d');
        const font =  `${size}px bold sans-serif`;
        ctx.font = font;
        // measure how long the name will be
        const textWidth = ctx.measureText(name).width;
    
        const doubleBorderSize = borderSize * 2;
        const width = baseWidth + doubleBorderSize;
        const height = size + doubleBorderSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
    
        // need to set font again after resizing canvas
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
    
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, width, height);
    
        // scale to fit but don't stretch
        const scaleFactor = Math.min(1, baseWidth / textWidth);
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleFactor, 1);
        ctx.fillStyle = 'white';
        ctx.fillText(name, 0, 0);
    
        return ctx.canvas;
      }