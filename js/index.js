import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { createBendMaterial, createTwistMaterial } from 'shaders';
import flyThroughAnimation from 'flyThroughAnimation';
import jumpTextAnimation from 'jumpAnimation';


let logoText = "Jean's Film";
let fontURL = "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"

let renderer, scene;
let camera, flyThroughCamera, externalCamera;

let meshes = [];
let lights = [];

let loaded = false;
let finished = false;

let defaultDeform = 50;

let group = new THREE.Group();
group.name = "textGroup";

let auxTime = 0;

let shaders = [];

for (let i = 0; i < logoText.length; i++) {
    shaders.push(null);
}

function main() {
    // Create a renderer and add it to the document.
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color(0.8, 0.8, 0.8));

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

    // Create the scene.
    scene = new THREE.Scene();

    // Create a camera to look around the animation.
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
    flyThroughCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1500);
    flyThroughCamera.position.y += 200;

    // Used to move the camera by the animation function below.
    flyThroughCamera.theta = 180;

    requestAnimationFrame(() => flyThroughAnimation(flyThroughCamera));

    // Create an external camera to watch the flythrough animation.
    externalCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
    externalCamera.position.x = -800;
    externalCamera.position.y += 400;
    externalCamera.position.z -= 300;
    externalCamera.lookAt(0, 150, -850);

    // Create some lights for the animation.
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

    // Create lights for the text.
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

    // Light the environment.
	const envLight = new THREE.AmbientLight(0xffffff, 1);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(1, 1, 1).normalize();

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

    // Load the text font and create the text meshes.
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
            
            const material = createBendMaterial(shaders, index);
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

    // Start the animation.
    requestAnimationFrame(renderInLoop);
    animate();
}

function animate() {
    /**
     * Start the animation of the production logo.
     */

    // Start the animation only if the text has been loaded successfully.
    if (!loaded) {
        return requestAnimationFrame(animate);
    }
    requestAnimationFrame(lightAnimation);
    requestAnimationFrame(moveForward);
    requestAnimationFrame(animateShader);
}

function animateShader() {
    /**
     * Update the parameters of the shader, to make a deformation animation.
     */
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

function renderInLoop() {
    /**
     * Render the scene for every camera, in loop.
     */
    renderer.autoClear = false;
    renderer.clear();

    if (finished) {
        return;
    }

    // Render the scene for the main camera.
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderer.clearDepth();
    
    const width = window.innerWidth * 0.3;
    const height = (window.innerHeight / window.innerWidth) * width;

    // Render the scene for the flythrough camera.
    renderer.setViewport(window.innerWidth-width-10, 100, width, height);
    renderer.render(scene, flyThroughCamera);

    renderer.clearDepth();

    // Render the scene for the external camera.
    const sceneWithCamera = scene.clone();

    const helper = new THREE.CameraHelper(flyThroughCamera);
    sceneWithCamera.add(helper);

    renderer.setViewport(10, 100, width, height);
    renderer.render(sceneWithCamera, externalCamera);

    return requestAnimationFrame(renderInLoop);
}

function lightAnimation() {
    /** 
     * Move the lights of the text in loop.
     */
    if (!loaded) {
        return requestAnimationFrame(lightAnimation);
    }
    lights.forEach((light, _) => {
        if ((light.direction == 1 && light.position.x >= 2000) || (light.direction == -1 && light.position.x <= -2000)) {
            light.direction *= -1;
        }
        light.position.x += light.direction * 5;
    });
    return requestAnimationFrame(lightAnimation);
}

function moveForward() {
    const textGroup = scene.getObjectByName("textGroup");
    textGroup.position.z -= 10;
    flyThroughCamera.theta = 180;

    if (textGroup.position.z <= -850) {
        auxTime = 0;
        
        for (let index = 0; index < meshes.length; index++) {
            const material = createTwistMaterial(shaders, index);
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
        jumpTextAnimation(100, meshes[4], shaders, 15, 1, ()=>{
            jumpTextAnimation(5, meshes[0], shaders, 20, 1, ()=>{
                jumpTextAnimation(2, meshes[7], shaders, 20, 1, ()=>{
                    requestAnimationFrame(()=>jumpTextAnimation(-1, meshes[0], shaders, 25, 1));
                    requestAnimationFrame(()=>jumpTextAnimation(-1, meshes[7], shaders, 25, 1, () => {
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
    jumpTextAnimation(15, textMesh, shaders, 10, 1, ()=>{requestAnimationFrame(()=>{lookAtBack(textMesh, speed+0.5)});});
}

function moveAtBack(textMesh, speed = 0) {
    if (auxTime++ < 30) {
        return requestAnimationFrame(()=>{moveAtBack(textMesh, speed)});
    }

    if (textMesh.position.x <= textMesh.originalPosition.x-300) {
        auxTime = 0;
        return requestAnimationFrame(()=>{leanDown(textMesh)});
    }
    jumpTextAnimation(15, textMesh, shaders, 6, 1, ()=>{requestAnimationFrame(()=>{moveAtBack(textMesh)});}, ()=>{textMesh.position.x -= 2;});
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
    jumpTextAnimation(15, textMesh, shaders, 10, 1, ()=>{requestAnimationFrame(()=>{lookAtFront(textMesh, speed+0.5)});});
}

function moveAtFront(textMesh, speed = 0) {
    if (auxTime++ < 20) {
        return requestAnimationFrame(()=>{moveAtFront(textMesh, speed)});
    }

    if (textMesh.position.x >= textMesh.originalPosition.x-5) {
        auxTime = 0;
        return requestAnimationFrame(getDownLowerLetters);
    }
    jumpTextAnimation(15, textMesh, shaders, 6, 1, ()=>{requestAnimationFrame(()=>{moveAtFront(textMesh)});}, ()=>{
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
    finished = true;
}

main();
