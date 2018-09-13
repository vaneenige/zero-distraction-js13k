import Phenomenon from '../../src';

function Renderer() {
  return new Phenomenon({
    settings: {
      position: { x: 0, y: 0, z: 4 },
      shouldRender: true,
      devicePixelRatio: window.devicePixelRatio,
    },
    context: {
      alpha: true,
    },
  });
}

export default Renderer;
