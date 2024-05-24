function getDownLetterAnimation(textMesh, speed = 0, after = undefined, wait = 10) {
    if (wait-- > 0) {
        return requestAnimationFrame(()=>{getDownLetterAnimation(textMesh, speed, after, wait)});
    }
    textMesh.rotateX(speed);

    if (textMesh.rx === undefined) {
        textMesh.rx = 0;
    }
    textMesh.rx += speed;

    if (textMesh.rx >= 3/2) {
        if (after !== undefined) {
            requestAnimationFrame(after);
        }
        return;
    }
    requestAnimationFrame(()=>{getDownLetterAnimation(textMesh, speed + 0.005, after, wait)});
}

export default getDownLetterAnimation;