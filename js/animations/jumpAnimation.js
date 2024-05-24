function jumpTextAnimation(deformRatio, textMesh, shaderArray, velocity, duration, after=undefined, while_function = undefined) {
    textMesh.position.y += velocity + -0.9 * duration

    if (textMesh.position.y <= textMesh.originalPosition.y) {
        textMesh.position.y = textMesh.originalPosition.y;

        if (after !== undefined) {
            for (let shader of shaderArray) {
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
    requestAnimationFrame(()=>{jumpTextAnimation(deformRatio, textMesh, shaderArray, velocity, duration + 1, after, while_function)});
}

export default jumpTextAnimation;