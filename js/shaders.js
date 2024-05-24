import * as THREE from 'three';


function createBendMaterial(shaderArray, index) {
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
        shaderArray[index] = shader;
    };

    return material;
}


function createTwistMaterial(shaderArray, index) {

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
        shaderArray[index] = shader;
    };

    return material;
}

export {createBendMaterial, createTwistMaterial};