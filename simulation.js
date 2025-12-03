// simulation.js
// Force, Momentum & Newton's Laws of Motion — Model 4
(function() {
  'use strict';

  /* ---------- CONFIG ---------- */
  const CONFIG = {
    gravity: 9.81, // m/s^2
    color: { block: '#ff6b6b', ground: '#94a3b8', arrow: '#0078ff', fbd: '#10b981' }
  };

  /* ---------- PEDAGOGY CONTENT (Corrected as per user instructions) ---------- */
  const MODULE_TEXT = {
    scenes: {
      1: "Newton’s Second Law: F = ma",
      2: "Balanced Forces & Newton’s First Law",
      3: "Friction & Free-Body Diagrams",
      4: "Inclined Plane & Components",
      5: "Work, Energy & Momentum"
    },
    visual: {
      1: "Show a block accelerating when a net force acts, with velocity–time graph increasing in slope.",
      2: "Demonstrate constant velocity motion when forces balance and net force becomes zero.",
      3: "Display free-body diagrams showing friction opposing motion, with friction proportional to the normal force.",
      4: "Resolve weight on an inclined plane into parallel and perpendicular components and highlight acceleration down the slope.",
      5: "Use sliding blocks to illustrate changes in momentum and kinetic energy with applied force and displacement."
    },
    analogy: {
      1: "Net force is like the push you feel when someone suddenly shoves a shopping cart—it accelerates instantly.",
      2: "Balanced forces are like standing in an elevator moving steadily—motion continues without change.",
      3: "Friction is like rubbing hands together; surfaces resist motion and create opposing forces.",
      4: "Inclined planes are like pushing a suitcase up a ramp, where part of the weight pulls it downward.",
      5: "Momentum is like a moving truck—mass and velocity together determine how hard it is to stop."
    },
    cause: {
      1: "Acceleration occurs only when forces are unbalanced; more force or less mass increases acceleration.",
      2: "Constant velocity requires zero net force; any change in force changes motion.",
      3: "Rougher surfaces increase friction and reduce acceleration.",
      4: "Inclines create a component of weight that pulls the block downward.",
      5: "Work done on an object increases its kinetic energy; greater momentum means greater impact."
    },
    model: {
      1: "Newton’s Second Law: F_net = ma",
      2: "Newton’s First Law: Objects maintain velocity unless acted upon by net force.",
      3: "Friction: f_k = μ_k N",
      4: "Inclined plane: a = (mg sinθ − μ_k mg cosθ)/m",
      5: "Work-Energy: W = ΔKE, Momentum p = mv"
    },
    fix: {
      1: "Force is not needed to keep objects moving at constant velocity—only to change motion.",
      2: "Mass and weight are not the same; weight depends on gravity.",
      3: "Friction does not “always” oppose motion; static friction adjusts up to its maximum value.",
      4: "On an incline, normal force is not mg, it becomes mg cosθ.",
      5: "Momentum is not the same as force; momentum depends on velocity, force depends on acceleration."
    },
    lab: [
      { tag: 'OBSERVE', text: 'Observe how increasing net force increases acceleration on the v–t graph.' },
      { tag: 'COMPARE', text: 'Compare motion with and without friction to see how friction reduces net acceleration.' },
      { tag: 'EXPERIMENT', text: 'Use sliders to achieve zero net force and verify constant velocity motion.' },
      { tag: 'ANALYZE', text: 'Given mass and force data, compute acceleration and determine whether friction is present.' },
      { tag: 'CHALLENGE', text: 'Design a motion scenario where the block gains the same KE with two different combinations of force and distance.' }
    ]
  };

  /* ---------- STATE ---------- */
  const state = {
    scene: 1,
    F_net: 0,
    mass: 1.0,
    mu: 0.2,
    angle: 30, // Default angle for inclined plane
    running: false,
    time: 0,
    v: 0,
    x: 0,
    a: 0,
    workDone: 0,
    kineticEnergy: 0,
    momentum: 0,
    history: []
  };

  /* ---------- ELEMENTS ---------- */
  const els = {
    stage: document.getElementById('scene-stage'),
    inpTemp: document.getElementById('inp-temp'),
    valTemp: document.getElementById('val-temp'),
    inpArea: document.getElementById('inp-area'),
    valArea: document.getElementById('val-area'),
    inpHumidity: document.getElementById('inp-humidity'),
    valHum: document.getElementById('val-hum'),
    inpWind: document.getElementById('inp-wind'),
    valWind: document.getElementById('val-wind'),
    btnRun: document.getElementById('btn-run'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset'),
    outAccel: document.getElementById('out-evap'),
    outForceWork: document.getElementById('out-cool'),
    tabContent: document.getElementById('tab-content'),
    guideContent: document.getElementById('guide-content'),
  };

  /* ---------- UTILS ---------- */
  function mapFriction(val) {
    if (val <= 10) return 0.0;
    if (val <= 40) return 0.2;
    if (val <= 70) return 0.5;
    return 1.0;
  }
  function format(n, dp = 2) { return n.toFixed(dp); }

  /* ---------- PHYSICS ENGINE ---------- */
  function calculatePhysics(s) {
    const m = s.mass;
    const F_app = s.F_net;
    const theta = (s.scene === 4 ? s.angle : 0) * Math.PI / 180;

    const F_g = m * CONFIG.gravity;
    const N = F_g * Math.cos(theta);
    const F_parallel = F_g * Math.sin(theta);
    const f_k = -Math.sign(s.v) * s.mu * N;

    let F_net_total = F_app - F_parallel;
    if (Math.abs(s.v) > 0.01 || Math.abs(F_app) > Math.abs(f_k)) {
        F_net_total += f_k;
    }

    const a = F_net_total / m;
    return { a, F_net: F_net_total, f_k, N, F_parallel };
  }

  /* ---------- UI & VISUALS ---------- */
  function updateReadouts() {
    els.valTemp.innerText = format(state.F_net, 0);
    els.valArea.innerText = format(state.mass, 2);
    els.valHum.innerText = format(state.mu, 2);
    els.valWind.innerText = format(state.angle, 0);
    els.outAccel.innerText = format(state.a, 2);
    els.outForceWork.innerText = `${format(calculatePhysics(state).F_net, 1)} N | ${format(state.workDone, 1)} J`;
  }

  function renderTabContent() {
      const activeTabEl = document.querySelector('.tabs .tab-btn.active');
      if (!activeTabEl) return;
      const activeTab = activeTabEl.dataset.tab;
      const contentData = MODULE_TEXT[activeTab];
      let html = `<h4>${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h4>`;
      if (contentData) {
          const text = contentData[state.scene] || "No content for this scene.";
          html += `<ul><li>${text}</li></ul>`;
      }
      els.tabContent.innerHTML = html;
  }

  function renderLabGuides() {
    els.guideContent.innerHTML = MODULE_TEXT.lab.map(item =>
      `<div class="guide-item"><div class="bloom-tag">${item.tag}</div><div class="guide-text">${item.text}</div></div>`
    ).join('');
  }

  /* ---------- SCENE IMPLEMENTATION ---------- */
  function drawArrow(ctx, fromx, fromy, tox, toy, color = 'black', label = '') {
      const headlen = 10;
      const angle = Math.atan2(toy - fromy, tox - fromx);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
      if (label) {
          ctx.fillStyle = color;
          ctx.font = '12px Poppins';
          ctx.fillText(label, tox + 10, toy + 5);
      }
  }

  function drawGraph(ctx, w, h) {
    const graphW = 150, graphH = 100;
    const graphX = w - graphW - 20, graphY = 20;
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(graphX, graphY, graphW, graphH);
    ctx.fillStyle = 'black';
    ctx.fillText('v-t graph', graphX + 5, graphY + 15);

    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphH / 2);
    for (let i = 0; i < state.history.length; i++) {
        const p = state.history[i];
        const x = graphX + (p.t / 5) * graphW; // 5 seconds of history
        const y = graphY + graphH / 2 - p.v * 2; // Scale velocity
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'green';
    ctx.stroke();
  }

  function drawScene1(ctx, w, h) { // F = ma
    const groundY = h - 50;
    const boxSize = 50;
    const boxY = groundY - boxSize;
    const boxX = 50 + state.x;

    ctx.fillStyle = CONFIG.color.ground;
    ctx.fillRect(0, groundY, w, 50);
    ctx.fillStyle = CONFIG.color.block;
    ctx.fillRect(boxX, boxY, boxSize, boxSize);

    const { F_net } = calculatePhysics(state);
    drawArrow(ctx, boxX + boxSize/2, boxY + boxSize/2, boxX + boxSize/2 + F_net, boxY + boxSize/2, CONFIG.color.arrow, 'F_net');
    drawGraph(ctx, w, h);
  }

  function drawScene2(ctx, w, h) { // Balanced Forces
    const groundY = h - 50;
    const boxSize = 50;
    const boxY = groundY - boxSize;
    const boxX = w / 2 - boxSize / 2;

    ctx.fillStyle = CONFIG.color.ground;
    ctx.fillRect(0, groundY, w, 50);
    ctx.fillStyle = CONFIG.color.block;
    ctx.fillRect(boxX, boxY, boxSize, boxSize);

    const F_app = state.F_net > 0 ? state.F_net : 0;
    const f_k = F_app > 0 ? -F_app : 0; // Perfect balance
    drawArrow(ctx, boxX + boxSize, boxY + boxSize/2, boxX + boxSize + F_app, boxY + boxSize/2, CONFIG.color.arrow, 'F_app');
    drawArrow(ctx, boxX, boxY + boxSize/2, boxX + f_k, boxY + boxSize/2, 'red', 'F_friction');
    ctx.fillStyle = 'black';
    ctx.fillText("a = 0, v = constant", w/2 - 50, 50);
  }

  function drawScene3(ctx, w, h) { // Friction & FBD
    const groundY = h - 50;
    const boxSize = 50;
    const boxY = groundY - boxSize;
    const boxX = w / 2 - boxSize / 2;

    ctx.fillStyle = CONFIG.color.ground;
    ctx.fillRect(0, groundY, w, 50);
    ctx.fillStyle = CONFIG.color.block;
    ctx.fillRect(boxX, boxY, boxSize, boxSize);

    const { N, f_k } = calculatePhysics(state);
    const F_g = state.mass * CONFIG.gravity;
    const midX = boxX + boxSize / 2, midY = boxY + boxSize / 2;

    drawArrow(ctx, midX, midY, midX, midY + F_g, 'black', 'mg');
    drawArrow(ctx, midX, midY, midX, midY - N, 'orange', 'N');
    drawArrow(ctx, midX, midY, midX + state.F_net, midY, CONFIG.color.arrow, 'F_app');
    if (Math.abs(f_k) > 0) {
      drawArrow(ctx, midX, midY, midX + f_k, midY, 'red', 'f_k');
    }
  }

  function drawScene4(ctx, w, h) { // Inclined Plane
      const theta = state.angle * Math.PI / 180;
      const plane_len = w * 0.8;
      const plane_h = plane_len * Math.sin(theta);
      const plane_w = plane_len * Math.cos(theta);
      const startX = (w - plane_w) / 2, startY = h - 50;

      ctx.save();
      ctx.translate(startX, startY);
      ctx.rotate(-theta);

      const boxSize = 40;
      const boxX = state.x, boxY = -boxSize;

      ctx.fillStyle = CONFIG.color.ground;
      ctx.fillRect(0, 0, plane_len, 10);
      ctx.fillStyle = CONFIG.color.block;
      ctx.fillRect(boxX, boxY, boxSize, boxSize);

      // FBD on incline
      const { N, f_k, F_parallel } = calculatePhysics(state);
      const midX = boxX + boxSize/2, midY = boxY + boxSize/2;
      drawArrow(ctx, midX, midY, midX, midY + state.mass * CONFIG.gravity, 'black', 'mg');
      drawArrow(ctx, midX, midY, midX - F_parallel, midY, 'purple', 'mg sinθ');
      drawArrow(ctx, midX, midY, midX, midY - N, 'orange', 'N');
      if (Math.abs(f_k) > 0) drawArrow(ctx, midX, midY, midX + f_k, midY, 'red', 'f_k');

      ctx.restore();
  }

  function drawScene5(ctx, w, h) { // Work, Energy, Momentum
      const groundY = h-50;
      const boxSize=50;
      const boxY = groundY-boxSize;
      const boxX = 50 + state.x;

      ctx.fillStyle = CONFIG.color.ground;
      ctx.fillRect(0,groundY,w,50);
      ctx.fillStyle = CONFIG.color.block;
      ctx.fillRect(boxX, boxY, boxSize, boxSize);

      // Bar graphs
      const KE = 0.5 * state.mass * state.v * state.v;
      const p = state.mass * state.v;
      ctx.fillStyle = 'green';
      ctx.fillRect(20, h - 80 - KE, 30, KE);
      ctx.fillStyle = 'blue';
      ctx.fillRect(70, h - 80 - p, 30, p);
      ctx.fillStyle = 'black';
      ctx.fillText("KE", 25, h - 60);
      ctx.fillText("p", 75, h-60);
  }

  function getDrawFn(scene) {
    return { 1: drawScene1, 2: drawScene2, 3: drawScene3, 4: drawScene4, 5: drawScene5 }[scene];
  }

  /* ---------- SIM LOOP & CONTROL ---------- */
  let raf;
  function step() {
      const dt = 1/60;
      const phys = calculatePhysics(state);
      state.a = phys.a;
      state.v += state.a * dt;
      state.x += state.v * dt;
      state.workDone += phys.F_net * state.v * dt;
      state.history.push({ t: state.time, v: state.v });
      if (state.history.length > 300) state.history.shift();

      // Stop if slow
      if (Math.abs(state.v) < 0.01 && Math.abs(state.a) < 0.01) {
        state.v = 0;
        state.a = 0;
      }

      const canvas = els.stage.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width/dpr, h = canvas.height/dpr;

      ctx.clearRect(0,0,w*dpr,h*dpr);
      ctx.save();
      ctx.scale(dpr, dpr);
      getDrawFn(state.scene)(ctx, w, h);
      ctx.restore();

      updateReadouts();
      if(state.running) raf = requestAnimationFrame(step);
  }

  function renderScene() {
      if (raf) cancelAnimationFrame(raf);

      let canvas = els.stage.querySelector('canvas');
      if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.style.width='100%';
          canvas.style.height='320px';
          els.stage.appendChild(canvas);
      }
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);
      getDrawFn(state.scene)(ctx, rect.width, rect.height);
      ctx.restore();

      renderTabContent();
      updateReadouts();
  }

  function reset() {
    state.running = false;
    state.time = state.v = state.x = state.a = state.workDone = 0;
    state.history = [];
    els.btnRun.disabled = false;
    els.btnPause.disabled = true;
    renderScene();
  }
  
  function wireInputs() {
    els.inpTemp.addEventListener('input', e => { state.F_net = parseFloat(e.target.value); renderScene(); });
    els.inpArea.addEventListener('input', e => { state.mass = parseFloat(e.target.value); renderScene(); });
    els.inpHumidity.addEventListener('input', e => { state.mu = mapFriction(e.target.value); renderScene(); });
    els.inpWind.addEventListener('input', e => { state.angle = parseFloat(e.target.value); renderScene(); });

    els.btnRun.addEventListener('click', () => {
      state.running = true;
      els.btnRun.disabled = true;
      els.btnPause.disabled = false;
      step();
    });

    els.btnPause.addEventListener('click', () => {
      state.running = false;
      els.btnRun.disabled = false;
      els.btnPause.disabled = true;
    });

    els.btnReset.addEventListener('click', reset);

    document.querySelectorAll('.scene-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelector('.scene-btn.active').classList.remove('active');
        const target = e.target.closest('.scene-btn');
        target.classList.add('active');
        state.scene = parseInt(target.dataset.scene);
        reset();
      });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelector('.tab-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderTabContent();
        });
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    wireInputs();
    renderLabGuides();
    reset();
    window.addEventListener('resize', renderScene);
  }

  init();
})();
