function lightAnimation(lights) {
    /** 
     * Move the lights of the text in loop.
     */
    lights.forEach((light, _) => {
        if ((light.direction == 1 && light.position.x >= 2000) || (light.direction == -1 && light.position.x <= -2000)) {
            light.direction *= -1;
        }
        light.position.x += light.direction * 5;
    });
    return requestAnimationFrame(() => {lightAnimation(lights)});
}

export default lightAnimation;