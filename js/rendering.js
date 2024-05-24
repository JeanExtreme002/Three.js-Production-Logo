import * as THREE from 'three';


function renderInLoop(renderer, scene, camera, flyThroughCamera, externalCamera, finishedFunction) {
    /**
     * Render the scene for every camera, in loop.
     */
    renderer.autoClear = false;
    renderer.clear();

    if (finishedFunction()) {
        return;
    }

    // Render the scene for the main camera.
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderer.clearDepth();
    
    const width = window.innerWidth * 0.3;
    const height = (window.innerHeight / window.innerWidth) * width;

    // Render the scene for the flythrough camera.
    renderer.setViewport(window.innerWidth - width - 10, 100, width, height);
    renderer.render(scene, flyThroughCamera);

    renderer.clearDepth();

    // Render the scene for the external camera.
    const sceneWithCamera = scene.clone();

    const helper = new THREE.CameraHelper(flyThroughCamera);
    sceneWithCamera.add(helper);

    renderer.setViewport(10, 100, width, height);
    renderer.render(sceneWithCamera, externalCamera);

    return requestAnimationFrame(() => {renderInLoop(renderer, scene, camera, flyThroughCamera, externalCamera, finishedFunction)});
}

export default renderInLoop;