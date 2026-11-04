import * as THREE from "three";
import type { GeometryKit, Point3 } from "./geometry";
import { KEYBOARD_LAYOUT, type KeyboardRig } from "./layout";
import { makeScreen, makeWoodTexture } from "./textures";

export function createWorkstation(scene: THREE.Scene, kit: GeometryKit) {
  const { material, mesh, box, sphere, cylinder, tube } = kit;
  const black = material("#171d22", { roughness: 0.4, metalness: 0.28 });
  const blackMatte = material("#252b2f", { roughness: 0.85 });
  const mint = material("#9de8db", { emissive: "#69d9cc", emissiveIntensity: 0.65, metalness: 0.2 });
  const ivory = material("#d4d5cb", { roughness: 0.55, metalness: 0.15 });
  const desk = new THREE.Group();
  desk.name = "workstation";
  scene.add(desk);
  const connectors = new Map<string, THREE.Object3D>();
  function connector(parent: THREE.Object3D, name: string, position: Point3, normal: Point3, width = 0.038, height = 0.018) {
    const group = new THREE.Group();
    group.name = `${name}-connector`;
    group.position.set(...position);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...normal));
    parent.add(group);
    box(group, [width + 0.009, height + 0.008, 0.006], material("#687376", { metalness: 0.65, roughness: 0.35 }), [0, 0, 0], 0.002);
    box(group, [width, height, 0.012], black, [0, 0, 0.007], 0.002);
    box(group, [width * 0.86, height * 0.86, 0.023], blackMatte, [0, 0, 0.021], 0.004);
    const exit = new THREE.Object3D();
    exit.name = `${name}-cable-anchor`;
    exit.position.z = 0.034;
    group.add(exit);
    connectors.set(name, exit);
    return exit;
  }

  // Cables pass through these actual desktop holes into the under-desk tray.
  const grommets = [-0.85, 0.65, 1.585];
  const outline = new THREE.Shape();
  outline.moveTo(-1.68, 0.98);
  outline.lineTo(2.78, 0.98);
  outline.quadraticCurveTo(2.84, 0.98, 2.84, 0.92);
  outline.lineTo(2.84, -1.02);
  outline.quadraticCurveTo(2.84, -1.1, 2.76, -1.1);
  outline.lineTo(0.02, -1.1);
  outline.quadraticCurveTo(-0.09, -1.1, -0.15, -1.01);
  outline.lineTo(-1.72, 0.26);
  outline.lineTo(-1.74, 0.92);
  outline.quadraticCurveTo(-1.74, 0.98, -1.68, 0.98);
  for (const x of grommets) {
    const hole = new THREE.Path();
    hole.absellipse(x, 0.78, 0.042, 0.042, 0, Math.PI * 2, true, 0);
    outline.holes.push(hole);
  }
  const desktop = mesh(desk, new THREE.ExtrudeGeometry(outline, { depth: 0.08, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, steps: 1 }), new THREE.MeshStandardMaterial({ map: makeWoodTexture(), color: "#fff0db", roughness: 0.48 }), [0, 0.728, 0]);
  desktop.rotation.x = -Math.PI / 2;
  for (const x of grommets) {
    const rim = mesh(desk, new THREE.TorusGeometry(0.043, 0.006, 8, 24), black, [x, 0.823, -0.78]);
    rim.rotation.x = Math.PI / 2;
  }
  for (const x of [0.12, 2.2]) {
    box(desk, [0.11, 0.72, 1.29], ivory, [x, 0.36, -0.03], 0.018);
    box(desk, [0.36, 0.045, 1.45], ivory, [x, 0.025, -0.03], 0.015);
  }
  box(desk, [3.1, 0.075, 0.08], blackMatte, [0.23, 0.62, -0.58], 0.006);
  box(desk, [1.65, 0.012, 0.86], material("#2d3031", { roughness: 0.95 }), [0.39, 0.827, 0.22], 0.018);

  const editor = makeScreen("editor");
  const terminal = makeScreen("terminal");
  function monitor(name: string, width: number, height: number, texture: THREE.Texture, position: Point3, rotation = 0) {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(...position);
    group.rotation.y = rotation;
    desk.add(group);
    box(group, [width + 0.045, height + 0.045, 0.052], black, [0, 0, 0], 0.015);
    const screen = mesh(group, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), [0, 0, 0.027]);
    screen.castShadow = false;
    box(group, [width * 0.65, height * 0.5, 0.025], blackMatte, [0, 0, -0.037], 0.012);
    for (let index = 0; index < 6; index++) {
      box(group, [width * 0.5, 0.006, 0.004], black, [0, height * 0.18 - index * 0.018, -0.052], 0.001);
    }
    for (const x of [-width * 0.44, width * 0.44]) {
      for (const y of [-height * 0.4, height * 0.4]) {
        const screw = cylinder(group, 0.005, 0.005, 0.004, material("#697274", { metalness: 0.65 }), [x, y, -0.028]);
        screw.rotation.x = Math.PI / 2;
      }
    }
    connector(group, `${name}-display`, [-Math.min(0.08, width * 0.17), -height * 0.18, -0.054], [0, 0, -1]);
    connector(group, `${name}-power`, [Math.min(0.07, width * 0.17), -height * 0.18, -0.054], [0, 0, -1], 0.025, 0.022);
    const standHeight = position[1] - height / 2 - 0.835;
    box(group, [0.055, standHeight + 0.04, 0.045], black, [0, -height / 2 - standHeight / 2, -0.035], 0.008);
    box(group, [width * 0.45, 0.022, 0.27], black, [0, 0.841 - position[1], 0.01], 0.014);
    sphere(group, [0.005, 0.003, 0.002], mint, [width / 2 - 0.03, -height / 2 - 0.011, 0.028]);
  }
  monitor("main-monitor", 1.75, 1.1, editor.texture, [0.65, 1.74, -0.43]);
  monitor("portrait-monitor", 0.43, 0.98, terminal.texture, [-0.8, 1.82, -0.48], 0.13);
  box(desk, [0.12, 0.22, 0.13], blackMatte, [-0.6, 0.94, -0.2], 0.02);

  const keyboardGroup = new THREE.Group();
  keyboardGroup.name = "keyboard";
  keyboardGroup.position.set(...KEYBOARD_LAYOUT.position);
  keyboardGroup.rotation.y = KEYBOARD_LAYOUT.rotationY;
  keyboardGroup.scale.setScalar(KEYBOARD_LAYOUT.scale);
  desk.add(keyboardGroup);
  box(keyboardGroup, [0.49, 0.025, 0.195], black, [0, 0, 0], 0.008);
  connector(keyboardGroup, "keyboard-usb", [0, 0, -0.1], [0, 0, -1], 0.022, 0.01);
  const keyGeometry = new THREE.BoxGeometry(0.026, KEYBOARD_LAYOUT.keyHeight, 0.025);
  const keys = new THREE.InstancedMesh(keyGeometry, material("#ecedeb", { roughness: 0.55 }), KEYBOARD_LAYOUT.rows * KEYBOARD_LAYOUT.columns);
  keys.name = "keyboard-keys";
  keys.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const keyPresses = new Float32Array(keys.count);
  const keyTransform = new THREE.Object3D();
  function updateKey(index: number) {
    const row = Math.floor(index / KEYBOARD_LAYOUT.columns);
    const column = index % KEYBOARD_LAYOUT.columns;
    keyTransform.position.set(
      KEYBOARD_LAYOUT.startX + column * KEYBOARD_LAYOUT.pitchX,
      KEYBOARD_LAYOUT.restKeyY - keyPresses[index] * KEYBOARD_LAYOUT.travel,
      KEYBOARD_LAYOUT.startZ + row * KEYBOARD_LAYOUT.pitchZ,
    );
    keyTransform.updateMatrix();
    keys.setMatrixAt(index, keyTransform.matrix);
  }
  for (let index = 0; index < keys.count; index++) updateKey(index);
  const keyboard: KeyboardRig = {
    getKeyWorldPosition(row, column, target) {
      const index = row * KEYBOARD_LAYOUT.columns + column;
      target.set(
        KEYBOARD_LAYOUT.startX + column * KEYBOARD_LAYOUT.pitchX,
        KEYBOARD_LAYOUT.restKeyY + KEYBOARD_LAYOUT.keyHeight / 2 - (keyPresses[index] ?? 0) * KEYBOARD_LAYOUT.travel,
        KEYBOARD_LAYOUT.startZ + row * KEYBOARD_LAYOUT.pitchZ,
      );
      return keyboardGroup.localToWorld(target);
    },
    setPressedKeys(presses) {
      for (let index = 0; index < keyPresses.length; index++) {
        if (keyPresses[index] !== 0) { keyPresses[index] = 0; updateKey(index); }
      }
      for (const { row, column, amount } of presses) {
        if (row < 0 || row >= KEYBOARD_LAYOUT.rows || column < 0 || column >= KEYBOARD_LAYOUT.columns) continue;
        const index = row * KEYBOARD_LAYOUT.columns + column;
        keyPresses[index] = THREE.MathUtils.clamp(amount, 0, 1);
        updateKey(index);
      }
      keys.instanceMatrix.needsUpdate = true;
    }
  };
  keys.castShadow = true;
  keys.receiveShadow = true;
  keyboardGroup.add(keys);
  const mouse = new THREE.Group();
  mouse.name = "mouse";
  mouse.position.set(0.5, 0.852, 0.42);
  desk.add(mouse);
  box(mouse, [0.081, 0.028, 0.12], blackMatte, [0, 0, 0], 0.018);
  box(mouse, [0.002, 0.006, 0.033], black, [0, 0.014, -0.032], 0);
  connector(mouse, "mouse-usb", [0, 0, -0.061], [0, 0, -1], 0.014, 0.01);
  const ceramic = material("#eeefeb", { roughness: 0.3 });
  const cup = mesh(desk, new THREE.CylinderGeometry(0.052, 0.044, 0.135, 32, 1, true), ceramic, [0.78, 0.895, 0.61]);
  cup.material.side = THREE.DoubleSide;
  mesh(desk, new THREE.TorusGeometry(0.05, 0.003, 8, 32), ceramic, [0.78, 0.964, 0.61]).rotation.x = Math.PI / 2;
  cylinder(desk, 0.045, 0.045, 0.004, material("#bfc2bc"), [0.78, 0.947, 0.61]);
  box(desk, [0.22, 0.026, 0.155], material("#7058d0"), [-0.62, 0.843, 0.04], 0.008);
  box(desk, [0.204, 0.015, 0.147], material("#d6caff"), [-0.62, 0.864, 0.04], 0.003);
  box(desk, [0.21, 0.008, 0.15], material("#7489e7"), [-0.62, 0.877, 0.04], 0.004);

  // The glass is on the left side; the front panel points to screen-right.
  const tower = new THREE.Group();
  tower.name = "pc-tower";
  tower.position.set(2.12, 1.378, -0.4);
  tower.rotation.y = Math.PI / 2;
  tower.scale.setScalar(1.1);
  desk.add(tower);
  const shell = material("#1c2428", { metalness: 0.55, roughness: 0.36 });
  const edge = material("#455055", { metalness: 0.6, roughness: 0.3 });
  const cavity = material("#10191b", { metalness: 0.3, roughness: 0.68 });
  box(tower, [0.52, 0.025, 0.84], shell, [0, -0.47, 0], 0.009);
  box(tower, [0.52, 0.033, 0.84], shell, [0, 0.47, 0], 0.009);
  box(tower, [0.018, 0.94, 0.84], cavity, [0.25, 0, 0], 0.004);
  box(tower, [0.52, 0.94, 0.022], shell, [0, 0, -0.41], 0.008);
  box(tower, [0.52, 0.94, 0.035], shell, [0, 0, 0.405], 0.012);
  for (const x of [-0.18, 0.18]) {
    for (const z of [-0.30, 0.30]) box(tower, [0.07, 0.025, 0.075], black, [x, -0.494, z], 0.006);
  }
  // Rear hardware is complete because visitors can orbit behind the workstation.
  box(tower, [0.20, 0.30, 0.008], edge, [-0.095, 0.20, -0.425], 0.006);
  connector(tower, "pc-keyboard", [-0.13, 0.24, -0.433], [0, 0, -1], 0.032, 0.014);
  connector(tower, "pc-mouse", [-0.055, 0.24, -0.433], [0, 0, -1], 0.032, 0.014);
  connector(tower, "pc-display-main", [-0.07, -0.08, -0.426], [0, 0, -1]);
  connector(tower, "pc-display-portrait", [0.08, -0.08, -0.426], [0, 0, -1]);
  connector(tower, "pc-power", [0, -0.35, -0.426], [0, 0, -1], 0.048, 0.031);
  for (let index = 0; index < 4; index++) {
    box(tower, [0.34, 0.018, 0.006], edge, [0, -0.14 - index * 0.031, -0.425], 0.002);
  }
  mesh(tower, new THREE.TorusGeometry(0.078, 0.006, 8, 28), edge, [0.135, 0.26, -0.427]);
  for (let index = 0; index < 5; index++) {
    const y = 0.26 - 0.048 + index * 0.024;
    box(tower, [0.12, 0.006, 0.004], black, [0.135, y, -0.434], 0.001);
  }
  for (const x of [-0.23, 0.23]) {
    for (const y of [-0.43, 0.43]) {
      const screw = cylinder(tower, 0.009, 0.009, 0.007, edge, [x, y, -0.43]);
      screw.rotation.x = Math.PI / 2;
    }
  }
  for (const y of [-0.46, 0.46]) box(tower, [0.018, 0.022, 0.84], edge, [-0.264, y, 0], 0.004);
  for (const z of [-0.409, 0.409]) box(tower, [0.018, 0.94, 0.018], edge, [-0.264, 0, z], 0.004);
  for (let vent = 0; vent < 9; vent++) box(tower, [0.43, 0.007, 0.025], cavity, [0, 0.49, -0.34 + vent * 0.078], 0.003);
  for (let port = 0; port < 3; port++) {
    box(tower, [0.072, 0.028, 0.006], edge, [0.13, 0.2 - port * 0.058, 0.426], 0.002);
    box(tower, [0.057, 0.014, 0.008], material("#2f8de7", { emissive: "#2474cc", emissiveIntensity: 0.5 }), [0.13, 0.2 - port * 0.058, 0.431], 0.001);
  }
  const power = cylinder(tower, 0.015, 0.015, 0.007, cavity, [0.13, -0.014, 0.429]);
  power.rotation.x = Math.PI / 2;
  for (let vent = 0; vent < 7; vent++) box(tower, [0.38, 0.012, 0.007], cavity, [0, -0.22 - vent * 0.027, 0.428], 0.002);
  sphere(tower, [0.009, 0.009, 0.004], material("#ff9c39", { emissive: "#ff651f", emissiveIntensity: 1.1 }), [-0.15, -0.41, 0.43]);
  box(tower, [0.012, 0.72, 0.66], material("#163b35", { metalness: 0.3 }), [0.225, 0.03, -0.03], 0.002);
  box(tower, [0.46, 0.13, 0.77], edge, [0, -0.385, 0], 0.012);
  box(tower, [0.43, 0.009, 0.69], mint, [-0.005, -0.312, -0.02], 0.002);

  function ring(parent: THREE.Object3D, radius: number, surface: THREE.Material, position: Point3) {
    const result = mesh(parent, new THREE.TorusGeometry(radius, 0.006, 8, 32), surface, position);
    result.rotation.y = Math.PI / 2;
    return result;
  }
  const fans: THREE.Group[] = [];
  function fan(position: Point3) {
    const frame = new THREE.Group();
    frame.position.set(...position);
    tower.add(frame);
    ring(frame, 0.129, black, [0, 0, 0]);
    ring(frame, 0.118, mint, [-0.008, 0, 0]);
    const rotor = new THREE.Group();
    frame.add(rotor);
    const blade = new THREE.Shape();
    blade.moveTo(0.015, 0.014);
    blade.bezierCurveTo(0.09, 0.012, 0.13, 0.055, 0.092, 0.085);
    blade.quadraticCurveTo(0.032, 0.064, 0.015, 0.014);
    const bladeGeometry = new THREE.ShapeGeometry(blade);
    for (let index = 0; index < 7; index++) {
      const bladeMesh = mesh(rotor, bladeGeometry, material("#7bcabc", { side: THREE.DoubleSide, metalness: 0.3, roughness: 0.5 }));
      bladeMesh.rotation.set(0, -Math.PI / 2, 0);
      bladeMesh.rotateZ((index / 7) * Math.PI * 2);
    }
    cylinder(rotor, 0.03, 0.03, 0.024, edge, [0, 0, 0]).rotation.z = Math.PI / 2;
    fans.push(rotor);
  }
  fan([-0.17, 0.22, 0.24]);
  fan([-0.17, -0.1, 0.24]);
  cylinder(tower, 0.076, 0.076, 0.055, black, [0.15, 0.2, -0.17]).rotation.z = Math.PI / 2;
  ring(tower, 0.067, mint, [0.117, 0.2, -0.17]);
  for (let ram = 0; ram < 3; ram++) {
    box(tower, [0.04, 0.23, 0.017], black, [0.185, 0.17, -0.04 + ram * 0.03], 0.003);
    box(tower, [0.043, 0.21, 0.005], mint, [0.162, 0.18, -0.04 + ram * 0.03], 0.002);
  }
  box(tower, [0.32, 0.075, 0.48], black, [0.03, -0.105, -0.08], 0.008);
  box(tower, [0.33, 0.008, 0.44], mint, [0.03, -0.06, -0.08], 0.002);
  box(tower, [0.30, 0.055, 0.40], blackMatte, [0.05, 0.405, -0.13], 0.008);
  for (const z of [-0.2, -0.16]) {
    tube(tower, [[0.122, 0.23, z], [0.04, 0.26, z], [-0.045, 0.34, z], [-0.095, 0.39, z]], 0.011, black, 18);
  }
  for (let wire = 0; wire < 5; wire++) {
    tube(tower, [[0.05, -0.12, -0.22 + wire * 0.015], [-0.09, -0.17, -0.22 + wire * 0.015], [-0.1, -0.34, -0.19 + wire * 0.015]], 0.004, black, 14);
  }
  const glass = box(tower, [0.007, 0.9, 0.79], new THREE.MeshPhysicalMaterial({ color: "#bce7e3", transparent: true, opacity: 0.075, roughness: 0.18, metalness: 0.1, depthWrite: false }), [-0.268, 0, 0], 0);
  glass.castShadow = false;

  box(desk, [2.7, 0.02, 0.2], blackMatte, [0.35, 0.60, -0.8], 0.003);
  for (const z of [-0.9, -0.7]) box(desk, [2.7, 0.085, 0.01], blackMatte, [0.35, 0.64, z], 0.003);
  for (const x of [-0.75, 0.55, 1.55]) box(desk, [0.025, 0.12, 0.018], black, [x, 0.665, -0.9], 0.002);

  const powerStrip = new THREE.Group();
  powerStrip.name = "power-strip";
  powerStrip.position.set(2.1, 0.675, -0.8);
  desk.add(powerStrip);
  box(powerStrip, [0.56, 0.065, 0.14], material("#d8dbd5", { roughness: 0.75 }), [0, 0, 0], 0.015);
  box(powerStrip, [0.48, 0.013, 0.10], black, [0, 0.039, 0], 0.004);
  connector(powerStrip, "strip-main", [-0.17, -0.035, 0], [0, -1, 0], 0.045, 0.04);
  connector(powerStrip, "strip-portrait", [0, -0.035, 0], [0, -1, 0], 0.045, 0.04);
  connector(powerStrip, "strip-tower", [0.17, -0.035, 0], [0, -1, 0], 0.045, 0.04);
  connector(powerStrip, "strip-mains", [0.282, 0, 0], [1, 0, 0], 0.02, 0.02);
  sphere(powerStrip, [0.007, 0.003, 0.007], material("#83d09c", { emissive: "#3b9c68", emissiveIntensity: 0.3 }), [-0.24, -0.034, 0]);

  const floorSocket = new THREE.Group();
  floorSocket.name = "floor-power-outlet";
  floorSocket.position.set(2.2, 0.006, -0.87);
  desk.add(floorSocket);
  box(floorSocket, [0.14, 0.012, 0.14], material("#a5aaa4", { roughness: 0.7, metalness: 0.3 }), [0, 0, 0], 0.005);
  connector(floorSocket, "floor-mains", [0, 0.009, 0], [0, 1, 0], 0.042, 0.042);

  function connectCable(name: string, from: string, to: string, via: readonly Point3[], radius = 0.0055) {
    const start = connectors.get(from);
    const end = connectors.get(to);
    if (!start || !end) throw new Error(`Missing connector for ${name}`);
    start.updateWorldMatrix(true, false);
    end.updateWorldMatrix(true, false);
    const first = start.getWorldPosition(new THREE.Vector3());
    const last = end.getWorldPosition(new THREE.Vector3());
    const exitDirection = new THREE.Vector3(0, 0, 1).transformDirection(start.matrixWorld);
    const entryDirection = new THREE.Vector3(0, 0, 1).transformDirection(end.matrixWorld);
    const points = [
      first,
      first.clone().addScaledVector(exitDirection, 0.04),
      ...via.map((point) => new THREE.Vector3(...point)),
      last.clone().addScaledVector(entryDirection, 0.04),
      last,
    ].map((point) => desk.worldToLocal(point));
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    const cable = mesh(desk, new THREE.TubeGeometry(curve, Math.max(36, points.length * 6), radius, 6, false), material("#202725", { roughness: 0.85 }));
    cable.name = `cable-${name}`;
    cable.userData.fromAnchor = start.name;
    cable.userData.toAnchor = end.name;
    cable.userData.connected = true;
  }

  connectCable("main-display", "main-monitor-display", "pc-display-main", [
    [0.57, 1.05, -0.58], [0.65, 0.89, -0.75], [0.65, 0.82, -0.78], [0.65, 0.68, -0.78],
    [0.95, 0.635, -0.80], [1.42, 0.635, -0.80], [1.575, 0.69, -0.78], [1.575, 0.86, -0.78], [1.585, 1.08, -0.68],
  ]);
  connectCable("portrait-display", "portrait-monitor-display", "pc-display-portrait", [
    [-0.88, 1.1, -0.61], [-0.86, 0.89, -0.75], [-0.86, 0.82, -0.78], [-0.86, 0.68, -0.78],
    [-0.45, 0.64, -0.82], [1.35, 0.64, -0.82], [1.59, 0.69, -0.78], [1.59, 0.86, -0.78], [1.585, 1.08, -0.68],
  ]);
  connectCable("keyboard-usb", "keyboard-usb", "pc-keyboard", [
    [-0.15, 0.844, 0.05], [-0.39, 0.838, -0.25], [-0.50, 0.838, -0.66], [-0.83, 0.838, -0.78], [-0.83, 0.68, -0.78],
    [-0.45, 0.635, -0.76], [1.35, 0.635, -0.76], [1.60, 0.69, -0.78], [1.60, 0.86, -0.78], [1.585, 1.35, -0.67],
  ], 0.004);
  connectCable("mouse-usb", "mouse-usb", "pc-mouse", [
    [0.65, 0.839, 0.18], [1.10, 0.838, -0.18], [1.13, 0.838, -0.66], [0.67, 0.838, -0.78], [0.67, 0.68, -0.78],
    [1.0, 0.64, -0.74], [1.4, 0.64, -0.74], [1.605, 0.69, -0.78], [1.605, 0.86, -0.78], [1.59, 1.36, -0.65],
  ], 0.004);
  connectCable("main-power", "main-monitor-power", "strip-main", [
    [0.72, 1.05, -0.58], [0.635, 0.89, -0.75], [0.635, 0.82, -0.78], [0.635, 0.68, -0.78],
    [1.1, 0.645, -0.85], [1.72, 0.645, -0.85], [1.8, 0.58, -0.83],
  ]);
  connectCable("portrait-power", "portrait-monitor-power", "strip-portrait", [
    [-0.72, 1.10, -0.61], [-0.85, 0.89, -0.765], [-0.85, 0.82, -0.765], [-0.85, 0.68, -0.765],
    [-0.4, 0.645, -0.86], [1.73, 0.645, -0.86], [1.83, 0.58, -0.84],
  ]);
  connectCable("tower-power", "pc-power", "strip-tower", [
    [1.58, 0.92, -0.63], [1.585, 0.85, -0.795], [1.585, 0.69, -0.795], [1.75, 0.64, -0.84], [1.9, 0.565, -0.88],
  ], 0.007);
  connectCable("strip-mains", "strip-mains", "floor-mains", [
    [2.46, 0.58, -0.81], [2.27, 0.48, -0.74], [2.27, 0.2, -0.74], [2.23, 0.12, -0.81],
  ], 0.007);
  for (const y of [0.22, 0.44]) box(desk, [0.026, 0.018, 0.028], black, [2.27, y, -0.74], 0.004);

  return {
    keyboard,
    update(time: number, reducedMotion: boolean) {
      fans.forEach((fan) => { fan.rotation.x = reducedMotion ? 0 : time * 3; });
    },
    updateScreens(time: number) {
      editor.update(time);
      terminal.update(time);
    },
  };
}
