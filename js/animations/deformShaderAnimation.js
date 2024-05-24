function deformShaderAnimation(shaderArray, minDeformationFunction) {
    /**
     * Update the parameters of the shader, to make a deformation animation.
     */
    for (let shader of shaderArray) {
        if (shader?.uniforms?.deformRatio) {
            shader.uniforms.time.value += 0.01;
            shader.uniforms.dizzyTime.value += 0.03;

            shader.uniforms.deformRatio.value += 0.4;
            shader.uniforms.deformRatio.value = Math.min(shader.uniforms.deformRatio.value, minDeformationFunction());
        }
    }
    requestAnimationFrame(() => {deformShaderAnimation(shaderArray, minDeformationFunction)});
}

export default deformShaderAnimation;