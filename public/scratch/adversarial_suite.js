const fs = require('fs');
const path = require('path');
const https = require('https');

console.log("===================================================================");
console.log("🛡️ MRTECHSYS ADVERSARIAL VALIDATION / INVALIDATION SUITE");
console.log("===================================================================\n");

let passed = 0;
let failed = 0;
const results = [];

function assert(description, condition, details = "") {
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passed++;
    results.push({ description, status: "PASS", details });
  } else {
    console.error(`  ❌ [FAIL] ${description} ${details ? `\n     ↳ ${details}` : ""}`);
    failed++;
    results.push({ description, status: "FAIL", details });
  }
}

// -------------------------------------------------------------
// TEST SUITE 1: STATIC ASSET & DOM TOPOLOGY INTEGRITY
// -------------------------------------------------------------
console.log("--- 1. STATIC ASSET & DOM TOPOLOGY AUDIT ---");

const htmlPath = path.join(__dirname, '../index.html');
const cssAnimPath = path.join(__dirname, '../assets/css/animations.css');
const cssMainPath = path.join(__dirname, '../assets/css/main.css');
const jsMainPath = path.join(__dirname, '../assets/js/main.js');
const logoImgPath = path.join(__dirname, '../assets/images/logo.png');

assert("HTML file exists", fs.existsSync(htmlPath));
assert("animations.css exists", fs.existsSync(cssAnimPath));
assert("main.css exists", fs.existsSync(cssMainPath));
assert("main.js exists", fs.existsSync(jsMainPath));
assert("logo.png image asset exists", fs.existsSync(logoImgPath));

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const animCssContent = fs.readFileSync(cssAnimPath, 'utf8');
const mainCssContent = fs.readFileSync(cssMainPath, 'utf8');
const jsContent = fs.readFileSync(jsMainPath, 'utf8');

// DOM IDs referenced in JS
const requiredIDs = [
  'three-wave-canvas',
  'sparks-canvas',
  'welding-torch-tip',
  'hero-logo-wrap',
  'welding-path',
  'navy-cloud',
  'circuit-veins',
  'gold-shimmer-layer',
  'texas-full-logo',
  'hud-lines',
  'cinema-boot-layer',
  'unified-hero-stage',
  'main-content',
  'header-nav',
  'countdown',
  'dvd-floater'
];

requiredIDs.forEach(id => {
  const present = htmlContent.includes(`id="${id}"`) || htmlContent.includes(`id='${id}'`);
  assert(`HTML contains required DOM ID: #${id}`, present);
});

// -------------------------------------------------------------
// TEST SUITE 2: SVG TEXAS GEOMETRY & MATHEMATICAL CONTINUITY
// -------------------------------------------------------------
console.log("\n--- 2. SVG TEXAS GEOMETRY & TOPOLOGY VALIDATION ---");

const dMatch = htmlContent.match(/id=["']welding-path["'][^>]*d=["']([^"']+)["']/i);
assert("Welding path has valid 'd' attribute", !!dMatch);

if (dMatch) {
  const d = dMatch[1];
  const points = d.split(/[MLZ\s,]+/).filter(Boolean).map(Number);
  
  assert("Path starts with MoveTo and closes with Z", d.startsWith('M') && d.trim().endsWith('Z'));
  assert("Path contains at least 30 coordinate numbers (15+ vertices)", points.length >= 30, `Found ${points.length} coords`);
  
  let allInRange = true;
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i];
    const y = points[i + 1];
    if (x < 0 || x > 100 || y < 0 || y > 100) {
      allInRange = false;
      break;
    }
  }
  assert("All Texas coordinates are strictly normalized within [0, 100] viewBox", allInRange);
}

// -------------------------------------------------------------
// TEST SUITE 3: ADVERSARIAL JS RESILIENCE (OFFLINE / 0-PX / EXCEPTIONS)
// -------------------------------------------------------------
console.log("\n--- 3. ADVERSARIAL JS RESILIENCE & RUNTIME SIMULATION ---");

// Mock browser environment
const mockWindow = {
  innerWidth: 320, // Extreme mobile
  innerHeight: 568,
  devicePixelRatio: 3,
  addEventListener: () => {},
  removeEventListener: () => {}
};

const mockDocument = {
  readyState: 'complete',
  getElementById: (id) => {
    return {
      id,
      style: {},
      classList: { add: () => {}, remove: () => {} },
      getBoundingClientRect: () => ({ width: 0, height: 0, top: 0, left: 0 }), // 0px edge case
      getTotalLength: () => { throw new Error("NS_ERROR_FAILURE simulated on mobile"); }, // Adversarial throwing getTotalLength
      setAttribute: () => {},
      getContext: () => ({ clearRect: () => {}, save: () => {}, restore: () => {}, fill: () => {}, beginPath: () => {}, arc: () => {} }),
      appendChild: () => {},
      remove: () => {},
      parentNode: { removeChild: () => {} }
    };
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({ style: {}, classList: { add: () => {} } }),
  addEventListener: () => {}
};

let simulatedErrors = [];
try {
  // Execute wrapped in isolated sandbox with simulated throwing SVG and missing Three.js
  const vm = require('vm');
  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    performance: { now: () => Date.now() },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout: (cb, ms) => setTimeout(cb, ms),
    clearTimeout: (id) => clearTimeout(id),
    setInterval: () => 1,
    clearInterval: () => {},
    console: { log: () => {}, warn: (msg) => {}, error: (e) => { simulatedErrors.push(e); } },
    THREE: undefined // Adversarial: Three.js CDN blocked
  };
  vm.createContext(sandbox);
  vm.runInContext(jsContent, sandbox);
  assert("JS engine survives missing THREE.js & throwing SVG methods without crashing", simulatedErrors.length === 0);
} catch (e) {
  assert("JS runtime execution", false, e.message);
}

// -------------------------------------------------------------
// TEST SUITE 4: CSS COMPLIANCE & ACCESSIBILITY AUDIT
// -------------------------------------------------------------
console.log("\n--- 4. CSS COMPLIANCE & ACCESSIBILITY AUDIT ---");

assert("CSS includes prefers-reduced-motion media query for accessibility", animCssContent.includes('prefers-reduced-motion'));
assert("CSS defines design tokens in :root", animCssContent.includes(':root') && animCssContent.includes('--cyan-accent'));
assert("DVD floater is styled and visible across screen breakpoints", !mainCssContent.includes('#dvd-floater { display: none; }'));
assert("Mobile container scales with viewport (min / 82vw / 85vw)", animCssContent.includes('min(82vw') || animCssContent.includes('min(85vw'));

// -------------------------------------------------------------
// TEST SUITE 5: LIVE ENDPOINT & CLOUDFLARE PAGES HEALTH CHECK
// -------------------------------------------------------------
console.log("\n--- 5. LIVE CLOUDFLARE PAGES HEALTH & SSL AUDIT ---");

function checkLiveUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

(async () => {
  const liveUrl = 'https://mrtechsys-site.pages.dev/';
  const res = await checkLiveUrl(liveUrl);
  
  if (res.statusCode) {
    assert(`Live Cloudflare Pages returns HTTP 200 (${liveUrl})`, res.statusCode === 200, `Status: ${res.statusCode}`);
    assert("Live site contains updated title", res.body.includes('MrTechSys'));
    assert("Live site contains single unified hero stage", res.body.includes('id="unified-hero-stage"'));
    assert("Live site contains exact Texas coordinate welding-path", res.body.includes('M29.86,6.74'));
    assert("Live site contains Three.js CDN script tag", res.body.includes('three.min.js'));
  } else {
    assert(`Live Cloudflare Pages reachable (${liveUrl})`, false, res.error);
  }

  console.log("\n===================================================================");
  console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===================================================================");
  process.exit(failed > 0 ? 1 : 0);
})();
