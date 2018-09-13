import Renderer from './renderer';
import Instance from './instance';
import Reward from './reward';

const renderer = Renderer();
const selected = [];

function createInstance(callback) {
  Instance(renderer, (index) => {
    selected.push(index + 1);
    if (selected.length < 4) {
      createInstance(callback);
    } else {
      callback();
    }
  });
}

// Phase 1: message to go offline
const phase1 = document.querySelector('.phase-1');

// Phase 2: Instruction (with WebGL scene)
const phase2 = document.querySelector('.phase-2');

// Phase 3: Code input (from phase 2)
const phase3 = document.querySelector('.phase-3');
const input = document.querySelector('.phase-3 input');

// Phase 4: The real challenge (final)
const phase4 = document.querySelector('.phase-4');
const progress = document.querySelector('.progress');

// Phase 5: Reward
const phase5 = document.querySelector('.phase-5');

let online = true;

window.addEventListener('offline', () => {
  online = false;
  phase1.classList.remove('visible');
  phase2.classList.add('visible');
});

setTimeout(() => {
  if (online) {
    phase1.classList.remove('visible');
    phase2.classList.add('visible');
  }
}, 5000);

document
  .querySelector('.phase-2 button')
  .addEventListener('click', () => {
    phase2.style.transitionDelay = '0s';
    phase2.classList.remove('visible');
    setTimeout(() => {
      createInstance(() => {
        phase3.classList.add('visible');
        input.focus();
      });
    }, 600);
  });

input.addEventListener('input', (e) => {
  if (selected.length === e.currentTarget.value.length) {
    phase3.classList.remove('visible');
    phase4.classList.add('visible');
    const p = document.querySelector('.phase-4 p');
    if (e.currentTarget.value === selected.join('')) {
      p.textContent = `That's right! ${p.textContent}`;
    } else {
      p.textContent = `Almost correct! ${p.textContent}`;
    }
  }
});

let pressed = 0;
let score = 10;

function setPressed(value) {
  const controls = document.querySelectorAll('.controls td');
  if (pressed !== 0) controls[pressed - 1].classList.remove('active');
  pressed = value;
  if (pressed !== 0) controls[value - 1].classList.add('active');
}

function createEndlessInstance(callback) {
  Instance(renderer, (index) => {
    if (index + 1 === pressed) {
      score -= 1;
    } else if (score <= 9) {
      score += 1;
    }
    progress.style.transform = `scaleY(${score / 10})`;
    if (score === 0) {
      setTimeout(callback, 400);
    } else {
      createEndlessInstance(callback);
    }
    setPressed(0);
  });
}

document
  .querySelector('.phase-4 button')
  .addEventListener('click', () => {
    phase4.classList.remove('visible');
    const pad = document.querySelector('.controls');
    pad.classList.add('visible');

    // Handle controls by click
    const controls = document.querySelectorAll('.controls td');
    for (let i = 0; i < controls.length; i += 1) {
      controls[i].addEventListener('click', () => {
        setPressed(i + 1);
      });
    }

    // Handle controls by key
    window.addEventListener('keydown', (e) => {
      const value = (e.keyCode < 49 || e.keyCode > 57) ? 0 : e.keyCode - 48;
      if (value === 0) return;
      setPressed(value);
    });

    createEndlessInstance(() => {
      pad.classList.remove('visible');
      Reward(renderer);
      phase5.classList.add('visible');
    });
  });
