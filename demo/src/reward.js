function rotateX(m, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const mv0 = m[0];
  const mv4 = m[4];
  const mv8 = m[8];

  m[0] = c * m[0] + s * m[2];
  m[4] = c * m[4] + s * m[6];
  m[8] = c * m[8] + s * m[10];

  m[2] = c * m[2] - s * mv0;
  m[6] = c * m[6] - s * mv4;
  m[10] = c * m[10] - s * mv8;
}

function getRandom(value) {
  const floor = -value;
  return floor + Math.random() * value * 2;
}

function Reward(renderer) {
  // The amount of particles that will be created
  const multiplier = 40000;

  // Percentage of how long every particle will move
  const duration = 0.9;

  // Update value for every frame
  const step = 0.01;

  // Multiplier of the canvas resolution
  const devicePixelRatio = 1;

  // Every attribute must have:
  // - Name (used in the shader)
  // - Data (returns data for every particle)
  // - Size (amount of variables in the data)
  const attributes = [
    {
      name: 'aPositionStart',
      data: () => [getRandom(0), getRandom(0), getRandom(0)],
      size: 3,
    },
    {
      name: 'aPositionEnd',
      data: () => [getRandom(15), getRandom(15), getRandom(15)],
      size: 3,
    },
    {
      name: 'aColor',
      data: () => [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2, 1],
      size: 3,
    },
    {
      name: 'aOffset',
      data: i => [i * ((1 - duration) / (multiplier - 1))],
      size: 1,
    },
  ];

  // Every uniform must have:
  // - Key (used in the shader)
  // - Type (what kind of value)
  // - Value (based on the type)
  const uniforms = {
    uProgress: {
      type: 'float',
      value: 0.0,
    },
  };

  // Vertex shader used to calculate the position
  const vertex = `
    attribute vec3 aPositionStart;
    attribute vec3 aControlPointOne;
    attribute vec3 aControlPointTwo;
    attribute vec3 aPositionEnd;
    attribute vec3 aPosition;
    attribute vec3 aColor;
    attribute float aOffset;

    uniform float uProgress;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;

    varying vec3 vColor;

    float easeInOutQuint(float t){
      return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * (--t) * t * t * t * t;
    }

    void main(){
      float tProgress = easeInOutQuint(min(1.0, max(0.0, (uProgress - aOffset)) / ${duration}));
      vec3 newPosition = mix(aPositionStart, aPositionEnd, tProgress);
      gl_Position = uProjectionMatrix * uModelMatrix * uViewMatrix * vec4(newPosition + aPosition, 1.0);
      gl_PointSize = ${(devicePixelRatio * 4).toFixed(1)};
      vColor = aColor;
    }
  `;

  // Fragment shader to draw the colored pixels to the canvas
  const fragment = `
    precision mediump float;

    varying vec3 vColor;

    void main(){
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  // Add an instance to the renderer
  renderer.add('cube', {
    attributes,
    multiplier,
    vertex,
    fragment,
    uniforms,
    onRender: (r) => {
      const { uProgress, uModelMatrix } = r.uniforms;
      uProgress.value += step;

      rotateX(uModelMatrix.value, step / 4);
    },
  });
}

export default Reward;
