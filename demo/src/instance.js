function cubeGeometry(size) {
  return [
    { x: size, y: size, z: size },
    { x: size, y: -size, z: size },
    { x: size, y: size, z: -size },
    { x: size, y: -size, z: size },
    { x: size, y: -size, z: -size },
    { x: size, y: size, z: -size },
    { x: -size, y: size, z: -size },
    { x: -size, y: -size, z: -size },
    { x: -size, y: size, z: size },
    { x: -size, y: -size, z: -size },
    { x: -size, y: -size, z: size },
    { x: -size, y: size, z: size },
    { x: -size, y: size, z: -size },
    { x: -size, y: size, z: size },
    { x: size, y: size, z: -size },
    { x: -size, y: size, z: size },
    { x: size, y: size, z: size },
    { x: size, y: size, z: -size },
    { x: -size, y: -size, z: size },
    { x: -size, y: -size, z: -size },
    { x: size, y: -size, z: size },
    { x: -size, y: -size, z: -size },
    { x: size, y: -size, z: -size },
    { x: size, y: -size, z: size },
    { x: -size, y: size, z: size },
    { x: -size, y: -size, z: size },
    { x: size, y: size, z: size },
    { x: -size, y: -size, z: size },
    { x: size, y: -size, z: size },
    { x: size, y: size, z: size },
    { x: size, y: size, z: -size },
    { x: size, y: -size, z: -size },
    { x: -size, y: size, z: -size },
    { x: size, y: -size, z: -size },
    { x: -size, y: -size, z: -size },
    { x: -size, y: size, z: -size },
  ];
}

function getPositions() {
  const positions = [];
  for (let i = 0; i < 9; i += 1) {
    positions.push([-1 + i % 3, 1 - Math.floor(i / 3), 0]);
  }
  return positions;
}

const positions = getPositions();

function Instance(renderer, callback) {
  const blocks = [];
  const random = Math.floor(Math.random() * 9);
  for (let i = 0; i < 9; i += 1) {
    if (i !== random) blocks.push(positions[i]);
  }

  const attributes = [
    {
      name: 'aPositionStart',
      data: (i) => {
        blocks[i][2] = -5;
        return blocks[i];
      },
      size: 3,
    },
    {
      name: 'aPositionEnd',
      data: (i) => {
        blocks[i][2] = 2;
        return blocks[i];
      },
      size: 3,
    },
    {
      name: 'aColor',
      data: () => [100, 100, 100],
      size: 3,
    },
  ];

  const uniforms = {
    uProgress: {
      type: 'float',
      value: 0.0,
    },
  };

  const vertex = `
    attribute vec3 aPositionStart;
    attribute vec3 aPositionEnd;
    attribute vec3 aPosition;
    attribute vec3 aColor;

    uniform float uProgress;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;

    varying vec3 vColor;

    vec3 bezier4(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
      return mix(mix(mix(a, b, t), mix(b, c, t), t), mix(mix(b, c, t), mix(c, d, t), t), t);
    }

    float easeInOutQuint(float t){
      return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * (--t) * t * t * t * t;
    }

    void main(){
      float tProgress = easeInOutQuint(uProgress);
      vec3 newPosition = mix(aPositionStart, aPositionEnd, tProgress);
  float scale = tProgress * 2.0 - 1.0;
          scale = 1.0 - scale * scale;
  vec3 basePosition = aPosition;
          basePosition *= scale;
  vColor = aColor;
      gl_Position = uProjectionMatrix * uModelMatrix * uViewMatrix * vec4(newPosition + basePosition, 1.0);
    }
  `;

  const fragment = `
    precision mediump float;

    varying vec3 vColor;

    void main(){
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;
  const key = Math.random();
  renderer.add(key, {
    attributes,
    multiplier: blocks.length,
    uniforms,
    vertex,
    fragment,
    mode: 4,
    geometry: { vertices: cubeGeometry(2 / 5) },
    modifiers: {
      aColor: (data, k, l, { geometry }) => data[l] + Math.floor(k / (geometry.vertices.length / 3)) * -0.1,
    },
    onRender: (instance) => {
      instance.uniforms.uProgress.value += 0.01;
      if (instance.uniforms.uProgress.value >= 1) {
        instance.uniforms.uProgress.value = 0;
        renderer.remove(key);
        callback(random);
      }
    },
  });
}

export default Instance;
