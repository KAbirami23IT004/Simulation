// simulation.js
// Lesson: Physics - Force & Laws of Motion
// Model 4: Full Multi-Scene Physics Engine

(function() {
  'use strict';
  
  // Physics Constants
  const G = 9.8; // m/s^2

  // LAB CHALLENGES (Bloom-aligned)
  const LAB_CHALLENGES = {
    all: [
        { level: 'observe', tag: 'OBSERVE', text: 'Observe how increasing net force increases acceleration on the v–t graph.' },
        { level: 'compare', tag: 'COMPARE', text: 'Compare motion with and without friction to see how friction reduces net acceleration.' },
        { level: 'experiment', tag: 'EXPERIMENT', text: 'Use sliders to achieve zero net force and verify constant velocity motion.' },
        { level: 'analyze', tag: 'ANALYZE', text: 'Given mass and force data, compute acceleration and determine whether friction is present.' },
        { level: 'challenge', tag: 'CHALLENGE', text: 'Design a motion scenario where the block gains the same KE with two different combinations of force and distance.' }
    ]
  };

  const SCENES = {
    1: { name: "Newton’s Second Law: F = ma", svg: `<svg class="sim-svg" viewBox="0 0 200 100"><g class="scene-1-group"><rect class="surface" x="0" y="80" width="200" height="20" fill="#ccc"/><rect class="block" id="block" x="20" y="50" width="30" height="30" fill="dodgerblue"/><g id="force-arrows"></g><g id="graphs"></g></g></svg>` },
    2: { name: "Balanced Forces & Newton’s First Law", svg: `<svg class="sim-svg" viewBox="0 0 200 100"><g class="scene-2-group"><rect class="surface" x="0" y="80" width="200" height="20" fill="#ccc"/><rect class="block" id="block" x="20" y="50" width="30" height="30" fill="dodgerblue"/><g id="force-arrows"></g></g></svg>` },
    3: { name: "Friction & Free-Body Diagrams", svg: `<svg class="sim-svg" viewBox="0 0 200 100"><g class="scene-3-group"><rect class="surface" x="0" y="80" width="200" height="20" fill="#ccc"/><rect class="block" id="block" x="20" y="50" width="30" height="30" fill="dodgerblue"/><g id="force-arrows"></g></g></svg>` },
    4: { name: "Inclined Plane & Components", svg: `<svg class="sim-svg" viewBox="0 0 200 100"><g class="scene-4-group"><path class="surface" d="M0 100 L200 40 L200 100 Z" fill="#ccc"/><g transform="translate(40, 25) rotate(-16.7)"><rect class="block" id="block" y="-10" width="30" height="20" fill="dodgerblue"/></g><g id="force-arrows"></g></g></svg>` },
    5: { name: "Work, Energy & Momentum", svg: `<svg class="sim-svg" viewBox="0 0 200 100"><g class="scene-5-group"><rect class="surface" x="0" y="80" width="200" height="20" fill="#ccc"/><rect class="block" id="block" x="20" y="50" width="30" height="30" fill="dodgerblue"/><g id="energy-bars"></g></g></svg>` }
  };

  const state = {
    scene: 1,
    netForce: 50,      // inp-temp
    frictionCoeff: 0.2, // inp-humidity
    forceAngle: 0,       // inp-wind
    mass: 20,            // inp-area
    motionType: 'linear', // inp-liquid
    running: false,
    acceleration: 0,
    velocity: 0,
    position: 20,
    work: 0,
    kineticEnergy: 0,
    momentum: 0,
    time: 0
  };

  let animFrame;

  const els = {
    stage: document.getElementById('scene-stage'),
    particles: document.getElementById('particle-layer'), // Will be cleared
    windLayer: document.getElementById('wind-layer'), // Will be cleared
    hazeLayer: document.getElementById('haze-layer'), // Will be cleared
    tabContent: document.getElementById('tab-content'),
    thermReadout: document.getElementById('therm-val'),
    thermLiquid: document.getElementById('therm-liquid'),
    chillBadge: document.getElementById('chill-badge'),
    scopeLens: document.getElementById('scope-lens'),
    guideContent: document.getElementById('guide-content'),
    inpTemp: document.getElementById('inp-temp'),
    valTemp: document.getElementById('val-temp'),
    inpHumidity: document.getElementById('inp-humidity'),
    valHum: document.getElementById('val-hum'),
    inpWind: document.getElementById('inp-wind'),
    valWind: document.getElementById('val-wind'),
    inpArea: document.getElementById('inp-area'),
    valArea: document.getElementById('val-area'),
    inpLiquid: document.getElementById('inp-liquid'),
    outEvap: document.getElementById('out-evap'),
    outCool: document.getElementById('out-cool'),
    btnRun: document.getElementById('btn-run'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset')
  };

  function calculatePhysics() {
    const F_app = state.netForce;
    const m = state.mass;
    const mu_k = state.frictionCoeff;
    const theta_deg = state.forceAngle;
    const theta_rad = theta_deg * Math.PI / 180;

    let F_net = 0;
    let F_friction = 0;
    const N = m * G; // Normal force on flat surface

    switch (state.scene) {
      case 1: // F=ma
        F_net = F_app;
        break;
      case 2: // Balanced forces
        F_friction = F_app;
        F_net = F_app - F_friction;
        break;
      case 3: // Friction & FBD
        F_friction = mu_k * N;
        F_net = F_app - F_friction;
        break;
      case 4: // Inclined plane
        const angle_incline = 16.7 * Math.PI / 180;
        const F_parallel = m * G * Math.sin(angle_incline);
        const N_incline = m * G * Math.cos(angle_incline);
        F_friction = mu_k * N_incline;
        F_net = F_parallel - F_friction;
        break;
      case 5: // Work-energy
        F_net = F_app;
        break;
    }

    state.acceleration = F_net / m;
  }

  function updateVisuals() {
    calculatePhysics();

    // Update readouts
    els.outEvap.innerText = state.acceleration.toFixed(2);
    els.outCool.innerText = `${state.netForce.toFixed(1)} N`;

    // Update slider values
    els.valTemp.innerText = state.netForce;
    els.valHum.innerText = state.frictionCoeff;
    els.valWind.innerText = state.forceAngle;
    els.valArea.innerText = state.mass;

    // Update Force Meter
    const forcePercent = (state.netForce / 100) * 100;
    els.thermLiquid.style.height = `${forcePercent}%`;
    els.thermReadout.innerText = `${Math.round(state.netForce)} N`;

    updateTabs();

    const block = document.getElementById('block');
    if (block) {
      block.style.transform = `translateX(${state.position}px)`;
    }
  }

  function renderScene() {
    els.stage.innerHTML = SCENES[state.scene].svg;
    els.particles.innerHTML = '';
    els.windLayer.innerHTML = '';
    els.hazeLayer.innerHTML = '';

    const guides = LAB_CHALLENGES['all'] || [];
    els.guideContent.innerHTML = `<ul class="guide-list">
      ${guides.map(g => `
        <li class="guide-item">
          <span class="bloom-tag ${g.level}">${g.tag}</span>
          <span class="guide-text">${g.text}</span>
        </li>
      `).join('')}
    </ul>`;

    updateVisuals();
  }

  function updateTabs() {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    let content = "";
    const mst = {
        visual: `<h4>Visual</h4><ul>
            <li>Scene 1: Show a block accelerating when a net force acts, with velocity–time graph increasing in slope.</li>
            <li>Scene 2: Demonstrate constant velocity motion when forces balance and net force becomes zero.</li>
            <li>Scene 3: Display free-body diagrams showing friction opposing motion, with friction proportional to the normal force.</li>
            <li>Scene 4: Resolve weight on an inclined plane into parallel and perpendicular components and highlight acceleration down the slope.</li>
            <li>Scene 5: Use sliding blocks to illustrate changes in momentum and kinetic energy with applied force and displacement.</li>
        </ul>`,
        analogy: `<h4>Analogy</h4><ul>
            <li>Net force is like the push you feel when someone suddenly shoves a shopping cart—it accelerates instantly.</li>
            <li>Balanced forces are like standing in an elevator moving steadily—motion continues without change.</li>
            <li>Friction is like rubbing hands together; surfaces resist motion and create opposing forces.</li>
            <li>Inclined planes are like pushing a suitcase up a ramp, where part of the weight pulls it downward.</li>
            <li>Momentum is like a moving truck—mass and velocity together determine how hard it is to stop.</li>
        </ul>`,
        cause: `<h4>Cause</h4><ul>
            <li>Acceleration occurs only when forces are unbalanced; more force or less mass increases acceleration.</li>
            <li>Constant velocity requires zero net force; any change in force changes motion.</li>
            <li>Rougher surfaces increase friction and reduce acceleration.</li>
            <li>Inclines create a component of weight that pulls the block downward.</li>
            <li>Work done on an object increases its kinetic energy; greater momentum means greater impact.</li>
        </ul>`,
        model: `<h4>Model</h4><ul>
            <li>Newton’s Second Law: F_net = ma</li>
            <li>Newton’s First Law: Objects maintain velocity unless acted upon by net force.</li>
            <li>Friction: f_k = μ_k N</li>
            <li>Inclined plane: a = (mg sinθ − μ_k mg cosθ)/m</li>
            <li>Work-Energy: W = ΔKE, Momentum p = mv</li>
        </ul>`,
        fix: `<h4>Fix</h4><ul>
            <li>Force is not needed to keep objects moving at constant velocity—only to change motion.</li>
            <li>Mass and weight are not the same; weight depends on gravity.</li>
            <li>Friction does not “always” oppose motion; static friction adjusts up to its maximum value.</li>
            <li>On an incline, normal force is not mg, it becomes mg cosθ.</li>
            <li>Momentum is not the same as force; momentum depends on velocity, force depends on acceleration.</li>
        </ul>`
    };
    content = mst[activeTab];
    els.tabContent.innerHTML = content;
  }

  function animLoop(timestamp) {
    if (!state.running) return;

    const dt = 1/60; // time step
    state.time += dt;

    calculatePhysics();

    state.velocity += state.acceleration * dt;
    state.position += state.velocity * dt;

    if (state.position > 200) { // reset if off-screen
        state.position = 20;
        state.velocity = 0;
    }

    updateVisuals();

    animFrame = requestAnimationFrame(animLoop);
  }

  function resetState() {
    state.running = false;
    state.netForce = 50;
    state.frictionCoeff = 0.2;
    state.forceAngle = 0;
    state.mass = 20;
    state.motionType = 'linear';
    state.acceleration = 0;
    state.velocity = 0;
    state.position = 20;
    state.work = 0;
    state.kineticEnergy = 0;
    state.momentum = 0;
    state.time = 0;

    els.inpTemp.value = state.netForce;
    els.inpHumidity.value = state.frictionCoeff;
    els.inpWind.value = state.forceAngle;
    els.inpArea.value = state.mass;
    els.inpLiquid.value = state.motionType;

    if(animFrame) cancelAnimationFrame(animFrame);

    els.btnRun.disabled = false;
    els.btnPause.disabled = true;

    renderScene();
  }

  function init() {
    // Event Listeners
    els.inpTemp.addEventListener('input', (e) => { state.netForce = parseFloat(e.target.value); updateVisuals(); });
    els.inpHumidity.addEventListener('input', (e) => { state.frictionCoeff = parseFloat(e.target.value); updateVisuals(); });
    els.inpWind.addEventListener('input', (e) => { state.forceAngle = parseFloat(e.target.value); updateVisuals(); });
    els.inpArea.addEventListener('input', (e) => { state.mass = parseFloat(e.target.value); updateVisuals(); });
    els.inpLiquid.addEventListener('change', (e) => { state.motionType = e.target.value; updateVisuals(); });

    document.querySelectorAll('.scene-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.closest('.scene-btn');
        document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        state.scene = parseInt(target.dataset.scene);
        resetState();
      });
    });

    els.btnRun.addEventListener('click', () => {
      state.running = true;
      els.btnRun.disabled = true;
      els.btnPause.disabled = false;
      animLoop();
    });

    els.btnPause.addEventListener('click', () => {
      state.running = false;
      els.btnRun.disabled = false;
      els.btnPause.disabled = true;
      if(animFrame) cancelAnimationFrame(animFrame);
    });

    els.btnReset.addEventListener('click', () => {
      resetState();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        updateTabs();
      });
    });

    resetState();
  }

  init();
})();
