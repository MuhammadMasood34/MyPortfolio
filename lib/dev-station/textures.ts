import * as THREE from "three";

type Painter = (context: CanvasRenderingContext2D, width: number, height: number) => void;

export function canvasTexture(width: number, height: number, paint: Painter) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas textures are unavailable");
  paint(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function makeWoodTexture() {
  const texture = canvasTexture(512, 512, (context, width, height) => {
    context.fillStyle = "#e4b780";
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 180; index++) {
      context.strokeStyle = `rgba(133,83,38,${0.015 + (index % 5) * 0.006})`;
      context.lineWidth = 1 + (index % 3);
      context.beginPath();
      const y = (index * 37) % height;
      context.moveTo(0, y);
      context.bezierCurveTo(130, y - 3, 350, y + 5, width, y + 1);
      context.stroke();
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

export function makeFabricTexture() {
  const texture = canvasTexture(64, 64, (context, width, height) => {
    context.fillStyle = "#6f7476";
    context.fillRect(0, 0, width, height);
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        context.fillStyle = (x + y) % 4 ? "#626769" : "#8a8c8d";
        context.fillRect(x, y, 1, 1);
      }
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function makeWhiteboardTexture() {
  return canvasTexture(768, 480, (context, width, height) => {
    context.fillStyle = "#f9f9f5";
    context.fillRect(0, 0, width, height);
    context.font = "20px Arial, sans-serif";
    context.textAlign = "center";
    ["TO DO", "DOING", "DONE"].forEach((label, index) => {
      context.fillStyle = "#4f5553";
      context.fillText(label, 130 + index * 250, 43);
      context.fillRect(24 + index * 250, 57, 214, 2);
    });
    const notes = [
      ["fix bug #442", "#ffe184"], ["ship v2", "#ffaecb"], ["code review", "#a7d5e4"],
      ["write tests", "#c5e5ab"], ["deploy", "#ffe184"], ["refactor", "#ffaecb"],
      ["API docs", "#a7d5e4"], ["resolve", "#c5e5ab"], ["coffee", "#ffe184"],
    ];
    context.textAlign = "left";
    notes.forEach(([label, color], index) => {
      context.save();
      context.translate(35 + (index % 3) * 250, 83 + Math.floor(index / 3) * 126);
      context.rotate(((index % 3) - 1) * 0.025);
      context.shadowColor = "#00000028";
      context.shadowBlur = 4;
      context.shadowOffsetY = 3;
      context.fillStyle = color;
      context.fillRect(0, 0, 194, 105);
      context.shadowColor = "transparent";
      context.fillStyle = "#303c38";
      context.font = "19px Arial, sans-serif";
      context.fillText(label, 16, 44);
      context.restore();
    });
  });
}

export function makeNeonTexture() {
  return canvasTexture(768, 256, (context, width) => {
    context.font = "italic bold 158px monospace";
    context.textAlign = "center";
    context.fillStyle = "#00f5ac";
    context.shadowColor = "#00ffa6";
    context.shadowBlur = 32;
    context.fillText("</dev>", width / 2, 184);
    context.shadowBlur = 12;
    context.fillText("</dev>", width / 2, 184);
  });
}

const CODE = [
  'import { useState, useEffect } from "react";',
  "", "export default function Workspace() {",
  "  const [projects, setProjects] = useState([]);", "",
  "  useEffect(() => {", '    fetch("/api/projects")',
  "      .then((response) => response.json())", "      .then(setProjects);", "  }, []);", "",
  "  return (", '    <main className="workspace">',
  "      <ProjectGrid projects={projects} />", "    </main>", "  );", "}",
];

function drawEditor(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  context.fillStyle = "#10151b";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#20262d";
  context.fillRect(0, 0, width, 32);
  ["#ff6b67", "#f4c15b", "#58ca7b"].forEach((color, index) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(17 + index * 16, 16, 4, 0, Math.PI * 2);
    context.fill();
  });
  context.font = "12px monospace";
  context.fillStyle = "#8b949e";
  context.fillText("portfolio.tsx   /   dev.station", 95, 21);
  context.fillStyle = "#161c23";
  context.fillRect(0, 32, 140, height - 53);
  ["EXPLORER", "⌄ portfolio", "  ⌄ app", "    page.tsx", "    layout.tsx", "    global.css", "  ⌄ components", "    Workspace.tsx", "  package.json"].forEach((text, index) => {
    context.fillStyle = index === 3 ? "#7de6bb" : "#89949f";
    context.fillText(text, 12, 61 + index * 22);
  });
  context.fillStyle = "#1d242c";
  context.fillRect(140, 32, 150, 28);
  context.fillStyle = "#65dbb0";
  context.fillText("TS  portfolio.tsx", 152, 51);
  context.fillRect(140, 32, 150, 2);
  const count = Math.floor(time * 14) % 55;
  context.font = "14px monospace";
  CODE.forEach((line, index) => {
    const y = 87 + index * 21;
    context.fillStyle = "#49545e";
    context.fillText(String(index + 1), 152, y);
    let x = 184;
    const tokens = line.match(/"[^"]*"|\b(?:import|from|export|default|function|const|return)\b|\b(?:useState|useEffect|fetch)\b|[^\w" ]+|\w+| +/g) ?? [];
    for (const token of tokens) {
      context.fillStyle = /^(import|from|export|default|function|const|return)$/.test(token)
        ? "#e58e9b" : token.startsWith('"') ? "#dfb78a"
          : /^(useState|useEffect|fetch)$/.test(token) ? "#81bde4" : "#b7c5d1";
      context.fillText(token, x, y);
      x += context.measureText(token).width;
    }
  });
  context.fillStyle = "#68dcb1";
  if (Math.floor(time * 2) % 2 === 0) context.fillRect(186 + count * 4, 454, 2, 15);
  context.font = "11px monospace";
  context.fillStyle = "#82939e";
  context.fillText("TERMINAL    OUTPUT    PROBLEMS", 156, height - 141);
  ["> next dev", "✓ Ready in 412ms", "○ Compiling / ...", "✓ Compiled successfully", "GET / 200 in 38ms"].forEach((line, index) => {
    context.fillStyle = index % 2 ? "#73d7ac" : "#a7b9c8";
    context.fillText(line, 156, height - 119 + index * 18);
  });
  for (let index = 0; index < 36; index++) {
    context.fillStyle = index % 4 ? "#303c47" : "#576c76";
    context.fillRect(width - 61, 75 + index * 9, 12 + (index * 17) % 36, 2);
  }
  context.fillStyle = "#13684f";
  context.fillRect(0, height - 21, width, 21);
  context.fillStyle = "#bbecdc";
  context.fillText(" main   ✓ 0   ⓧ 0                                  TypeScript React    UTF-8", 12, height - 7);
}

function drawTerminal(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  context.fillStyle = "#090f13";
  context.fillRect(0, 0, width, height);
  context.font = "13px monospace";
  context.fillStyle = "#42e3a8";
  context.fillText("●  SYSTEM MONITOR", 16, 29);
  for (let index = 0; index < 9; index++) {
    const value = 0.36 + Math.sin(time * 0.7 + index * 1.7) * 0.26;
    context.fillStyle = "#1b282c";
    context.fillRect(16, 55 + index * 21, width - 32, 11);
    context.fillStyle = index % 3 === 0 ? "#eac84f" : "#00dc93";
    context.fillRect(16, 55 + index * 21, (width - 32) * (value + 0.15), 11);
  }
  context.strokeStyle = "#57bfff";
  context.lineWidth = 1.5;
  context.beginPath();
  for (let x = 16; x < width - 16; x += 3) {
    const y = 309 + Math.sin(x * 0.06 + time) * 25 + Math.cos(x * 0.13) * 12;
    if (x === 16) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  context.font = "10px monospace";
  for (let index = 0; index < 19; index++) {
    context.fillStyle = index % 6 === 0 ? "#e7c76b" : "#78d3a4";
    context.fillText(` ${index % 6 === 0 ? "SYS" : "200"}  /api/projects   ${12 + (index * 13) % 80}ms`, 16, 367 + index * 14);
  }
}

export function makeScreen(kind: "editor" | "terminal") {
  const width = kind === "editor" ? 1152 : 320;
  const height = 648;
  const paint = kind === "editor" ? drawEditor : drawTerminal;
  const texture = canvasTexture(width, height, (context) => paint(context, width, height, 0));
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  const context = (texture.image as HTMLCanvasElement).getContext("2d");
  return {
    texture,
    update(time: number) {
      if (!context) return;
      paint(context, width, height, time);
      texture.needsUpdate = true;
    },
  };
}
