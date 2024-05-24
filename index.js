import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


let logoText = "Jean's Film";
let fontURL = "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"

let scene, camera, camera2, camera3, renderer;

let loaded = false;
let meshes = [];
let lights = [];
let off = false;

let defaultDeform = 50;

let group = new THREE.Group();
group.name = "textGroup";

let auxTime = 0;

let shaders = [];

for (let i = 0; i < logoText.length; i++) {
    shaders.push(null);
}

function createTwistMaterial(index) {

    const material = new THREE.MeshStandardMaterial({ color: 0xdd4300, wireframe: false, metalness: 0.8, roughness: 0.2});

    material.onBeforeCompile = function (shader) {
        shader.uniforms.deformRatio = { value: 100.0 };
        shader.uniforms.time = { value: 0 };
        shader.uniforms.dizzyTime = { value: 0 };
        shader.uniforms.disabled = { value: false };
        shader.uniforms.dizzy = { value: false };

        shader.vertexShader = "uniform float deformRatio;\nuniform float time;\nuniform float dizzyTime;\nuniform bool disabled;\nuniform bool dizzy;\n" + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            [
                "float theta = sin( time + position.y ) / deformRatio;",
                "float c = cos( theta );",
                "float s = sin( theta );",
                "mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );",
                "vec3 transformed = vec3( position );",
                "if (!disabled) {",
                "transformed = transformed * m;",
                "if (dizzy) {",
                "transformed.x += sin(dizzyTime + transformed.x * transformed.x * 0.12 + transformed.y * 1.3) * transformed.y * 0.035;",
                "transformed.z += sin(dizzyTime) * (transformed.x + transformed.y * 2.5) * 0.1;",
                "}",
                "vNormal = vNormal * m;",
                "}"
            ].join( "\n" )
        );
        shaders[index] = shader;
    };

    return material;
}

function createBendMaterial(index) {
    const material = new THREE.MeshStandardMaterial({ color: 0xdd4300, wireframe: false, metalness: 0.8, roughness: 0.2});

    material.onBeforeCompile = function (shader) {
        shader.uniforms.stretch = { value: 13.0 };
        shader.uniforms.time = { value: 0 };

        shader.vertexShader = "uniform float stretch;\nuniform float time;\nuniform bool disabled;\n" + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            "#include <fog_vertex>",
            [
                "#include <fog_vertex>",
                "vec3 pos = position;",
                "pos.z += pos.z * stretch;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);"
            ].join( "\n" )
        );
        shaders[index] = shader;
    };

    return material;
}

// ******************************************************************** //
// **                                                                ** //
// ******************************************************************** //
function main() {

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color(0.8, 0.8, 0.8));



	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);

    camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1500);
    camera2.position.y += 200;
    camera2.theta = 180;

    camera3 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
    camera3.position.x = -800;
    camera3.position.y += 400;
    camera3.position.z -= 300;
    camera3.lookAt(0, 150, -850);

    requestAnimationFrame(animateCamera);

	const light = new THREE.PointLight(0xffffff, 5*Math.pow(10,5), Math.pow(10,6), 2);
	light.position.set(camera.position.x+2000, camera.position.y-100, camera.position.z+1000);

	const light2 = new THREE.PointLight(0xffffff, 5*Math.pow(10,5), Math.pow(10,6), 2);
	light2.position.set(camera.position.x+2000, camera.position.y+100, camera.position.z+1000);

	const light3 = new THREE.PointLight(0xffffff, 5*Math.pow(10,5), Math.pow(10,6), 2);
	light3.position.set(camera.position.x-2000, camera.position.y-100, camera.position.z+1000);

	const light4 = new THREE.PointLight(0xffffff, 5*Math.pow(10,5), Math.pow(10,6), 2);
	light4.position.set(camera.position.x-2000, camera.position.y+100, camera.position.z+1000);

	const light5 = new THREE.PointLight(0xffffff, 5*Math.pow(10,5), Math.pow(10,6), 2);
	light5.position.set(camera.position.x-100, camera.position.y, camera.position.z+1000);

	const light6 = new THREE.PointLight(0xffffff, 5*Math.pow(10,5), Math.pow(10,6), 2.2);
	light6.position.set(camera.position.x+100, camera.position.y, camera.position.z+1000);

	const light7 = new THREE.PointLight(0xffffff, 5*Math.pow(10,5), Math.pow(10,6), 2);
	light7.position.set(camera.position.x-1500, camera.position.y+700, camera.position.z+1000);

    for (let index = 0; index < 20; index ++) {
        const light = new THREE.PointLight(0xffffff, 3*Math.pow(10,5), Math.pow(10,6), 2);
        const light2 = new THREE.PointLight(0xffffff, 3*Math.pow(10,5), Math.pow(10,6), 2);
        const x = -3000 + index * 400;
    
        light.direction = x >= 0 ? 1 : -1;
        light2.direction = x-150 >= 0 ? 1 : -1;
        light.position.set(x, camera.position.y+10, camera.position.z+1000);
        light2.position.set(x-150, camera.position.y+350, camera.position.z+1000);
    
        lights.push(light);
        lights.push(light2);
        scene.add(light);
        scene.add(light2);
    }

	const envLight = new THREE.AmbientLight(0xffffff, 1);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // Cor branca, intensidade 0.5
    directionalLight.position.set(1, 1, 1).normalize(); // Define a direção da luz

    scene.add(light);
    scene.add(light2);
    scene.add(light3);
    scene.add(light4);
    scene.add(light5);
    scene.add(light6);
    scene.add(light7);

    scene.add(envLight);
    scene.add(directionalLight);

    scene.add(group);

    const fontLoader = new FontLoader();

    fontLoader.load(fontURL, function(font) {
        let posX = 0;
        let width = 0;
        
        logoText.split("").forEach((char, index) => {
            const text = new TextGeometry(char, {
                font: font,
                size: 100,
                height: 5,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 20,
                bevelSize: 6,
                bevelOffset: 1,
                bevelSegments: 10
            });
            text.computeBoundingBox();

            let w = text.boundingBox.max.x - text.boundingBox.min.x;

            width = (w == Infinity || w == -Infinity) ? width : w;
            
            const material = createBendMaterial(index);
            const mesh = new THREE.Mesh(text, material);
            
            mesh.position.x = posX;
            posX += width + 20;
            
            mesh.originalPosition = {...mesh.position};
            group.add(mesh);

            meshes.push(mesh);
        });

        var box = new THREE.Box3().setFromObject(group);
        const size = new THREE.Vector3();
        box.getSize(size);

        group.position.x = -size.x / 2;
        group.position.y = camera.position.y;
        group.position.z = camera.position.z + 100;

        loaded = true;
    });

    requestAnimationFrame(loopRenderAnimation);
    animate();
}

function animate() {
    if (!loaded) {
        return requestAnimationFrame(animate);
    }
    requestAnimationFrame(lightAnimation);
    requestAnimationFrame(moveForward);
    requestAnimationFrame(animateShader);
}

function animateShader() {
    for (let shader of shaders) {
        if (shader?.uniforms?.deformRatio) {
            shader.uniforms.time.value += 0.01;
            shader.uniforms.dizzyTime.value += 0.03;
            shader.uniforms.deformRatio.value += 0.4;
            shader.uniforms.deformRatio.value = Math.min(shader.uniforms.deformRatio.value, defaultDeform);
        }
    }
    
    requestAnimationFrame(animateShader);
}

function loopRenderAnimation() {
    renderer.autoClear = false;
    renderer.clear();

    if (off) {
        return;
    }

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderer.clearDepth();
    
    const width = window.innerWidth * 0.3;
    const height = (window.innerHeight / window.innerWidth) * width;

    renderer.setViewport(window.innerWidth-width-10, 100, width, height);
    renderer.render(scene, camera2);

    renderer.clearDepth();

    const sceneWithCamera = scene.clone();

    const helper = new THREE.CameraHelper(camera2);
    sceneWithCamera.add(helper);

    renderer.setViewport(10, 100, width, height);
    renderer.render(sceneWithCamera, camera3);

    return requestAnimationFrame(loopRenderAnimation);
}

function lightAnimation() {
    if (!loaded) {
        return requestAnimationFrame(lightAnimation);
    }
    lights.forEach((light, _) => {
        if ((light.direction == 1 && light.position.x >= 2000) || (light.direction == -1 && light.position.x <= -2000)) {
            light.direction *= -1;
        }
        light.position.x += light.direction*5;
    });
    return requestAnimationFrame(lightAnimation);
}

function moveForward() {
    const textGroup = scene.getObjectByName("textGroup");
    textGroup.position.z -= 10;
    camera2.theta = 180;

    if (textGroup.position.z <= -850) {
        auxTime = 0;
        
        for (let index = 0; index < meshes.length; index++) {
            const material = createTwistMaterial(index);
            meshes[index].material = material;
        }
        return requestAnimationFrame(jumpSymbol);
    }

    for (let shader of shaders) {
        if (shader?.uniforms.stretch) {
            shader.uniforms.time.value += 0.01;
            shader.uniforms.stretch.value -= 0.45;
        }
    }
    
    textGroup.position.z -= 20;

    requestAnimationFrame(moveForward);
}

function jumpSymbol() {
    if (auxTime++ < 30) {
        return requestAnimationFrame(jumpSymbol);
    }
    auxTime = 0;

    requestAnimationFrame(()=>{
        animateTextJump(100, meshes[4], 15, 1, ()=>{
            animateTextJump(5, meshes[0], 20, 1, ()=>{
                animateTextJump(2, meshes[7], 20, 1, ()=>{
                    requestAnimationFrame(()=>animateTextJump(-1, meshes[0], 25, 1));
                    requestAnimationFrame(()=>animateTextJump(-1, meshes[7], 25, 1, () => {
                        defaultDeform = 50;
                        
                        for (let i = 0; i < shaders.length; i++) {
                            if (i != 4 && i != 2 && i != 7) {
                                shaders[i].uniforms.dizzy.value = true;
                                shaders[i].uniforms.dizzyTime.value = 0;
                            }
                        }

                        getDownLetter(meshes[2], 0);
                    }));
                });
            });
        });
    });
}

// Função para criar a animação de pulo
function animateTextJump(deformRatio, textMesh, velocity, duration, after=undefined, while_function = undefined) {  // s0 + v0*t + at²/2 
    textMesh.position.y += velocity + -0.9*duration

    if (textMesh.position.y <= textMesh.originalPosition.y) {
        textMesh.position.y = textMesh.originalPosition.y;

        if (after !== undefined) {
            for (let shader of shaders) {
                if (shader) {
                    shader.uniforms.deformRatio.value = deformRatio;
                }
            }

            requestAnimationFrame(after);
        }
        return;
    }

    if (while_function !== undefined) {
        while_function();
    }
    requestAnimationFrame(()=>{animateTextJump(deformRatio, textMesh, velocity, duration + 1, after, while_function)});
}


function getDownLetter(textMesh, speed = 0) {
    if (auxTime++ < 5) {
        return requestAnimationFrame(()=>{getDownLetter(textMesh, speed)});
    }
    textMesh.rotateX(speed);

    if (textMesh.rx === undefined) {
        textMesh.rx = 0;
    }
    textMesh.rx += speed;

    if (textMesh.rx >= 3/2) {
        auxTime = 0;
        return requestAnimationFrame(()=>{lookAtBack(meshes[7])})
    }
    requestAnimationFrame(()=>{getDownLetter(textMesh, speed + 0.005)});
}

function lookAtBack(textMesh, speed = 0) {
    if (auxTime++ < 30) {
        return requestAnimationFrame(()=>{lookAtBack(textMesh, speed)});
    }
    textMesh.rotateY(-speed);
    textMesh.position.z += 10;

    if (textMesh.ry === undefined) {
        textMesh.ry = 0;
    }
    textMesh.ry += speed;

    if (textMesh.ry >= 2.9) {
        auxTime = 0;
        return moveAtBack(meshes[7]);
    }
    animateTextJump(15, textMesh, 10, 1, ()=>{requestAnimationFrame(()=>{lookAtBack(textMesh, speed+0.5)});});
}

function moveAtBack(textMesh, speed = 0) {
    if (auxTime++ < 30) {
        return requestAnimationFrame(()=>{moveAtBack(textMesh, speed)});
    }

    if (textMesh.position.x <= textMesh.originalPosition.x-300) {
        auxTime = 0;
        return requestAnimationFrame(()=>{leanDown(textMesh)});
    }
    animateTextJump(15, textMesh, 6, 1, ()=>{requestAnimationFrame(()=>{moveAtBack(textMesh)});}, ()=>{textMesh.position.x -= 2;});
}

function leanDown(textMesh, speed = 0.01) {
    if (auxTime++ < 50) {
        return requestAnimationFrame(()=>{leanDown(textMesh, speed)});
    }
    textMesh.rotateZ(-speed);

    if (textMesh.rz === undefined) {
        textMesh.rz = 0;
    }
    textMesh.rz += speed;

    if (textMesh.rz >= 3/4) {
        auxTime = 0;
        textMesh.rz = 0;
        return leanUp(textMesh);
    }
    requestAnimationFrame(()=>{leanDown(textMesh, speed)});
}

function leanUp(textMesh, speed = 0.01) {
    if (auxTime++ < 5) {
        return requestAnimationFrame(()=>{leanUp(textMesh, speed)});
    }
    textMesh.rotateZ(speed);
    textMesh.rz += speed;
    meshes[2].rotateX(-2*speed);

    if (textMesh.rz >= 3/4) {
        auxTime = 0;
        meshes[2].position.x = meshes[2].originalPosition.x;
        meshes[2].position.y = meshes[2].originalPosition.y;
        meshes[2].position.z = meshes[2].originalPosition.z;
        textMesh.ry = 0
        return lookAtFront(textMesh);
    }
    requestAnimationFrame(()=>{leanUp(textMesh, speed)});
}

function lookAtFront(textMesh, speed = 0) {
    if (auxTime++ < 30) {
        return requestAnimationFrame(()=>{lookAtFront(textMesh, speed)});
    }
    textMesh.rotateY(speed);
    textMesh.ry += speed;

    if (textMesh.ry >= 2.9) {
        auxTime = 0;
        return moveAtFront(textMesh);
    }
    animateTextJump(15, textMesh, 10, 1, ()=>{requestAnimationFrame(()=>{lookAtFront(textMesh, speed+0.5)});});
}

function moveAtFront(textMesh, speed = 0) {
    if (auxTime++ < 20) {
        return requestAnimationFrame(()=>{moveAtFront(textMesh, speed)});
    }

    if (textMesh.position.x >= textMesh.originalPosition.x-5) {
        auxTime = 0;
        return requestAnimationFrame(getDownLowerLetters);
    }
    animateTextJump(15, textMesh, 6, 1, ()=>{requestAnimationFrame(()=>{moveAtFront(textMesh)});}, ()=>{
        textMesh.position.x += 2;
    });
}

function getDown(textMesh, after, speed = 0) {
    if (auxTime++ < 5) {
        return requestAnimationFrame(()=>{getDown(textMesh, after, speed)});
    }
    textMesh.rotateX(speed);
    textMesh.rx += speed;

    if (textMesh.rx >= 3/2) {
        return requestAnimationFrame(after);
    }
    requestAnimationFrame(()=>{getDown(textMesh, after, speed + 0.005)});
}

function getDownLowerLetters() {
    if (auxTime++ < 20) {
        return requestAnimationFrame(getDownLowerLetters);
    }

    auxTime = 0;

    for (let i = 0; i < logoText.length; i++) {
        if ("qwertyuiopasdfghjkklçzxcvbnm".includes(logoText[i])) {
            meshes[i].rx = 0;

            let after = i == logoText.length-1 ? lightsOff : ()=>{};
            requestAnimationFrame(()=>{getDown(meshes[i], after, 0)});
        }
    }
}

function lightsOff(d=true) {
    if (d) {
        for (let i = 0; i < logoText.length; i++) {
            if ("qwertyuiopasdfghjkklçzxcvbnm".includes(logoText[i])) {
                shaders[i].uniforms.dizzy.value = false;

                if (shaders[i]) {
                    shaders[i].uniforms.deformRatio.value = 10;
                }
            }
            else {
                if (shaders[i]) {
                    shaders[i].uniforms.deformRatio.value = 1.5;
                }
            }
        }
    }

    if (auxTime++ < 350) {
        return requestAnimationFrame(()=>{lightsOff(false)});
    }
    renderer.setClearColor(new THREE.Color(0, 0, 0));
    off = true;
}

// Função para mover a câmera em torno da esfera
function animateCamera(y = 200, d = 1.5, pos = 0, t = 1) {
    const radius = 800;
    let theta = camera2.theta;

    const x = radius * Math.sin(theta);
    const z = radius * Math.cos(theta) - 850;

    camera2.position.set(x, y, z);
    camera2.lookAt(pos, 0, -800);

    camera2.theta += 0.005;
    camera2.theta %= 360;

    if (d >= 0 && y >= 500) {
        d *= -1;
    }
    else if (d < 0 && y <= 0) {
        d *= -1;
    }

    if (t >= 0 && pos >= 400) {
        t *= -1;
    }
    else if (t < 0 && pos <= -400) {
        t *= -1;
    }
    y += d;
    pos += t;

    requestAnimationFrame(()=>{animateCamera(y, d, pos, t)});
}

main();

