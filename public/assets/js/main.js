/* ==========================================================================
   MRTECHSYS 21ST-CENTURY CINEMATIC AI BOOT ENGINE (v17.0 Masterpiece)
   Gleaming 3D Voxel Matrix ➔ Traced Texas Weld ➔ Traced Letter-by-Letter Weld ➔ Sweeping Flash
   ========================================================================== */

(function () {
  'use strict';

  // Safe SVG path length helper
  function safeGetTotalLength(el, fallback = 2750) {
    try {
      if (el && typeof el.getTotalLength === 'function') {
        const len = el.getTotalLength();
        if (len && !isNaN(len) && len > 0) return len;
      }
    } catch (e) {
      console.warn('[SVG Path Warning]', e);
    }
    return fallback;
  }

  // -------------------------------------------------------------
  // 1. BRILLIANT 3D VOXEL MATRIX (Brilliant 24k Gold & Obsidian Columns)
  // -------------------------------------------------------------
  let scene, camera, renderer, blockGroup;
  const blocks = [];
  const GRID_SIZE = window.innerWidth < 768 ? 14 : 18;
  const SPACING = 1.3;
  const threeCanvas = document.getElementById('three-wave-canvas');
  let animationId = null;
  let isWaveActive = true;
  let waveTime = 0;

  function initThreeWave() {
    if (!threeCanvas || typeof THREE === 'undefined') return;

    try {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050505, 0.032);

      const width = window.innerWidth;
      const height = window.innerHeight;

      camera = new THREE.PerspectiveCamera(width < 768 ? 58 : 45, width / height, 0.1, 1000);
      camera.position.set(0, width < 768 ? 20 : 18, width < 768 ? 26 : 24);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({
        canvas: threeCanvas,
        antialias: window.innerWidth >= 768,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

      // Symmetrical Brilliant 24k Gold Lighting (High Lustre)
      const ambientLight = new THREE.AmbientLight(0x40404c, 2.2);
      scene.add(ambientLight);

      const goldLightLeft = new THREE.PointLight(0xffd700, 5.5, 65);
      goldLightLeft.position.set(-10, 12, 8);
      scene.add(goldLightLeft);

      const goldLightRight = new THREE.PointLight(0xffd700, 5.5, 65);
      goldLightRight.position.set(10, 12, 8);
      scene.add(goldLightRight);

      // Geometry & Multi-Materials (Matte Obsidian + Gleaming 24k Gold Top Plate)
      const boxGeometry = new THREE.BoxGeometry(0.98, 2.6, 0.98);
      const obsidianMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0e,
        roughness: 0.6,
        metalness: 0.4
      });
      const goldTopMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.18,
        metalness: 0.96,
        emissive: 0xd4af37,
        emissiveIntensity: 0.45
      });

      const materials = [
        obsidianMaterial,
        obsidianMaterial,
        goldTopMaterial,
        obsidianMaterial,
        obsidianMaterial,
        obsidianMaterial
      ];

      blockGroup = new THREE.Group();
      const halfGrid = (GRID_SIZE * SPACING) / 2;

      for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          const mesh = new THREE.Mesh(boxGeometry, materials);
          const posX = x * SPACING - halfGrid;
          const posZ = z * SPACING - halfGrid;
          mesh.position.set(posX, 0, posZ);

          mesh.userData = {
            baseX: posX,
            baseZ: posZ,
            phase: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 0.9,
            noiseFreq: 0.35 + Math.random() * 0.25,
            heightScale: 1.5 + Math.random() * 1.0
          };
          blockGroup.add(mesh);
          blocks.push(mesh);
        }
      }

      blockGroup.rotation.x = 0.14;
      blockGroup.rotation.y = -Math.PI / 4;
      scene.add(blockGroup);

      window.addEventListener('resize', onWindowResize, false);
      animateWave();
    } catch (e) {
      console.warn('[Three.js Init Bypass]', e);
    }
  }

  function onWindowResize() {
    if (camera && renderer) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.fov = width < 768 ? 58 : 45;
      camera.position.set(0, width < 768 ? 20 : 18, width < 768 ? 26 : 24);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    resizeSparksCanvas();
  }

  function animateWave() {
    if (!isWaveActive) return;
    animationId = requestAnimationFrame(animateWave);
    waveTime += 0.035;

    const blockCount = blocks.length;
    for (let i = 0; i < blockCount; i++) {
      const b = blocks[i];
      const ud = b.userData;

      const noiseY =
        Math.sin(ud.phase + waveTime * ud.speed) * ud.heightScale +
        Math.cos(ud.baseX * ud.noiseFreq + waveTime * 0.75) * 0.75 +
        Math.sin(ud.baseZ * ud.noiseFreq + waveTime * 0.85) * 0.75;

      b.position.y = noiseY;
      b.scale.y = 1 + (noiseY + 2.2) * 0.32;
    }

    if (blockGroup) {
      blockGroup.rotation.y = -Math.PI / 4 + Math.sin(waveTime * 0.15) * 0.04;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // -------------------------------------------------------------
  // 2. ULTRA-LIGHTWEIGHT PINPOINT WHITE WELDING SPARKS
  // -------------------------------------------------------------
  const sparksCanvas = document.getElementById('sparks-canvas');
  let sparksCtx = null;
  const particles = [];
  let isWeldingActive = false;
  const weldingTorchTip = document.getElementById('welding-torch-tip');
  const heroLogoWrap = document.getElementById('hero-logo-wrap');

  function resizeSparksCanvas() {
    if (!sparksCanvas || !heroLogoWrap) return;
    const rect = heroLogoWrap.getBoundingClientRect();
    const w = rect.width || Math.min(window.innerWidth * 0.86, 340);
    const h = rect.height || Math.min(window.innerWidth * 0.86, 340);
    sparksCanvas.width = w;
    sparksCanvas.height = h;
    sparksCtx = sparksCanvas.getContext('2d');
  }

  function spawnWeldingSparks(x, y, count = 1) {
    if (!sparksCtx) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        size: Math.random() * 1.2 + 0.7,
        color: '#ffffff',
        life: 1.0,
        decay: Math.random() * 0.05 + 0.035
      });
    }
  }

  function updateAndDrawSparks() {
    if (!sparksCtx || !sparksCanvas) return;
    sparksCtx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.vx *= 0.93;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      sparksCtx.globalAlpha = p.life;
      sparksCtx.fillStyle = '#ffffff';
      sparksCtx.beginPath();
      sparksCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      sparksCtx.fill();
    }

    if (isWeldingActive || particles.length > 0) {
      requestAnimationFrame(updateAndDrawSparks);
    }
  }

  // -------------------------------------------------------------
  // 3. GROUND-TRUTH LETTER-BY-LETTER DIRECT LOGO LASER WELD
  // -------------------------------------------------------------
  function runFullLogoForgeSequence() {
    const perimeterMask = document.getElementById('forge-perimeter-mask');
    const heroLogoWrap = document.getElementById('hero-logo-wrap');
    if (!perimeterMask || !heroLogoWrap) return;

    const letterIds = [
      'stroke-M', 'stroke-r', 'stroke-dot',
      'stroke-T', 'stroke-E', 'stroke-C', 'stroke-H', 'stroke-S1', 'stroke-Y', 'stroke-S2',
      'stroke-Star',
      'stroke-c', 'stroke-o', 'stroke-m'
    ];

    const stages = [
      { el: perimeterMask, duration: 2500, len: safeGetTotalLength(perimeterMask, 2750) }
    ];

    letterIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const len = safeGetTotalLength(el, 300);
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
        stages.push({ el, duration: id.includes('Star') ? 450 : 250, len });
      }
    });

    resizeSparksCanvas();
    isWeldingActive = true;
    updateAndDrawSparks();

    let currentStageIndex = 0;
    let stageStartTime = performance.now();

    function stepForge(now) {
      if (currentStageIndex >= stages.length) {
        isWeldingActive = false;
        if (weldingTorchTip) weldingTorchTip.style.opacity = '0';
        return;
      }

      const stage = stages[currentStageIndex];
      const elapsed = now - stageStartTime;
      const progress = Math.min(elapsed / stage.duration, 1);
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
      const currentLength = easeProgress * stage.len;

      if (stage.el) {
        stage.el.style.strokeDashoffset = stage.len - currentLength;
        try {
          const point = stage.el.getPointAtLength(currentLength);
          const containerRect = heroLogoWrap.getBoundingClientRect();
          const cWidth = containerRect.width || Math.min(window.innerWidth * 0.86, 340);
          const cHeight = containerRect.height || Math.min(window.innerWidth * 0.86, 340);

          const localX = (point.x / 1024) * cWidth;
          const localY = (point.y / 1024) * cHeight;

          if (weldingTorchTip) {
            weldingTorchTip.style.transform = `translate3d(${localX}px, ${localY}px, 0)`;
            weldingTorchTip.style.opacity = '1';
          }

          if (Math.random() > 0.4) {
            spawnWeldingSparks(localX, localY, 1);
          }
        } catch (e) {
          console.warn('[Forge Stage Error]', e);
        }
      }

      if (progress < 1) {
        requestAnimationFrame(stepForge);
      } else {
        currentStageIndex++;
        stageStartTime = performance.now();
        requestAnimationFrame(stepForge);
      }
    }

    requestAnimationFrame(stepForge);
  }

  // -------------------------------------------------------------
  // 4. ORIGINAL CYBER TELEMETRY HUD LOGS (Restored)
  // -------------------------------------------------------------
  const hudLinesContainer = document.getElementById('hud-lines');
  const telemetryLogs = [
    { time: 500, text: "> DUAL DETERMINISTIC AI ENGINE: REVVED UP" },
    { time: 1400, text: "> RAG VECTOR EMBEDDINGS: PREPPED" },
    { time: 2200, text: "> LASER WELDING TEXAS HOLOGRAPHIC GEOMETRY..." },
    { time: 3800, text: "> ENTERPRISE CAPABILITIES ORBITAL DISPATCH: ACTIVE" },
    { time: 5200, text: "> GOLD CIRCUITS & DATA PACKETS: ROUTING [AUSTIN ⇄ SA]" },
    { time: 6600, text: "> UPSIDE-DOWN ICED CARAMEL MACCHIATO W/ EXTRA SHOT: CHECK! ☕" },
    { time: 7800, text: ">> MRTECHSYS NEURAL GRID: INITIALIZATION COMPLETE <<" }
  ];

  function startTelemetryHUD() {
    if (!hudLinesContainer) return;
    hudLinesContainer.innerHTML = '';

    telemetryLogs.forEach((item) => {
      setTimeout(() => {
        const lineEl = document.createElement('div');
        lineEl.className = 'hud-line';
        lineEl.innerHTML = item.text;
        hudLinesContainer.appendChild(lineEl);
        hudLinesContainer.scrollTop = hudLinesContainer.scrollHeight;
      }, item.time);
    });
  }

  // -------------------------------------------------------------
  // 5. MASTER TIMELINE WITH GUARANTEED LIFTOFF TRANSITION
  // -------------------------------------------------------------
  const bootLayer = document.getElementById('cinema-boot-layer');
  const unifiedStage = document.getElementById('unified-hero-stage');
  const mainContent = document.getElementById('main-content');
  const headerNav = document.getElementById('header-nav');

  function startCinematicTimeline() {
    resizeSparksCanvas();
    initThreeWave();
    startTelemetryHUD();

    // 1.6s: Start Full Sequential Logo Forge
    setTimeout(() => {
      if (unifiedStage) {
        unifiedStage.classList.add('active');
        runFullLogoForgeSequence();
      }
    }, 1600);

    // 8.8s: Guaranteed Cross-Dissolve into Landing Page
    setTimeout(() => {
      if (bootLayer) {
        bootLayer.classList.add('dissolve-out');
      }
      if (mainContent) {
        mainContent.classList.add('revealed');
      }
      if (headerNav) {
        headerNav.classList.add('revealed');
      }
    }, 8800);

    // 10.0s: Cleanup WebGL & Remove Boot Layer from DOM
    setTimeout(() => {
      isWaveActive = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (bootLayer && bootLayer.parentNode) {
        bootLayer.remove();
      }
    }, 10000);
  }

  // -------------------------------------------------------------
  // 6. UNDER-CONSTRUCTION HUB SCRIPTS & BOUNCING PANEL
  // -------------------------------------------------------------
  function initLandingScripts() {
    // Countdown Timer
    const countdownEl = document.getElementById('countdown');
    const launchTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    function updateCountdown() {
      if (!countdownEl) return;
      const now = new Date().getTime();
      const distance = launchTime - now;

      if (distance < 0) {
        countdownEl.innerHTML = "🚀 System Liftoff Online!";
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownEl.innerHTML = `Launching in: ${hours.toString().padStart(2, '0')}h ${minutes
        .toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // DVD Floating Bounce Panel (Active on all screens with GPU acceleration)
    const floater = document.getElementById('dvd-floater');
    let vx = 1.4;
    let vy = 1.4;
    let posX = 20;
    let posY = 80;

    function moveFloater() {
      if (!floater) return;
      const floaterRect = floater.getBoundingClientRect();
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      if (posX + floaterRect.width >= winW - 12 || posX <= 12) vx = -vx;
      if (posY + floaterRect.height >= winH - 12 || posY <= 60) vy = -vy;

      posX += vx;
      posY += vy;

      floater.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;

      requestAnimationFrame(moveFloater);
    }

    requestAnimationFrame(moveFloater);
  }

  // Guaranteed Execution Entry Point
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startCinematicTimeline();
    initLandingScripts();
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      startCinematicTimeline();
      initLandingScripts();
    });
  }
})();
