function lightAnimation(lights) {
    /** 
     * Move the lights of the text in loop.
     */
    lights.forEach((light, _) => {
        if ((light.position.x >= 2000 + 250)) {
            light.position.x = -2000;
        }
        else {
            light.position.x += 5;
        }
    });
    return requestAnimationFrame(() => {lightAnimation(lights)});
}

export default lightAnimation;