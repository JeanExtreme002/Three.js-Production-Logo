function flyThroughAnimation(camera, y = 200, d = 1.5, pos = 0, t = 1) {
    const radius = 800;
    let theta = camera.theta;

    const x = radius * Math.sin(theta);
    const z = radius * Math.cos(theta) - 850;

    camera.position.set(x, y, z);
    camera.lookAt(pos, 0, -800);

    camera.theta += 0.005;
    camera.theta %= 360;

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

    requestAnimationFrame(()=>{flyThroughAnimation(camera, y, d, pos, t)});
}

export default flyThroughAnimation;