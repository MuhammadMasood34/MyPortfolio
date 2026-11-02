/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ───────────── helpers ───────────── */
const M = (color, o = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15, ...o });
const RB = (w, h, d, r = 0.015) =>
  new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const add = (p, g, m, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true;
  p.add(o);
  return o;
};
const UP = new THREE.Vector3(0, 1, 0);
const limb = (parent, mat, t) => {
  const m = add(parent, new THREE.CylinderGeometry(0.5, 0.5, 1, 12), mat);
  const c1 = add(parent, new THREE.SphereGeometry(0.5, 12, 8), mat), c2 = add(parent, new THREE.SphereGeometry(0.5, 12, 8), mat);
  c1.scale.setScalar(t); c2.scale.setScalar(t);
  return (a, b) => {
    const d = b.clone().sub(a), L = d.length();
    m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(t, L, t);
    m.quaternion.setFromUnitVectors(UP, d.normalize()); c1.position.copy(a); c2.position.copy(b);
  };
};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = (x) => x * x * (3 - 2 * x);
const tex = (w, h, fn) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

/* ───────────── screen content ───────────── */
const CODE = `import { useState, useEffect } from "react";

// dev.station — live preview
export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <Grid items={data} columns={3} />
  );
}`.split("\n");
const RX = /(\/\/.*|"[^"]*"|\b(?:import|from|export|default|function|const|return)\b|\b(?:useState|useEffect|fetch)\b|\b\d+\b|<\/?[A-Z]\w*|=>|\w+|\s+|.)/g;
const TOK = CODE.map((l) => l.match(RX) || []);
const TOTAL = CODE.reduce((a, l) => a + l.length + 1, 0);
const tokColor = (t) =>
  t.startsWith("//") ? "#6e7681"
  : t[0] === '"' ? "#a5d6ff"
  : /^(import|from|export|default|function|const|return|=>)$/.test(t) ? "#ff7b72"
  : /^(useState|useEffect|fetch)$/.test(t) ? "#d2a8ff"
  : /^\d+$/.test(t) ? "#79c0ff"
  : t[0] === "<" ? "#7ee787" : "#e6edf3";

function drawIDE(ctx, W, H, t) {
  ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#161b22"; ctx.fillRect(0, 0, W, 30);
  ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(18 + i * 20, 15, 6, 0, 7); ctx.fill(); });
  ctx.font = "13px monospace"; ctx.fillStyle = "#8b949e"; ctx.textAlign = "center";
  ctx.fillText("Dashboard.jsx — dev-station — Visual Studio Code", W / 2, 20); ctx.textAlign = "left";
  ctx.fillStyle = "#010409"; ctx.fillRect(0, 30, 48, H - 60);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i ? "#30363d" : "#00e08a"; ctx.fillRect(14, 54 + i * 48, 20, 20); }
  ctx.fillStyle = "#0b0f14"; ctx.fillRect(48, 30, 230, H - 60);
  ctx.fillStyle = "#8b949e"; ctx.font = "12px monospace"; ctx.fillText("EXPLORER", 64, 54);
  ["▾ src", "   Dashboard.jsx", "   DevStation.jsx", "   api.js", "   index.css", "▸ public", "   package.json"].forEach((f, i) => {
    if (i === 1) { ctx.fillStyle = "#1f2a24"; ctx.fillRect(48, 68 + i * 24, 230, 24); }
    ctx.fillStyle = i === 1 ? "#00e08a" : "#c9d1d9"; ctx.font = "14px monospace"; ctx.fillText(f, 64, 85 + i * 24);
  });
  ctx.fillStyle = "#161b22"; ctx.fillRect(278, 30, W - 278, 32);
  ctx.fillStyle = "#0d1117"; ctx.fillRect(278, 30, 170, 32);
  ctx.fillStyle = "#00e08a"; ctx.fillRect(278, 30, 170, 2);
  ctx.fillStyle = "#e6edf3"; ctx.font = "14px monospace"; ctx.fillText("⚛ Dashboard.jsx", 292, 51);
  ctx.fillStyle = "#6e7681"; ctx.fillText("api.js", 470, 51);
  const shown = Math.min(Math.floor(t * 26) % (TOTAL + 70), TOTAL);
  const cw = 9, ox = 340;
  let left = shown, cx = ox, cy = 0;
  ctx.font = "15px monospace";
  for (let i = 0; i < TOK.length; i++) {
    const y = 90 + i * 22;
    ctx.fillStyle = "#484f58"; ctx.fillText(String(i + 1).padStart(2, " "), 300, y);
    let x = ox; cx = ox; cy = y;
    for (const tk of TOK[i]) {
      const n = Math.min(tk.length, left);
      if (n > 0) { ctx.fillStyle = tokColor(tk); ctx.fillText(tk.slice(0, n), x, y); x += n * cw; cx = x; }
      left -= n; if (left <= 0) break;
    }
    left -= 1; if (left < 0) break;
  }
  if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = "#00e08a"; ctx.fillRect(cx, cy - 15, 2, 19); }
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(139,148,158,${0.12 + ((i * 7) % 5) * 0.04})`; ctx.fillRect(W - 92, 70 + i * 8, 20 + ((i * 37) % 60), 3); }
  ctx.fillStyle = "#0a0e13"; ctx.fillRect(48, 480, W - 48, H - 510);
  ctx.fillStyle = "#8b949e"; ctx.font = "12px monospace"; ctx.fillText("PROBLEMS     OUTPUT     TERMINAL", 64, 500);
  const n = Math.floor(t * 1.4);
  const L = ["$ npm run dev", "  VITE v5.4 ready in 312 ms", "  ➜  Local:   http://localhost:5173/"];
  for (let i = 0; i < 4; i++) L.push(`  [hmr] updated /src/Dashboard.jsx (${n - 3 + i > 0 ? n - 3 + i : 1})`);
  L.forEach((l, i) => { ctx.fillStyle = i === 0 ? "#00e08a" : i > 2 ? "#79c0ff" : "#c9d1d9"; ctx.font = "14px monospace"; ctx.fillText(l, 64, 524 + i * 20); });
  ctx.fillStyle = "#0b6b4a"; ctx.fillRect(0, H - 30, W, 30);
  ctx.fillStyle = "#e6fff4"; ctx.font = "13px monospace";
  ctx.fillText("⎇ main   ✓ 0  ⚠ 0        Ln 12, Col 8     UTF-8     JavaScript React     Prettier ✓", 14, H - 10);
}

function drawLogs(ctx, W, H, t) {
  ctx.fillStyle = "#070b0f"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#00e08a"; ctx.font = "bold 22px monospace"; ctx.fillText("● SYSTEM MONITOR", 24, 44);
  for (let i = 0; i < 8; i++) {
    const v = 0.4 + 0.28 * Math.sin(t * 1.3 + i) + 0.14 * Math.sin(t * 3.1 + i * 2);
    ctx.fillStyle = "#12202a"; ctx.fillRect(24, 80 + i * 34, W - 48, 18);
    ctx.fillStyle = v > 0.72 ? "#ffbd2e" : "#00e08a"; ctx.fillRect(24, 80 + i * 34, (W - 48) * Math.min(v, 1), 18);
  }
  ctx.strokeStyle = "#58a6ff"; ctx.lineWidth = 3; ctx.beginPath();
  for (let x = 0; x <= W - 48; x += 6) {
    const y = 420 - 60 * Math.sin((x + t * 80) * 0.03) - 25 * Math.sin((x + t * 50) * 0.09);
    if (x) ctx.lineTo(24 + x, y); else ctx.moveTo(24 + x, y);
  }
  ctx.stroke(); ctx.font = "17px monospace";
  const n = Math.floor(t * 2);
  for (let i = 0; i < 17; i++) {
    const k = n - 16 + i; if (k < 0) continue;
    const ok = k % 7 !== 0;
    ctx.fillStyle = ok ? "#7ee787" : "#ff7b72";
    ctx.fillText(`${ok ? 200 : 500} GET /api/v${k % 3}/items ${10 + ((k * 37) % 90)}ms`, 24, 500 + i * 26);
  }
}

const makeScreen = (W, H, draw) => {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  return { tex, update: (t) => { draw(ctx, W, H, t); tex.needsUpdate = true; } };
};

/* ───────────── component ───────────── */
export default function DevStation() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1a15);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(2.4, 1.9, 3.0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.1, 0.1);
    controls.enableDamping = true; controls.minDistance = 1.6; controls.maxDistance = 5.2;
    controls.maxPolarAngle = Math.PI * 0.49;
    /* keep the camera inside the small office so walls are always visible */
    const camMin = V(-3.0, 0.35, -1.3), camMax = V(3.0, 2.8, 3.1);

    /* lights */
    scene.add(new THREE.HemisphereLight(0xeafff6, 0x3a4a44, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(2, 5, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 14 });
    key.shadow.bias = -0.0005; scene.add(key);
    const screenLight = new THREE.PointLight(0x58a6ff, 4, 4, 2); screenLight.position.set(-0.1, 1.4, 0.55); scene.add(screenLight);
    [[0, 0.4], [-1.9, 1.6], [1.9, 1.6], [0, 2.4]].forEach(([x, z]) => {
      const l = new THREE.PointLight(0xfff1dc, 5, 7, 2); l.position.set(x, 2.8, z); scene.add(l);
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.5), new THREE.MeshBasicMaterial({ color: 0xfffbf0 }));
      p.position.set(x, 2.97, z); scene.add(p);
    });

    /* ───── office room: fully enclosed (4 walls + ceiling + floor), walls face inward ───── */
    const wallP = (w, h, col, x, y, z, ry) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M(col, { roughness: 0.9, metalness: 0 }));
      m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; scene.add(m); return m;
    };
    wallP(6.4, 3, 0x1b5446, 0, 1.5, -1.5, 0);                    // back (accent)
    wallP(4.7, 3, 0xd5e0db, -3.2, 1.5, 0.85, Math.PI / 2);       // left
    wallP(4.7, 3, 0xd5e0db, 3.2, 1.5, 0.85, -Math.PI / 2);       // right
    wallP(6.4, 3, 0xcfdad5, 0, 1.5, 3.2, Math.PI);               // front
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.7), M(0xe9efec, { roughness: 1, metalness: 0 }));
    ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3, 0.85); scene.add(ceil);
    const wood = tex(512, 512, (g, w) => {
      for (let i = 0; i < 8; i++) {
        g.fillStyle = `hsl(28,${32 + (i % 3) * 4}%,${34 + ((i * 7) % 9)}%)`; g.fillRect(0, i * 64, w, 64);
        g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, i * 64, w, 2);
        for (let j = 0; j < 3; j++) g.fillRect((i * 173 + j * 211) % w, i * 64, 2, 64);
      }
    });
    wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(3, 2.4);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.7), M(0xffffff, { map: wood, roughness: 0.6 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0.85); floor.receiveShadow = true; scene.add(floor);
    const trim = M(0xeef2f0);
    add(scene, new THREE.BoxGeometry(6.4, 0.1, 0.02), trim, 0, 0.05, -1.49);
    add(scene, new THREE.BoxGeometry(0.02, 0.1, 4.7), trim, -3.19, 0.05, 0.85);
    add(scene, new THREE.BoxGeometry(0.02, 0.1, 4.7), trim, 3.19, 0.05, 0.85);
    add(scene, new THREE.BoxGeometry(6.4, 0.1, 0.02), trim, 0, 0.05, 3.19);
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), M(0x1d3d34, { roughness: 1 }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.006, 0.9); rug.receiveShadow = true; scene.add(rug);

    const nc = tex(512, 200, (g) => {
      g.font = "bold 110px monospace"; g.textAlign = "center"; g.fillStyle = "#00ffa3"; g.shadowColor = "#00ffa3"; g.shadowBlur = 30; g.fillText("</dev>", 256, 130);
    });
    const neon = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.66), new THREE.MeshBasicMaterial({ map: nc, transparent: true, toneMapped: false }));
    neon.position.set(-0.9, 2.15, -1.48); scene.add(neon);

    const poster = tex(256, 360, (g, w, h) => {
      g.fillStyle = "#0b1f19"; g.fillRect(0, 0, w, h); g.strokeStyle = "#00e08a"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
      g.fillStyle = "#00e08a"; g.font = "bold 54px monospace"; g.textAlign = "center"; g.fillText("{ }", w / 2, 150);
      g.font = "20px monospace"; g.fillStyle = "#cfeee1"; g.fillText("ship it.", w / 2, 215); g.fillText("// keep", w / 2, 250); g.fillText("coding", w / 2, 278);
    });
    [[-2.55, 1.8], [-2.0, 1.55]].forEach(([x, y], i) => {
      add(scene, RB(0.5, 0.68, 0.025, 0.005), M(0xe9efec), x, y, -1.485);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.62), i ? new THREE.MeshBasicMaterial({ color: 0x1f6feb }) : new THREE.MeshBasicMaterial({ map: poster }));
      p.position.set(x, y, -1.47); scene.add(p);
    });

    const rgbMat = M(0x111111, { emissive: 0x00e08a, emissiveIntensity: 1.6 });
    const rgbCol = new THREE.Color();
    const shelf = new THREE.Group(); shelf.position.set(1.3, 2.0, -1.33); scene.add(shelf);
    add(shelf, RB(2.0, 0.05, 0.3), M(0x1a2a24), 0, 0, 0);
    add(shelf, RB(2.0, 0.015, 0.02, 0.005), rgbMat, 0, -0.04, 0.12);
    [0x00a86b, 0x1f6feb, 0x8957e5, 0xd29922, 0x0f766e, 0xc9d1d9].forEach((c, i) => {
      const h = 0.22 + (i % 3) * 0.05;
      add(shelf, RB(0.06, h, 0.2, 0.01), M(c, { roughness: 0.8 }), -0.8 + i * 0.07, 0.025 + h / 2, 0);
    });

    /* window with night city + blinds (right wall) */
    const city = tex(512, 360, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0b1d3a"); gr.addColorStop(1, "#1d5b63");
      g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#e8f3ff"; g.beginPath(); g.arc(400, 70, 22, 0, 7); g.fill();
      for (let i = 0; i < 14; i++) {
        const bw = 30 + ((i * 37) % 40), bh = 90 + ((i * 53) % 170), bx = i * 38;
        g.fillStyle = "#08131f"; g.fillRect(bx, h - bh, bw, bh);
        for (let y = h - bh + 8; y < h - 8; y += 14) for (let x = bx + 5; x < bx + bw - 6; x += 11) if ((x * 7 + y * 13 + i) % 5 < 2) { g.fillStyle = "#ffd77a"; g.fillRect(x, y, 5, 7); }
      }
    });
    const win = new THREE.Group(); win.position.set(3.19, 1.75, 0.5); win.rotation.y = -Math.PI / 2; scene.add(win);
    win.add(new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.2), new THREE.MeshBasicMaterial({ map: city, toneMapped: false })));
    [[0, 0.63, 1.78, 0.06], [0, -0.63, 1.78, 0.06]].forEach(([x, y, w, h]) => add(win, RB(w, h, 0.05, 0.01), M(0xeef2f0), x, y, 0.02));
    [-0.87, 0.87].forEach((x) => add(win, RB(0.06, 1.3, 0.05, 0.01), M(0xeef2f0), x, 0, 0.02));
    add(win, RB(0.03, 1.2, 0.03, 0.005), M(0xeef2f0), 0, 0, 0.02);
    for (let i = 0; i < 9; i++) add(win, RB(1.64, 0.04, 0.02, 0.008), M(0xdfe7e3), 0, 0.55 - i * 0.07, 0.07).rotation.x = 0.5;

    /* whiteboard + clock + door (left wall) */
    const board = tex(640, 400, (g, w) => {
      g.fillStyle = "#f6f8f7"; g.fillRect(0, 0, w, 400); g.fillStyle = "#334"; g.font = "bold 24px sans-serif";
      ["TO DO", "DOING", "DONE"].forEach((c, i) => { g.fillText(c, 30 + i * 205, 40); g.fillRect(20 + i * 205, 52, 185, 3); });
      const cols = ["#ffd166", "#ff8fab", "#8ecae6", "#b8f2a8"], tx = ["fix bug #42", "ship v2", "code review", "write tests", "deploy", "refactor", "API docs", "standup", "coffee"];
      for (let i = 0; i < 9; i++) {
        g.save(); g.translate(30 + (i % 3) * 205, 75 + Math.floor(i / 3) * 105); g.rotate((((i * 37) % 7) - 3) * 0.015);
        g.fillStyle = cols[i % 4]; g.fillRect(0, 0, 150, 85); g.fillStyle = "#2b3a42"; g.font = "18px sans-serif"; g.fillText(tx[i], 12, 36); g.restore();
      }
    });
    const wb = new THREE.Group(); wb.position.set(-3.19, 1.6, 0.4); wb.rotation.y = Math.PI / 2; scene.add(wb);
    add(wb, RB(1.7, 1.1, 0.03, 0.01), M(0xcfd6d3, { metalness: 0.4 }), 0, 0, 0);
    const bp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ map: board })); bp.position.z = 0.02; wb.add(bp);
    const clock = new THREE.Group(); clock.position.set(-3.18, 2.55, 0.4); clock.rotation.y = Math.PI / 2; scene.add(clock);
    add(clock, new THREE.CylinderGeometry(0.2, 0.2, 0.03, 32), M(0xf4f6f5), 0, 0, 0).rotation.x = Math.PI / 2;
    add(clock, new THREE.TorusGeometry(0.2, 0.012, 8, 32), M(0x10161a), 0, 0, 0.015);
    const mkHand = (len, w) => { const p = new THREE.Group(); p.position.z = 0.025; clock.add(p); add(p, new THREE.BoxGeometry(w, len, 0.004), M(0x10161a), 0, len / 2, 0); return p; };
    const hHand = mkHand(0.1, 0.016), mHand = mkHand(0.15, 0.01);
    add(scene, RB(0.05, 2.0, 0.9, 0.01), M(0x7a5a3a), -3.17, 1.0, 2.4);
    add(scene, new THREE.SphereGeometry(0.04, 12, 8), M(0xc9a23a, { metalness: 0.8 }), -3.12, 1.0, 2.0);

    /* front wall decor (visible when you orbit around) */
    [[-1.6, 1.7, 0x1f6feb], [-0.9, 1.7, 0x8957e5], [1.4, 1.6, 0x00a86b]].forEach(([x, y, c], i) => {
      const f = new THREE.Group(); f.position.set(x, y, 3.18); f.rotation.y = Math.PI; scene.add(f);
      add(f, RB(0.55, 0.75, 0.03, 0.005), M(0xe9efec), 0, 0, 0);
      const art = new THREE.Mesh(new THREE.PlaneGeometry(0.47, 0.67), new THREE.MeshBasicMaterial({ color: c }));
      art.position.z = 0.02; f.add(art);
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.1 + i * 0.02, 24), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      dot.position.set(0, 0.05, 0.022); f.add(dot);
    });
    const vent = new THREE.Group(); vent.position.set(1.9, 2.7, 3.18); vent.rotation.y = Math.PI; scene.add(vent);
    add(vent, RB(0.7, 0.2, 0.03, 0.01), M(0xeef2f0), 0, 0, 0);
    for (let i = 0; i < 5; i++) add(vent, new THREE.BoxGeometry(0.62, 0.012, 0.01), M(0xaab3b0), 0, 0.07 - i * 0.03, 0.02);

    /* office furniture */
    const cab = new THREE.Group(); cab.position.set(-2.8, 0, -1.15); scene.add(cab);
    add(cab, RB(0.5, 1.0, 0.5, 0.02), M(0x7b8a86, { metalness: 0.5 }), 0, 0.5, 0);
    for (let i = 0; i < 3; i++) { add(cab, RB(0.44, 0.28, 0.01, 0.005), M(0x6a7975, { metalness: 0.5 }), 0, 0.18 + i * 0.32, 0.255); add(cab, RB(0.14, 0.02, 0.02, 0.005), M(0xdfe6e9, { metalness: 0.8 }), 0, 0.25 + i * 0.32, 0.27); }
    const cool = new THREE.Group(); cool.position.set(2.95, 0, -0.6); scene.add(cool);
    add(cool, RB(0.32, 0.95, 0.32, 0.03), M(0xf1f5f3), 0, 0.475, 0);
    add(cool, new THREE.CylinderGeometry(0.13, 0.13, 0.36, 24), new THREE.MeshPhysicalMaterial({ color: 0x4aa8ff, transparent: true, opacity: 0.55, roughness: 0.1 }), 0, 1.13, 0);
    add(cool, new THREE.BoxGeometry(0.04, 0.04, 0.05), M(0x1f6feb), -0.1, 0.8, 0.16);
    const plant = new THREE.Group(); plant.position.set(2.2, 0, -1.05); scene.add(plant);
    add(plant, new THREE.CylinderGeometry(0.16, 0.12, 0.3, 20), M(0xe9efec), 0, 0.15, 0);
    const leaves = [];
    for (let i = 0; i < 9; i++) {
      const lf = add(plant, new THREE.SphereGeometry(0.1, 12, 8), M(0x1fa86b, { roughness: 0.6 }));
      lf.scale.set(0.5, 1.8, 0.2);
      const a = (i / 9) * Math.PI * 2; lf.position.set(Math.cos(a) * 0.1, 0.5 + (i % 3) * 0.1, Math.sin(a) * 0.1);
      lf.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); leaves.push(lf);
    }
    add(scene, new THREE.CylinderGeometry(0.13, 0.1, 0.32, 20, 1, true), M(0x2a3138, { side: THREE.DoubleSide, metalness: 0.5 }), -2.2, 0.16, -1.15); // bin

    /* ───── desk ───── */
    const desk = new THREE.Group(); scene.add(desk);
    add(desk, RB(3.5, 0.07, 1.5, 0.03), M(0xb18b5f, { roughness: 0.45 }), 0, 0.75, 0);
    [-1.6, 1.6].forEach((x) => {
      add(desk, RB(0.06, 0.72, 1.2, 0.02), M(0x10161a, { metalness: 0.7 }), x, 0.36, 0);
      add(desk, RB(0.3, 0.03, 1.3, 0.01), M(0x10161a, { metalness: 0.7 }), x, 0.015, 0);
    });
    add(desk, RB(3.1, 0.12, 0.03, 0.01), M(0x10161a, { metalness: 0.7 }), 0, 0.62, -0.6);
    add(desk, RB(1.7, 0.012, 0.62, 0.005), M(0x0a1612, { roughness: 0.9 }), -0.05, 0.791, 0.28);
    add(desk, RB(1.7, 0.012, 0.012, 0.004), rgbMat, -0.05, 0.793, 0.59);

    const ide = makeScreen(1600, 680, drawIDE);
    const logs = makeScreen(540, 960, drawLogs);
    const monitorBack = M(0x15191d, { metalness: 0.6, roughness: 0.4 });
    const monitor = (w, h, scr, x, y, z, ry) => {
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; desk.add(g);
      add(g, RB(w + 0.04, h + 0.04, 0.035, 0.012), M(0x0b0f12, { metalness: 0.5 }), 0, 0, 0);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }));
      s.position.z = 0.0185; g.add(s);
      /* back of the monitor: electronics hump, vents, logo, RGB strip, I/O ports */
      add(g, RB(w * 0.62, h * 0.55, 0.03, 0.012), monitorBack, 0, 0.02, -0.032);
      for (let i = 0; i < 6; i++) add(g, new THREE.BoxGeometry(w * 0.5, 0.006, 0.004), M(0x000000), 0, 0.17 - i * 0.025 * (h / 0.72), -0.049);
      add(g, new THREE.CircleGeometry(0.03, 20), new THREE.MeshBasicMaterial({ color: 0x00e08a }), 0, -0.02, -0.0475).rotation.y = Math.PI;
      add(g, RB(w * 0.62, 0.012, 0.012, 0.004), rgbMat, 0, -h * 0.25, -0.052);
      add(g, RB(0.16, 0.03, 0.02, 0.006), M(0x050607), w * 0.2, -h / 2 + 0.035, -0.03);
      [0, 1, 2].forEach((i) => add(g, new THREE.BoxGeometry(0.03, 0.012, 0.006), M([0x1f6feb, 0x00e08a, 0xffbd2e][i], { emissive: [0x1f6feb, 0x00e08a, 0xffbd2e][i], emissiveIntensity: 0.4 }), w * 0.2 - 0.05 + i * 0.05, -h / 2 + 0.035, -0.042));
      const nh = y - h / 2 - 0.8 + 0.04;
      add(g, RB(0.07, nh, 0.04, 0.01), M(0x20262b, { metalness: 0.7 }), 0, -h / 2 + 0.04 - nh / 2, -0.075);
      add(g, RB(0.36, 0.014, 0.22, 0.006), M(0x20262b, { metalness: 0.7 }), 0, -(y - 0.807), -0.07);
    };
    monitor(1.7, 0.72, ide, -0.1, 1.38, -0.4, 0);
    monitor(0.45, 0.8, logs, -1.3, 1.3, -0.15, 0.45);
    add(desk, RB(0.08, 0.03, 0.03, 0.01), M(0x0b0f12), -0.1, 1.775, -0.4);
    add(desk, new THREE.SphereGeometry(0.008, 8, 6), rgbMat, -0.1, 1.775, -0.382);
    [-0.98, 0.8].forEach((x) => {
      const sp = new THREE.Group(); sp.position.set(x, 0.9, -0.3); desk.add(sp);
      add(sp, RB(0.12, 0.22, 0.13, 0.02), M(0x1b2227), 0, 0, 0);
      add(sp, new THREE.CylinderGeometry(0.04, 0.04, 0.01, 20), M(0x0a0d10), 0, -0.03, 0.065).rotation.x = Math.PI / 2;
      add(sp, new THREE.CylinderGeometry(0.018, 0.018, 0.01, 16), M(0x0a0d10), 0, 0.06, 0.065).rotation.x = Math.PI / 2;
    });

    /* ───── PC tower (scaled 1.2×): glass side faces viewer, rear I/O faces right wall ───── */
    const TX = 1.35, TY = 1.12, TZ = -0.1, TS = 1.2;
    const tower = new THREE.Group(); tower.position.set(TX, TY, TZ); tower.rotation.y = -Math.PI / 2; tower.scale.setScalar(TS); desk.add(tower);
    const dark = M(0x0b0e11, { metalness: 0.6, roughness: 0.4 });
    const glassM = new THREE.MeshPhysicalMaterial({ color: 0x9fffd8, transparent: true, opacity: 0.1, roughness: 0.05 });
    const T = (g, m, x, y, z) => add(tower, g, m, x, y, z);
    const fanBlade = M(0x1a2026, { emissive: 0x00e08a, emissiveIntensity: 0.3 });
    const makeFan = (parent, x, y, z, ry, r, n = 7) => {
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
      add(g, new THREE.TorusGeometry(r, r * 0.09, 8, 24), rgbMat);
      const rot = new THREE.Group(); g.add(rot);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        add(rot, new THREE.BoxGeometry(r * 0.34, r * 0.77, 0.002), fanBlade, Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52, 0).rotation.z = a - Math.PI / 2 + 0.5;
      }
      add(g, new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.008, 16), M(0x0a0d10), 0, 0, 0).rotation.x = Math.PI / 2;
      return rot;
    };
    /* shell */
    T(RB(0.02, 0.54, 0.5, 0.005), dark, -0.11, 0, 0);
    T(RB(0.24, 0.02, 0.5, 0.005), dark, 0, 0.26, 0); T(RB(0.24, 0.02, 0.5, 0.005), dark, 0, -0.26, 0);
    for (let i = 0; i < 7; i++) T(new THREE.BoxGeometry(0.2, 0.003, 0.02), M(0x000000), 0, 0.271, -0.18 + i * 0.06);
    for (let i = 0; i < 8; i++) T(new THREE.BoxGeometry(0.004, 0.003, 0.4), M(0x1c2227), -0.121 + i * 0.0, 0.2 - i * 0.05, 0).scale.set(1, 1, 1);
    T(RB(0.24, 0.54, 0.02, 0.005), dark, 0, 0, 0.24);
    T(RB(0.1, 0.14, 0.012, 0.003), M(0x1c2227, { metalness: 0.8 }), -0.03, 0.12, 0.25);
    [0x1f6feb, 0x1f6feb, 0x00e08a, 0xff5f56, 0x00e08a, 0xffbd2e].forEach((c, i) => T(new THREE.BoxGeometry(0.016, 0.012, 0.008), M(c, { emissive: c, emissiveIntensity: 0.4 }), -0.06 + (i % 3) * 0.03, 0.09 + Math.floor(i / 3) * 0.04, 0.258));
    T(RB(0.08, 0.05, 0.012, 0.003), M(0x15191d, { metalness: 0.7 }), 0, -0.2, 0.25);
    T(new THREE.BoxGeometry(0.01, 0.008, 0.004), M(0xdfe6e9), -0.015, -0.2, 0.258); T(new THREE.BoxGeometry(0.01, 0.008, 0.004), M(0xdfe6e9), 0.015, -0.2, 0.258);
    /* motherboard + parts */
    T(new THREE.BoxGeometry(0.008, 0.42, 0.4), M(0x0c3a2c, { roughness: 0.5 }), -0.095, 0, 0.03);
    for (let i = 0; i < 4; i++) { T(RB(0.014, 0.13, 0.01, 0.003), M(0x1a2026), -0.083, 0.12, -0.03 + i * 0.018); T(new THREE.BoxGeometry(0.016, 0.012, 0.012), rgbMat, -0.083, 0.19, -0.03 + i * 0.018); }
    T(RB(0.014, 0.1, 0.05, 0.004), M(0x20272d, { metalness: 0.8 }), -0.085, 0.12, -0.12);          // VRM heatsink
    T(RB(0.012, 0.03, 0.09, 0.004), M(0x20272d, { metalness: 0.8 }), -0.085, 0.02, 0.0);           // M.2 heatsink
    T(RB(0.014, 0.08, 0.08, 0.004), M(0x20272d, { metalness: 0.8 }), -0.085, -0.02, 0.2);          // chipset
    T(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 24), M(0x20272d, { metalness: 0.8 }), -0.07, 0.1, 0.15).rotation.z = Math.PI / 2;
    T(new THREE.TorusGeometry(0.04, 0.004, 8, 24), rgbMat, -0.04, 0.1, 0.15).rotation.y = Math.PI / 2;
    T(RB(0.05, 0.03, 0.3, 0.01), M(0x15191d, { metalness: 0.7 }), 0, 0.235, 0.03);                 // AIO radiator
    [0.14, 0.17].forEach((z) => T(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.05, 0.12, z), V(-0.03, 0.2, z + 0.01), V(-0.01, 0.235, z)]), 12, 0.007, 6), M(0x050607), 0, 0, 0));
    /* GPU with two fans facing the glass */
    T(RB(0.05, 0.1, 0.34, 0.01), M(0x15191d, { metalness: 0.7 }), -0.05, -0.07, 0.02);
    T(new THREE.BoxGeometry(0.052, 0.006, 0.3), rgbMat, -0.05, -0.016, 0.02);
    const gpuFans = [-0.05, 0.09].map((z) => makeFan(tower, -0.022, -0.07, z, Math.PI / 2, 0.042, 9));
    T(RB(0.2, 0.1, 0.36, 0.01), M(0x14181c, { metalness: 0.5 }), 0, -0.2, 0.06);                   // PSU shroud
    T(new THREE.BoxGeometry(0.202, 0.006, 0.3), rgbMat, 0, -0.15, 0.06);
    T(RB(0.012, 0.2, 0.03, 0.004), M(0xdfe6e9), -0.085, 0.0, -0.13);                               // RAM-like light bar
    T(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.04, -0.1, 0.18), V(-0.05, -0.13, 0.2), V(-0.03, -0.16, 0.14)]), 12, 0.006, 6), M(0x00e08a), 0, 0, 0);
    /* glass side + rear panel */
    T(new THREE.BoxGeometry(0.008, 0.54, 0.5), glassM, 0.12, 0, 0).castShadow = false;
    T(RB(0.24, 0.54, 0.012, 0.004), dark, 0, 0, -0.246);
    /* side intake fans (through the glass) */
    const fans = [-0.17, 0, 0.17].map((y) => makeFan(tower, 0.085, y, -0.17, Math.PI / 2, 0.065, 7));
    /* rear I/O: shield, ports, PCIe brackets, exhaust fan, PSU inlet */
    T(RB(0.1, 0.12, 0.01, 0.003), M(0x2a3138, { metalness: 0.8 }), -0.03, 0.14, -0.254);
    const ioCols = [0x1f6feb, 0x1f6feb, 0x1f6feb, 0x1f6feb, 0xdfe6e9, 0x1f6feb, 0x00e08a, 0xff8fab, 0x050607, 0xffbd2e, 0x050607, 0xdfe6e9];
    ioCols.forEach((c, k) => { const r = Math.floor(k / 4), cc = k % 4; T(new THREE.BoxGeometry(0.016, 0.014, 0.006), M(c, { emissive: c, emissiveIntensity: 0.25 }), -0.062 + cc * 0.02, 0.18 - r * 0.026, -0.261); });
    for (let i = 0; i < 4; i++) T(RB(0.1, 0.02, 0.006, 0.002), M(0xaab3b8, { metalness: 0.9 }), -0.04, -0.015 - i * 0.028, -0.253);
    [[-0.065, -0.015], [-0.035, -0.015], [-0.015, -0.043], [-0.065, -0.043]].forEach(([x, y]) => T(new THREE.BoxGeometry(0.02, 0.01, 0.008), M(0x050607), x, y, -0.26));
    const exhaust = makeFan(tower, 0.07, 0.17, -0.254, 0, 0.045, 7);
    T(RB(0.05, 0.035, 0.014, 0.004), M(0x050607), 0, -0.205, -0.254);
    T(new THREE.BoxGeometry(0.03, 0.02, 0.006), M(0xdfe6e9), 0, -0.205, -0.263);
    T(new THREE.BoxGeometry(0.014, 0.008, 0.006), M(0xff3b30, { emissive: 0xff3b30, emissiveIntensity: 0.4 }), 0.06, -0.205, -0.258);
    for (let i = 0; i < 5; i++) T(new THREE.BoxGeometry(0.2, 0.004, 0.004), M(0x000000), 0, -0.1 - i * 0.015, -0.254);
    const rgbLight = new THREE.PointLight(0x00e08a, 1.6, 2.6, 2); rgbLight.position.set(1.35, 1.2, 0.35); scene.add(rgbLight);

    /* ───── thick, colour-coded, glowing cables (all end at the REAR ports of the tower) ───── */
    const cable = (pts, color, r = 0.02) => add(scene, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.3), 120, r, 10), M(color, { roughness: 0.4, emissive: color, emissiveIntensity: 0.3 }));
    const plug = (x, y, z, color) => { add(scene, RB(0.07, 0.034, 0.03, 0.008), M(0x15191d, { metalness: 0.5 }), x, y, z); add(scene, RB(0.03, 0.03, 0.026, 0.006), M(color, { emissive: color, emissiveIntensity: 0.3 }), x + 0.045, y, z); };
    const PX = 1.70;
    // monitor 1 → GPU DP (green)
    cable([V(0.2, 1.05, -0.46), V(0.2, 0.92, -0.52), V(0.22, 0.808, -0.58), V(0.8, 0.808, -0.58), V(1.4, 0.808, -0.58), V(1.72, 0.808, -0.55), V(1.77, 0.95, -0.4), V(1.77, 1.08, -0.28), V(1.76, 1.10, -0.18)], 0x00e08a);
    plug(PX, 1.10, -0.178, 0x00e08a);
    // monitor 2 → GPU HDMI (blue)
    cable([V(-1.22, 0.93, -0.245), V(-1.18, 0.84, -0.35), V(-1.0, 0.808, -0.62), V(0.2, 0.808, -0.66), V(1.4, 0.808, -0.64), V(1.73, 0.808, -0.6), V(1.79, 0.95, -0.42), V(1.78, 1.05, -0.25), V(1.76, 1.066, -0.12)], 0x58a6ff);
    plug(PX, 1.066, -0.118, 0x58a6ff);
    // keyboard → USB (yellow)
    cable([V(-0.05, 0.808, 0.19), V(0.3, 0.808, 0.14), V(1.0, 0.808, 0.16), V(1.5, 0.808, 0.14), V(1.74, 0.84, 0.1), V(1.77, 1.1, 0.0), V(1.78, 1.3, -0.1), V(1.76, 1.336, -0.174)], 0xffbd2e, 0.014);
    plug(PX, 1.336, -0.174, 0xffbd2e);
    // mouse → USB (purple)
    cable([V(0.42, 0.808, 0.25), V(0.6, 0.808, 0.22), V(1.0, 0.808, 0.2), V(1.5, 0.808, 0.18), V(1.76, 0.83, 0.12), V(1.80, 1.1, 0.0), V(1.80, 1.3, -0.08), V(1.76, 1.336, -0.15)], 0xb48cff, 0.014);
    plug(PX, 1.336, -0.15, 0xb48cff);
    // ethernet (orange) → wall jack
    cable([V(1.76, 1.305, -0.102), V(1.85, 1.2, -0.05), V(1.95, 0.9, 0.0), V(2.0, 0.5, 0.1), V(2.1, 0.1, 0.2), V(2.5, 0.03, 0.3), V(3.0, 0.03, 0.35), V(3.17, 0.2, 0.35)], 0xff8a3d, 0.016);
    plug(PX, 1.305, -0.102, 0xff8a3d);
    add(scene, RB(0.02, 0.1, 0.08, 0.004), M(0xf1f5f3), 3.19, 0.2, 0.35);
    // PSU power (thick white) → hangs off the desk side → power strip on the floor
    cable([V(1.76, 0.874, -0.1), V(1.86, 0.84, -0.1), V(1.9, 0.5, -0.1), V(1.92, 0.15, -0.05), V(2.0, 0.035, 0.0), V(2.3, 0.03, 0.06), V(2.45, 0.032, 0.1)], 0xf2f5f7, 0.03);
    plug(PX, 0.874, -0.1, 0xf2f5f7);
    // strip → wall
    cable([V(2.71, 0.03, 0.1), V(3.0, 0.025, 0.2), V(3.18, 0.3, 0.25)], 0x30383d, 0.022);
    add(scene, RB(0.42, 0.045, 0.09, 0.015), M(0xe9efec), 2.5, 0.025, 0.1);
    add(scene, new THREE.SphereGeometry(0.012, 8, 6), rgbMat, 2.65, 0.055, 0.1);
    add(scene, RB(0.02, 0.12, 0.08, 0.005), M(0xf1f5f3), 3.19, 0.3, 0.25);

    /* keyboard + mouse + accessories */
    const kb = new THREE.Group(); kb.position.set(-0.05, 0.8, 0.28); desk.add(kb);
    add(kb, RB(0.47, 0.022, 0.17, 0.008), M(0x12181c, { metalness: 0.5 }), 0, 0, 0);
    const glow = add(kb, RB(0.48, 0.008, 0.18, 0.003), M(0x111111, { emissive: 0x00e08a, emissiveIntensity: 1.2 }), 0, -0.01, 0);
    glow.castShadow = false;
    const keys = new THREE.InstancedMesh(RB(0.028, 0.012, 0.028, 0.005), M(0x232b31, { roughness: 0.4 }), 70);
    const dm = new THREE.Object3D();
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) {
      dm.position.set(-0.2 + c * 0.031, 0.016, -0.065 + r * 0.031); dm.updateMatrix();
      keys.setMatrixAt(r * 14 + c, dm.matrix);
      keys.setColorAt(r * 14 + c, new THREE.Color(c === 13 || (r === 0 && c === 0) ? 0x00a86b : 0xffffff));
    }
    keys.castShadow = true; kb.add(keys);
    add(desk, RB(0.065, 0.026, 0.11, 0.02), M(0x12181c, { metalness: 0.4 }), 0.42, 0.806, 0.3);

    const lampG = new THREE.Group(); lampG.position.set(-1.55, 0.79, -0.4); desk.add(lampG);
    const lampMat = M(0x10161a, { metalness: 0.7 });
    add(lampG, new THREE.CylinderGeometry(0.09, 0.1, 0.03, 24), lampMat, 0, 0.015, 0);
    limb(lampG, lampMat, 0.016)(V(0, 0.03, 0), V(0.12, 0.5, 0.05));
    limb(lampG, lampMat, 0.016)(V(0.12, 0.5, 0.05), V(0.4, 0.62, 0.15));
    add(lampG, new THREE.ConeGeometry(0.09, 0.14, 24, 1, true), M(0x1d252b, { side: THREE.DoubleSide, metalness: 0.6 }), 0.42, 0.62, 0.17).rotation.set(0.4, 0, 0.5);
    const lamp = new THREE.SpotLight(0xffd9a0, 18, 3.5, 0.7, 0.6, 1.5);
    lamp.position.set(-1.12, 1.4, -0.22); lamp.target.position.set(-0.7, 0.8, 0.2); lamp.castShadow = true;
    scene.add(lamp, lamp.target);
    add(desk, new THREE.CylinderGeometry(0.04, 0.035, 0.09, 20), M(0xe6edf3, { roughness: 0.3 }), 0.72, 0.835, 0.38);
    [[-0.78, 0.8, 0.12], [-0.78, 0.815, 0.12]].forEach(([x, y, z], i) => add(desk, RB(0.2 - i * 0.03, 0.016, 0.14, 0.005), M(i ? 0x1f6feb : 0x8957e5), x, y, z));

    /* ───── swivel chair + cartoon developer (one pivot so he can spin to face you) ───── */
    const pz = 0.95;
    const pivot = new THREE.Group(); pivot.position.set(0, 0, pz); scene.add(pivot);
    const chair = pivot, cm = M(0x131d1a, { roughness: 0.7 });
    add(chair, RB(0.56, 0.09, 0.56, 0.04), cm, 0, 0.5, 0);
    add(chair, RB(0.5, 0.75, 0.09, 0.05), cm, 0, 0.98, 0.28).rotation.x = 0.08;
    add(chair, RB(0.4, 0.05, 0.095, 0.02), rgbMat, 0, 0.82, 0.22);
    add(chair, RB(0.28, 0.14, 0.08, 0.04), cm, 0, 1.48, 0.31);
    [-1, 1].forEach((s) => { add(chair, RB(0.06, 0.04, 0.34, 0.015), cm, s * 0.32, 0.72, 0.02); add(chair, RB(0.04, 0.2, 0.04, 0.01), cm, s * 0.32, 0.6, 0.1); });
    add(chair, new THREE.CylinderGeometry(0.035, 0.035, 0.4, 12), M(0x2a3138, { metalness: 0.8 }), 0, 0.3, 0);
    for (let i = 0; i < 5; i++) {
      const arm = new THREE.Group(); arm.rotation.y = (i / 5) * Math.PI * 2; chair.add(arm);
      add(arm, RB(0.4, 0.04, 0.06, 0.015), M(0x1a2227, { metalness: 0.6 }), 0.2, 0.09, 0);
      add(arm, new THREE.SphereGeometry(0.04, 10, 8), M(0x050607), 0.4, 0.04, 0);
    }

    /* character: big round head, big friendly eyes, tuft hair, white shirt + navy tie (like the reference) */
    const skin = M(0xf7c29b, { roughness: 0.5, metalness: 0 }), skinD = M(0xe99f78, { roughness: 0.5, metalness: 0 });
    const shirt = M(0xf5f7f9, { roughness: 0.8 }), navy = M(0x1c2740, { roughness: 0.8 }), hairM = M(0x8a5530, { roughness: 0.45, metalness: 0 });
    add(pivot, RB(0.44, 0.58, 0.26, 0.1), shirt, 0, 0.87, -0.05);
    add(pivot, RB(0.44, 0.16, 0.27, 0.07), navy, 0, 0.58, -0.05);
    add(pivot, RB(0.45, 0.04, 0.26, 0.01), M(0x151a22), 0, 0.64, -0.05);
    add(pivot, new THREE.BoxGeometry(0.06, 0.32, 0.012), M(0x1f3a8a), 0, 0.9, -0.182);
    add(pivot, new THREE.SphereGeometry(0.036, 12, 8), M(0x1f3a8a), 0, 1.07, -0.176);
    [-1, 1].forEach((s) => add(pivot, RB(0.1, 0.045, 0.02, 0.005), shirt, s * 0.055, 1.14, -0.168).rotation.z = s * 0.5);
    add(pivot, new THREE.CylinderGeometry(0.055, 0.06, 0.1, 14), skin, 0, 1.19, -0.06);

    const head = new THREE.Group(); head.position.set(0, 1.43, -0.07); pivot.add(head);
    add(head, new THREE.SphereGeometry(0.22, 32, 24), skin).scale.set(1, 1.02, 1);
    [-1, 1].forEach((s) => {
      add(head, new THREE.SphereGeometry(0.042, 12, 10), skin, s * 0.215, 0, 0.0).scale.set(0.5, 1.1, 0.85);          // ears
      add(head, new THREE.SphereGeometry(0.02, 10, 8), skinD, s * 0.222, 0, 0.0).scale.set(0.4, 1, 0.8);
      add(head, new THREE.SphereGeometry(0.055, 18, 14), M(0xffffff, { roughness: 0.25, metalness: 0 }), s * 0.08, 0.03, -0.19).scale.set(1, 1.2, 0.5);   // eye white
      add(head, new THREE.SphereGeometry(0.034, 16, 12), M(0x7a4521, { roughness: 0.3, metalness: 0 }), s * 0.08, 0.026, -0.21).scale.set(1, 1.1, 0.4); // iris
      add(head, new THREE.SphereGeometry(0.018, 12, 10), M(0x050505), s * 0.08, 0.026, -0.22).scale.set(1, 1, 0.4);                  // pupil
      add(head, new THREE.SphereGeometry(0.009, 8, 6), M(0xffffff, { emissive: 0xffffff }), s * 0.08 + 0.012, 0.04, -0.228);        // highlight
      add(head, RB(0.095, 0.02, 0.02, 0.008), hairM, s * 0.085, 0.118, -0.17).rotation.z = -s * 0.15;                               // thick brows
      add(head, new THREE.SphereGeometry(0.036, 12, 10), M(0xff9a8a, { roughness: 0.7, metalness: 0, transparent: true, opacity: 0.55 }), s * 0.125, -0.045, -0.178).scale.set(1, 0.7, 0.3); // blush
      add(head, new THREE.BoxGeometry(0.03, 0.09, 0.05), hairM, s * 0.205, 0.04, -0.03);                                            // sideburns
    });
    add(head, new THREE.SphereGeometry(0.03, 14, 12), skinD, 0, -0.025, -0.212);                                                    // nose
    const teeth = add(head, new THREE.CircleGeometry(0.073, 24, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), 0, -0.02, -0.209);
    teeth.rotation.y = Math.PI; teeth.castShadow = false;
    add(head, new THREE.TorusGeometry(0.075, 0.009, 8, 24, Math.PI), M(0x9a3b3b, { metalness: 0 }), 0, -0.02, -0.21).rotation.z = Math.PI;  // big smile
    const hair = add(head, new THREE.SphereGeometry(0.236, 28, 18, 0, Math.PI * 2, 0, 1.5), hairM, 0, 0.02, 0);
    hair.scale.set(1, 0.98, 1.04); hair.rotation.x = 0.5;
    [[-0.1, 0.2, -0.1, 0.4], [-0.02, 0.24, -0.1, 0.1], [0.06, 0.25, -0.09, -0.3], [0.13, 0.2, -0.08, -0.6], [-0.15, 0.16, -0.08, 0.7], [0.02, 0.27, -0.02, 0]]
      .forEach(([x, y, z, rz]) => { const tf = add(head, new THREE.SphereGeometry(0.07, 14, 10), hairM, x, y, z); tf.scale.set(0.8, 1.1, 1.4); tf.rotation.set(0.5, 0, rz); });

    [-1, 1].forEach((s) => {
      const th = limb(pivot, navy, 0.14), sh = limb(pivot, navy, 0.12);
      th(V(s * 0.11, 0.6, -0.09), V(s * 0.12, 0.6, -0.55)); sh(V(s * 0.12, 0.6, -0.55), V(s * 0.12, 0.1, -0.53));
      add(pivot, RB(0.12, 0.07, 0.24, 0.03), M(0x5b3a29, { roughness: 0.5 }), s * 0.12, 0.04, -0.6);
    });
    const arms = [-1, 1].map((s) => ({ s, ua: limb(pivot, shirt, 0.11), fa: limb(pivot, skin, 0.09), hand: add(pivot, new THREE.SphereGeometry(0.05, 12, 10), skin) }));

    /* resize + loop */
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();

    const t0 = performance.now();
    let last = -1, raf;
    const S = V(0, 0, 0), E = V(0, 0, 0), Hd = V(0, 0, 0);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = (performance.now() - t0) / 1000;
      if (t - last > 0.06) { ide.update(t); logs.update(t); last = t; }
      rgbCol.setHSL((t * 0.08) % 1, 0.85, 0.5);
      rgbMat.emissive.copy(rgbCol); glow.material.emissive.copy(rgbCol); rgbLight.color.copy(rgbCol);
      fans.forEach((f, i) => (f.rotation.z = t * (6 + i)));
      gpuFans.forEach((f, i) => (f.rotation.z = t * (9 + i)));
      exhaust.rotation.z = t * 8;
      screenLight.intensity = 4 + Math.sin(t * 7) * 0.2;
      leaves.forEach((l, i) => (l.rotation.z += Math.sin(t * 1.2 + i) * 0.0008));
      const d = new Date();
      mHand.rotation.z = -((d.getMinutes() + d.getSeconds() / 60) / 60) * Math.PI * 2;
      hHand.rotation.z = -(((d.getHours() % 12) + d.getMinutes() / 60) / 12) * Math.PI * 2;

      /* 16s loop: type → spin chair to face the viewer, arms crossed, smile → spin back */
      const c = t % 16; let u = 0;
      if (c > 7 && c < 8.2) u = (c - 7) / 1.2; else if (c >= 8.2 && c < 12.2) u = 1; else if (c >= 12.2 && c < 13.4) u = 1 - (c - 12.2) / 1.2;
      const e = ease(u);
      pivot.rotation.y = Math.atan2(-camera.position.x, -(camera.position.z - pz)) * e;
      head.rotation.y = Math.sin(t * 0.6) * 0.12 * (1 - e);
      head.rotation.x = Math.sin(t * 0.9) * 0.03 + Math.sin(t * 1.4) * 0.05 * e;
      head.rotation.z = Math.sin(t * 1.1) * 0.05 * e;
      arms.forEach(({ s, ua, fa, hand }, i) => {
        const tap = (Math.max(0, Math.sin(t * 9 + i * 2.1)) * 0.012 + Math.sin(t * 2 + i) * 0.01) * (1 - e);
        const typ = V(s * 0.12 + Math.sin(t * 1.7 + i) * 0.03, 0.835 + tap, -0.65), crs = V(-s * 0.17, 0.95, -0.23);
        Hd.copy(typ).lerp(crs, e); S.set(s * 0.23, 1.1, -0.05);
        E.copy(S).add(typ).multiplyScalar(0.5).add(V(s * 0.1, -0.12, 0.14)).lerp(V(s * 0.25, 0.86, -0.17), e);
        ua(S, E); fa(E, Hd); hand.position.copy(Hd);
      });
      controls.update();
      camera.position.clamp(camMin, camMax);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
      scene.traverse((o) => { o.geometry?.dispose(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => { x.map?.dispose(); x.dispose(); }); });
      renderer.dispose(); el.removeChild(renderer.domElement);
    };
  }, []);

  const chip = { position: "absolute", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, letterSpacing: ".08em", color: "#7fe8bd", background: "rgba(4,20,15,.7)", border: "1px solid rgba(0,224,138,.25)", borderRadius: 999, padding: "6px 12px", backdropFilter: "blur(6px)", pointerEvents: "none" };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 520, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(0,224,138,.18)", background: "#04140f" }}>
      <div ref={ref} style={{ position: "absolute", inset: 0 }} />
      <div style={{ ...chip, top: 16, left: 16 }}>● DEV.STATION · LIVE</div>
      <div style={{ ...chip, bottom: 16, left: 16, color: "#8fb3a5" }}>drag to orbit · scroll to zoom</div>
    </div>
  );
}
