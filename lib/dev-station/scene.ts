import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createAvatar } from "./avatar";
import { createGeometryKit, disposeScene } from "./geometry";
import { createRoom } from "./room";
import { createWorkstation } from "./workstation";

export const STATION_VIEW = {
  position: [3.4, 3.3, 4.8] as const,
  target: [0.02, 1.35, 0.05] as const,
  fieldOfView: 35,
  aspect: 1282 / 945,
};

export function createStationScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#075046");
  const kit = createGeometryKit();
  try {
    const room = createRoom(scene, kit);
    const desk = createWorkstation(scene, kit);
    const avatar = createAvatar(scene, kit, desk.keyboard);
    scene.add(new THREE.HemisphereLight("#fff8e9", "#647c6a", 2.3));
    const key = new THREE.DirectionalLight("#fff1df", 3.1);
    key.position.set(-2.5, 5.2, 4);
    key.castShadow = true;
    key.shadow.normalBias = 0.018;
    key.shadow.bias = -0.0003;
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 12 });
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    const fill = new THREE.DirectionalLight("#d6f5ee", 1.2);
    fill.position.set(4, 3, 1);
    scene.add(fill);
    return { scene, key, avatar, desk, room };
  } catch (error) {
    disposeScene(scene);
    throw error;
  }
}

export interface StationController {
  reset: () => void;
  handleKey: (key: string) => boolean;
  dispose: () => void;
}

export function mountStation(container: HTMLDivElement, onReady: () => void, onError: () => void): StationController {
  const compact = window.matchMedia("(max-width: 640px), (pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !compact, powerPreference: "low-power", alpha: false });
  let content: ReturnType<typeof createStationScene>;
  try {
    content = createStationScene();
  } catch (error) {
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }
  const { scene, key, avatar, desk, room } = content;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  key.shadow.mapSize.setScalar(compact ? 1024 : 1536);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(STATION_VIEW.fieldOfView, STATION_VIEW.aspect, 0.1, 30);
  camera.position.set(...STATION_VIEW.position);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...STATION_VIEW.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 4.2;
  controls.maxDistance = 7.6;
  controls.minPolarAngle = 0.32;
  controls.maxPolarAngle = 1.48;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.65;
  controls.touches.ONE = THREE.TOUCH.PAN;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
  renderer.domElement.style.touchAction = "pan-y";
  controls.update();
  controls.saveState();

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let disposed = false;
  let contextLost = false;
  let ready = false;
  let frame = 0;
  let lastFrame = 0;
  let lastScreenUpdate = -Infinity;
  let lastShadowUpdate = -Infinity;
  let animationTime = 0;
  let previousAnimationTime: number | null = null;
  const interval = 1000 / (compact ? 24 : 30);

  function draw(time = performance.now()) {
    if (disposed || contextLost) return;
    if (!motion.matches && previousAnimationTime !== null) {
      animationTime += Math.min(Math.max((time - previousAnimationTime) / 1000, 0), 0.1);
    }
    previousAnimationTime = time;
    avatar.update(animationTime, motion.matches);
    desk.update(animationTime, motion.matches);
    const wallsChanged = room.update(camera.position);
    if (wallsChanged || (!motion.matches && time - lastShadowUpdate >= 1000 / (compact ? 8 : 12))) {
      renderer.shadowMap.needsUpdate = true;
      lastShadowUpdate = time;
    }
    if (time - lastScreenUpdate >= 250) {
      desk.updateScreens(motion.matches ? 0 : animationTime);
      lastScreenUpdate = time;
    }
    renderer.render(scene, camera);
    if (!ready) { ready = true; onReady(); }
  }

  function animate(time: number) {
    frame = 0;
    if (disposed || contextLost || !visible || document.hidden || motion.matches) return;
    if (time - lastFrame >= interval) {
      controls.update((time - lastFrame) / 1000);
      draw(time);
      lastFrame = time - ((time - lastFrame) % interval);
    }
    frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousAnimationTime = null;
    if (!visible || document.hidden || disposed || contextLost) return;
    // A still frame remains interactive when the visitor prefers reduced motion.
    controls.enableDamping = !motion.matches;
    draw();
    lastFrame = performance.now();
    if (!motion.matches) frame = requestAnimationFrame(animate);
  }

  function onControlsChange() {
    if (motion.matches && visible && !document.hidden) draw();
  }
  controls.addEventListener("change", onControlsChange);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height || disposed) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (visible && !document.hidden) draw();
  }
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(container);
  resize();
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncAnimation();
  });
  visibilityObserver.observe(container);
  document.addEventListener("visibilitychange", syncAnimation);
  motion.addEventListener("change", syncAnimation);

  function onContextLost(event: Event) {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    onError();
  }
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

  function reset() { controls.reset(); draw(); }

  return {
    reset,
    handleKey(pressed) {
      if (pressed.toLowerCase() === "r" || pressed === "Home") { reset(); return true; }
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      switch (pressed) {
        case "ArrowLeft": spherical.theta -= 0.09; break;
        case "ArrowRight": spherical.theta += 0.09; break;
        case "ArrowUp": spherical.phi -= 0.07; break;
        case "ArrowDown": spherical.phi += 0.07; break;
        case "+": case "=": spherical.radius *= 0.92; break;
        case "-": spherical.radius *= 1.08; break;
        default: return false;
      }
      spherical.theta = THREE.MathUtils.clamp(spherical.theta, controls.minAzimuthAngle, controls.maxAzimuthAngle);
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
      spherical.radius = THREE.MathUtils.clamp(spherical.radius, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
      controls.update();
      draw();
      return true;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      motion.removeEventListener("change", syncAnimation);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      controls.removeEventListener("change", onControlsChange);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
