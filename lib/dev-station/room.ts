import * as THREE from "three";
import type { GeometryKit, Point3 } from "./geometry";
import { canvasTexture, makeNeonTexture, makeWhiteboardTexture } from "./textures";

export function createRoom(scene: THREE.Scene, kit: GeometryKit) {
  const { material, mesh, box } = kit;
  const backWall = new THREE.Group();
  backWall.name = "room-back-wall";
  scene.add(backWall);
  const wall = material("#d5d7ce", { roughness: 0.95 });
  const emeraldWall = material("#075649", { roughness: 0.92 });
  const trim = material("#e7e7dd", { roughness: 0.8 });

  box(backWall, [4.7, 3.8, 0.08], wall, [-3.15, 1.9, -1.3], 0);
  box(backWall, [4.8, 3.8, 0.08], emeraldWall, [1.6, 1.9, -1.3], 0);
  box(backWall, [9.5, 0.075, 0.035], trim, [-0.75, 0.038, -1.245], 0);

  const floorTexture = canvasTexture(512, 512, (context, width, height) => {
    context.fillStyle = "#af7948";
    context.fillRect(0, 0, width, height);
    for (let row = 0; row < 8; row++) {
      context.fillStyle = ["#bc8650", "#c08c56", "#b8804a", "#c48f5a"][row % 4];
      context.fillRect(0, row * 64, width, 63);
      context.fillStyle = "#926036";
      context.fillRect((row * 137) % width, row * 64, 1, 64);
      for (let line = 0; line < 9; line++) {
        context.fillStyle = "#9c69301b";
        context.fillRect(0, row * 64 + 3 + line * 7, width, 1);
      }
    }
  });
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4, 4);
  const floor = mesh(scene, new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.78 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.015, 0);
  const rug = mesh(scene, new THREE.CircleGeometry(1.6, 64), material("#205d4e", { roughness: 1 }), [-0.8, 0.003, 1.08]);
  rug.rotation.x = -Math.PI / 2;

  const board = new THREE.Group();
  board.name = "whiteboard";
  board.position.set(-2.9, 2.18, -1.2);
  board.scale.setScalar(1.35);
  board.rotation.z = 0.025;
  backWall.add(board);
  box(board, [1.85, 1.21, 0.045], material("#b6b9b0", { metalness: 0.35 }), [0, 0, 0], 0.016);
  box(board, [1.79, 1.15, 0.026], trim, [0, 0, 0.027], 0.006);
  mesh(board, new THREE.PlaneGeometry(1.72, 1.08), new THREE.MeshStandardMaterial({ map: makeWhiteboardTexture(), roughness: 0.85 }), [0, 0, 0.043]);

  const sign = mesh(backWall, new THREE.PlaneGeometry(1.42, 0.55), new THREE.MeshBasicMaterial({ map: makeNeonTexture(), transparent: true, depthWrite: false, toneMapped: false }), [0.85, 3.04, -1.245]);
  sign.castShadow = false;
  const glow = new THREE.PointLight("#00efab", 1.7, 2.5, 2);
  glow.position.set(0.8, 2.63, -1.02);
  scene.add(glow);

  const posterTexture = canvasTexture(256, 512, (context, width, height) => {
    context.fillStyle = "#081b15";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#00e899";
    context.lineWidth = 6;
    context.strokeRect(15, 14, width - 30, height - 28);
    context.fillStyle = "#00f6a1";
    context.font = "52px monospace";
    context.textAlign = "center";
    context.fillText("{ }", width / 2, 192);
    context.fillStyle = "#c9dfcf";
    context.font = "18px monospace";
    ["eat", "code", "sleep"].forEach((line, index) => context.fillText(line, width / 2, 280 + index * 32));
  });
  const frames: { position: Point3; size: Point3; surface: THREE.Material }[] = [
    { position: [-0.29, 2.19, -1.2], size: [0.3, 0.85, 0.03], surface: new THREE.MeshStandardMaterial({ map: posterTexture, roughness: 0.65 }) },
    { position: [0.005, 1.95, -1.19], size: [0.37, 0.76, 0.03], surface: material("#458ce3") },
  ];
  for (const { position, size, surface } of frames) {
    box(backWall, [size[0] + 0.04, size[1] + 0.04, size[2]], trim, position, 0.004);
    mesh(backWall, new THREE.PlaneGeometry(size[0], size[1]), surface, [position[0], position[1], position[2] + 0.018]);
  }

  const shelf = new THREE.Group();
  shelf.position.set(2.54, 2.75, -1.06);
  backWall.add(shelf);
  box(shelf, [1.18, 0.055, 0.34], material("#282e30", { roughness: 0.48 }), [0, 0, 0], 0.009);
  box(shelf, [1.18, 0.013, 0.025], material("#c5fff2", { emissive: "#8bf4d6", emissiveIntensity: 0.35 }), [0, -0.047, 0.16], 0.003);
  ["#26bf8b", "#287cf2", "#a064d4", "#e4bf6b"].forEach((color, index) => {
    const book = box(shelf, [0.085, 0.4 + (index % 2) * 0.045, 0.22], material(color, { roughness: 0.7 }), [-0.35 + index * 0.1, 0.23, 0], 0.008);
    book.rotation.z = -0.08;
  });

  // Completed room walls become cutaways as the camera crosses their planes.
  // This gives the camera a complete orbit without an opaque wall hiding the desk.
  const sideWalls = [
    { name: "room-left-wall", size: [0.08, 3.8, 6.9] as Point3, position: [-5.5, 1.9, 2.15] as Point3, normal: [1, 0, 0] as Point3, color: "#d0d4ca" },
    { name: "room-right-wall", size: [0.08, 3.8, 6.9] as Point3, position: [4, 1.9, 2.15] as Point3, normal: [-1, 0, 0] as Point3, color: "#b6c8bd" },
    { name: "room-front-wall", size: [9.5, 3.8, 0.08] as Point3, position: [-0.75, 1.9, 5.6] as Point3, normal: [0, 0, -1] as Point3, color: "#cbd2c7" },
  ];
  const wallPlanes = [{ group: backWall, normal: new THREE.Vector3(0, 0, 1), point: new THREE.Vector3(0, 0, -1.3) }];
  for (const config of sideWalls) {
    const group = new THREE.Group();
    group.name = config.name;
    scene.add(group);
    // Materials are private to each wall so fading never changes other surfaces.
    const paint = new THREE.MeshStandardMaterial({ color: config.color, roughness: 0.95 });
    box(group, config.size, paint, config.position, 0);
    const skirting = new THREE.MeshStandardMaterial({ color: "#e3e5dc", roughness: 0.8 });
    box(group, [config.size[0], 0.075, config.size[2]], skirting, [config.position[0], 0.038, config.position[2]], 0);
    wallPlanes.push({ group, normal: new THREE.Vector3(...config.normal), point: new THREE.Vector3(...config.position) });

    if (config.name === "room-right-wall") {
      const windowFrame = new THREE.Group();
      windowFrame.position.set(3.945, 2.08, 2.1);
      windowFrame.rotation.y = -Math.PI / 2;
      group.add(windowFrame);
      const windowTrim = new THREE.MeshStandardMaterial({ color: "#e8e9df", roughness: 0.65 });
      const glass = new THREE.MeshBasicMaterial({ color: "#9bbeb9" });
      box(windowFrame, [2.1, 1.5, 0.04], windowTrim, [0, 0, 0], 0.012);
      mesh(windowFrame, new THREE.PlaneGeometry(1.94, 1.34), glass, [0, 0, 0.024]);
      box(windowFrame, [0.035, 1.34, 0.045], windowTrim, [0, 0, 0.035], 0.002);
      box(windowFrame, [2.2, 0.06, 0.19], windowTrim, [0, -0.76, 0.07], 0.006);
      for (let slat = 0; slat < 6; slat++) {
        const blind = box(windowFrame, [1.93, 0.065, 0.025], windowTrim, [0, 0.58 - slat * 0.11, 0.06], 0.003);
        blind.rotation.x = 0.25;
      }
    }
    if (config.name === "room-front-wall") {
      const frameMaterial = new THREE.MeshStandardMaterial({ color: "#e8e9de", roughness: 0.7 });
      for (let index = 0; index < 3; index++) {
        const art = new THREE.Group();
        art.position.set(-1.1 + index * 1.05, 2.12, 5.54);
        art.rotation.y = Math.PI;
        group.add(art);
        box(art, [0.64, 0.88, 0.035], frameMaterial, [0, 0, 0], 0.006);
        mesh(art, new THREE.PlaneGeometry(0.54, 0.78), new THREE.MeshStandardMaterial({ color: ["#357d69", "#457897", "#ae9470"][index], roughness: 0.9 }), [0, 0, 0.02]);
        const motif = mesh(art, new THREE.TorusGeometry(0.15, 0.012, 8, 32), frameMaterial, [0, 0, 0.03]);
        motif.castShadow = false;
      }
    }
  }

  const cutaways = wallPlanes.map(({ group, normal, point }) => {
    const surfaces = new Set<THREE.Material>();
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        for (const surface of Array.isArray(object.material) ? object.material : [object.material]) surfaces.add(surface);
      }
    });
    group.userData.cutawayPlane = [...normal.toArray(), -normal.dot(point)];
    const materials = [...surfaces].map((surface) => {
      const entry = { surface, opacity: surface.opacity, depthWrite: surface.depthWrite };
      surface.transparent = true;
      return entry;
    });
    return { group, normal, point, materials, opacity: 1 };
  });
  const offset = new THREE.Vector3();

  return {
    update(cameraPosition: THREE.Vector3) {
      let changed = false;
      for (const wall of cutaways) {
        const distance = offset.subVectors(cameraPosition, wall.point).dot(wall.normal);
        const opacity = THREE.MathUtils.smoothstep(distance, 0.15, 0.9);
        if (Math.abs(opacity - wall.opacity) < 0.001) continue;
        wall.opacity = opacity;
        wall.group.visible = opacity > 0.001;
        for (const { surface, opacity: base, depthWrite } of wall.materials) {
          surface.opacity = base * opacity;
          surface.depthWrite = depthWrite && opacity > 0.99;
        }
        changed = true;
      }
      return changed;
    },
  };
}
