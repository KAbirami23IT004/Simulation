// simulation.js
// Lesson: Physics - Force & Laws of Motion
// Model 4: Full Multi-Scene Physics Engine

(function() {
  'use strict';

  const G = 9.81; // Acceleration due to gravity (m/s²)
  const CONFIG = {
    pixelsPerMeter: 10,
    maxTime: 20,
    inclineAngle: 30 * (Math.PI / 180), // 30 degrees in radians
  };

  // --- MULTI-STYLE THINKING CONTENT ---
  const MULTI_CONTENT = {
    visual: {
      1: 'Show a block accelerating when a net force acts, with velocity–time graph increasing in slope.',
      2: 'Demonstrate constant velocity motion when forces balance and net force becomes zero.',
      3: 'Display free-body diagrams showing friction opposing motion, with friction proportional to the normal force.',
      4: 'Resolve weight on an inclined plane into parallel and perpendicular components and highlight acceleration down the slope.',
      5: 'Use sliding blocks to illustrate changes in momentum and kinetic energy with applied force and displacement.',
    },
    analogy: {
      1: 'Net force is like the push you feel when someone suddenly shoves a shopping cart—it accelerates instantly.',
      2: 'Balanced forces are like standing in an elevator moving steadily—motion continues without change.',
      3: 'Friction is like rubbing hands together; surfaces resist motion and create opposing forces.',
      4: 'Inclined planes are like pushing a suitcase up a ramp, where part of the weight pulls it downward.',
      5: 'Momentum is like a moving truck—mass and velocity together determine how hard it is to stop.',
    },
    cause: {
      1: 'Acceleration occurs only when forces are unbalanced; more force or less mass increases acceleration.',
      2: 'Constant velocity requires zero net force; any change in force changes motion.',
      3: 'Rougher surfaces increase friction and reduce acceleration.',
      4: 'Inclines create a component of weight that pulls the block downward.',
      5: 'Work done on an object increases its kinetic energy; greater momentum means greater impact.',
    },
    model: {
        1: "Newton’s Second Law: F_net = ma",
        2: "Newton’s First Law: Objects maintain velocity unless acted upon by net force.",
        3: "Friction: f_k = μ_k N",
        4: "Inclined plane: a = (mg sinθ − μ_k mg cosθ)/m",
        5: "Work-Energy: W = ΔKE, Momentum p = mv",
    },
    fix: {
      1: 'Force is not needed to keep objects moving at constant velocity—only to change motion.',
      2: 'Mass and weight are not the same; weight depends on gravity.',
      3: 'Friction does not “always” oppose motion; static friction adjusts up to its maximum value.',
      4: 'On an incline, normal force is not mg, it becomes mg cosθ.',
      5: 'Momentum is not the same as force; momentum depends on velocity, force depends on acceleration.',
    },
  };

  // --- LAB CHALLENGES (BLOOM-ALIGNED) ---
  const LAB_CHALLENGES = [
    { tag: 'Observe', text: 'Observe how increasing net force increases acceleration on the v–t graph.' },
    { tag: 'Compare', text: 'Compare motion with and without friction to see how friction reduces net acceleration.' },
    { tag: 'Experiment', text: 'Use sliders to achieve zero net force and verify constant velocity motion.' },
    { tag: 'Analyze', text: 'Given mass and force data, compute acceleration and determine whether friction is present.' },
    { tag: 'Challenge', text: 'Design a motion scenario where the block gains the same KE with two different combinations of force and distance.' },
  ];

  const state = {
    scene: 1,
    force: 100,
    mass: 50,
    frictionCoefficient: 0.1,
    angle: 0,
    running: false,
    time: 0,
    position: 0,
    velocity: 0,
    acceleration: 0,
    work: 0,
    kineticEnergy: 0,
    momentum: 0,
    history: [],
  };

  const els = {
    stage: document.getElementById('scene-stage'),
    tabContent: document.getElementById('tab-content'),
    guideContent: document.getElementById('guide-content'),
    forceMeterVal: document.getElementById('out-k-val'),
    forceMeterUnit: document.getElementById('out-k-unit'),
    outAcceleration: document.getElementById('out-acceleration'),
    outWorkEnergy: document.getElementById('out-work-energy'),
    inpForce: document.getElementById('inp-force'),
    valForce: document.getElementById('val-force'),
    inpMass: document.getElementById('inp-mass'),
    valMass: document.getElementById('val-mass'),
    inpFriction: document.getElementById('inp-friction'),
    valFriction: document.getElementById('val-friction'),
    inpAngle: document.getElementById('inp-angle'),
    valAngle: document.getElementById('val-angle'),
    btnRun: document.getElementById('btn-run'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset'),
  };

  function calculatePhysics(dt) {
    const angleRad = state.angle * (Math.PI / 180);
    const F_applied_x = state.force * Math.cos(angleRad);
    const F_applied_y = state.force * Math.sin(angleRad);

    let F_gravity_parallel = 0;
    let F_normal = state.mass * G - F_applied_y;
    let F_friction = 0;
    let F_net = 0;

    // Normal force cannot be negative
    if (F_normal < 0) F_normal = 0;

    switch (state.scene) {
      case 1: // Newton's Second Law
        F_net = F_applied_x;
        break;
      case 2: // Balanced Forces
        F_friction = state.frictionCoefficient * F_normal;
        F_net = F_applied_x - F_friction;
        if (Math.abs(F_net) < 5) F_net = 0;
        break;
      case 3: // Friction & FBD
        F_friction = state.frictionCoefficient * F_normal;
        F_net = F_applied_x - F_friction;
        break;
      case 4: // Inclined Plane
        const theta = CONFIG.inclineAngle;
        F_gravity_parallel = state.mass * G * Math.sin(theta);
        const F_gravity_perpendicular = state.mass * G * Math.cos(theta);
        F_normal = F_gravity_perpendicular - F_applied_y;
        if (F_normal < 0) F_normal = 0;
        F_friction = state.frictionCoefficient * F_normal;
        F_net = F_applied_x + F_gravity_parallel - F_friction;
        break;
      case 5: // Work, Energy & Momentum
        F_friction = state.frictionCoefficient * F_normal;
        F_net = F_applied_x - F_friction;
        break;
    }

    state.acceleration = F_net / state.mass;
    if (state.running) {
        const initial_velocity = state.velocity;
        state.velocity += state.acceleration * dt;
        state.position += initial_velocity * dt + 0.5 * state.acceleration * dt * dt;
    }


    // Clamp position to stay within canvas
    if (state.position * CONFIG.pixelsPerMeter > 400) {
        state.position = 400 / CONFIG.pixelsPerMeter;
        stopSimulation();
    }
     if (state.position * CONFIG.pixelsPerMeter < 0) {
        state.position = 0;
        state.velocity = 0; // Stop if it hits the wall
    }

    // Update other metrics
    state.kineticEnergy = 0.5 * state.mass * Math.pow(state.velocity, 2);
    state.work = F_net * state.position;
    state.momentum = state.mass * state.velocity;

    // Record history for graph
    if (state.running) {
        state.time += dt;
        state.history.push({ time: state.time, velocity: state.velocity });
    }
  }

  function updateVisuals() {
    // Update sliders and readouts
    els.valForce.innerText = state.force;
    els.valMass.innerText = state.mass;
    els.valFriction.innerText = state.frictionCoefficient.toFixed(2);
    els.valAngle.innerText = state.angle;

    els.forceMeterVal.innerText = state.force.toFixed(1);
    els.outAcceleration.innerText = state.acceleration.toFixed(2);

    if (state.scene === 5) {
        els.outWorkEnergy.innerText = `${state.work.toFixed(0)} J (Work), ${state.kineticEnergy.toFixed(0)} J (KE)`;
    } else {
        els.outWorkEnergy.innerText = '--';
    }

    renderScene();
    updateTabs();
  }
  
  function renderScene() {
      let blockHtml = `<div id="block" style="left: ${state.position * CONFIG.pixelsPerMeter}px;"></div>`;
      let groundHtml = `<div id="ground"></div>`;
      let forceArrows = '';
      let velocityTimeGraph = '';

      const F_app_mag = state.force / 10;
      const F_fric_mag = (state.frictionCoefficient * state.mass * G) / 10;

      forceArrows = `
        <div class="force-arrow applied" style="width:${F_app_mag}px;">F_app</div>
        ${state.scene >= 2 ? `<div class="force-arrow friction" style="width:${F_fric_mag}px;">f_k</div>` : ''}
      `;

      if (state.scene === 1) {
          velocityTimeGraph = renderGraph();
      }

      if (state.scene === 4) {
          els.stage.innerHTML = `<div class="incline-plane" style="transform: rotate(${-CONFIG.inclineAngle * 180 / Math.PI}deg);">
              ${blockHtml}
              ${groundHtml}
          </div>${forceArrows}`;
      } else {
          els.stage.innerHTML = blockHtml + groundHtml + forceArrows + velocityTimeGraph;
      }
  }

  function renderGraph() {
      let pathData = "M5,95";
      if (state.history.length > 1) {
          const maxTime = CONFIG.maxTime;
          const maxVel = Math.max(10, ...state.history.map(p => p.velocity));

          pathData = state.history.map((p) => {
              const x = 5 + (p.time / maxTime) * 90;
              const y = 95 - (p.velocity / maxVel) * 90;
              return `L${x.toFixed(2)},${y.toFixed(2)}`;
          }).join(' ').replace(/^L/, 'M');
      }

      return `<div class="physics-graph">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="${pathData}" fill="none" stroke="var(--color-secondary)" stroke-width="2"/>
          </svg>
          <span class="axis-label-y">Velocity (m/s)</span>
          <span class="axis-label-x">Time (s)</span>
      </div>`;
  }

  let lastTimestamp = 0;
  let animFrame;

  function animLoop(timestamp) {
    if (!state.running) return;

    const deltaTime = (timestamp - lastTimestamp) / 1000; // in seconds
    if (deltaTime > 0.01) { // Cap at ~60fps
      calculatePhysics(deltaTime);
      updateVisuals();
      lastTimestamp = timestamp;
    }

    if (state.time < CONFIG.maxTime) {
      animFrame = requestAnimationFrame(animLoop);
    } else {
      stopSimulation();
    }
  }

  function startSimulation() {
    if (state.running) return;
    if (state.time >= CONFIG.maxTime) resetSimulation();

    state.running = true;
    els.btnRun.disabled = true;
    els.btnPause.disabled = false;
    lastTimestamp = performance.now();
    animLoop(lastTimestamp);
  }

  function stopSimulation() {
    state.running = false;
    els.btnRun.disabled = false;
    els.btnPause.disabled = true;
    cancelAnimationFrame(animFrame);
  }

  function resetSimulation() {
    stopSimulation();
    state.time = 0;
    state.position = 0;
    state.velocity = 0;
    state.acceleration = 0;
    state.work = 0;
    state.kineticEnergy = 0;
    state.momentum = 0;
    state.history = [];
    calculatePhysics(0); // Recalculate forces at reset state
    updateVisuals();
  }

  function initControls() {
    const handleInput = (id, prop, isFloat = false) => {
      els[id].addEventListener('input', (e) => {
        state[prop] = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value);
        if (!state.running) {
            calculatePhysics(0);
            updateVisuals();
        }
      });
    };

    handleInput('inpForce', 'force');
    handleInput('inpMass', 'mass');
    handleInput('inpFriction', 'frictionCoefficient', true);
    handleInput('inpAngle', 'angle');

    els.btnRun.addEventListener('click', startSimulation);
    els.btnPause.addEventListener('click', stopSimulation);
    els.btnReset.addEventListener('click', resetSimulation);

    document.querySelectorAll('.scene-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.closest('.scene-btn');
        document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        state.scene = parseInt(target.dataset.scene);
        resetSimulation();
      });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        updateTabs();
      });
    });
  }

  function renderLabChallenges() {
    els.guideContent.innerHTML = `<ul class="guide-list">
        ${LAB_CHALLENGES.map(g => `
            <li class="guide-item">
                <span class="bloom-tag">${g.tag.toUpperCase()}</span>
                <span class="guide-text">${g.text}</span>
            </li>
        `).join('')}
    </ul>`;
  }

  function updateTabs() {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    const contentData = MULTI_CONTENT[activeTab];
    const sceneContent = contentData ? contentData[state.scene] : 'Select a scene to see content.';

    if (activeTab === 'model') {
        els.tabContent.innerHTML = `<h4>Model</h4><p class="model-text">${sceneContent.replace(/F_net/g, 'F<sub>net</sub>').replace(/f_k/g, 'f<sub>k</sub>').replace(/μ_k/g, 'μ<sub>k</sub>')}</p>`;
    } else {
        els.tabContent.innerHTML = `<h4>${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h4><p>${sceneContent}</p>`;
    }
  }

  function init() {
    initControls();
    renderLabChallenges();
    resetSimulation();
  }

  init();
})();