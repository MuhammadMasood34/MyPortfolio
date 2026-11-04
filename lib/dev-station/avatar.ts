import * as THREE from "three";
import type { GeometryKit, Point3 } from "./geometry";
import { makeFabricTexture } from "./textures";

function faceShape(points: readonly (readonly [number, number])[]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/** Sculpted locks taper at their tips instead of ending in blunt tubes. */
function hairLock(points: readonly Point3[], radius: number) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.TubeGeometry(curve, 24, radius, 10, false);
  const frames = curve.computeFrenetFrames(24, false);
  const positions = geometry.getAttribute("position");
  for (let ring = 0; ring <= 24; ring++) {
    const t = ring / 24;
    const center = curve.getPointAt(t);
    const thickness = radius * (0.16 + Math.pow(Math.sin(Math.PI * t), 0.6) * 0.84);
    for (let side = 0; side <= 10; side++) {
      const angle = (side / 10) * Math.PI * 2;
      const vertex = center.clone()
        .addScaledVector(frames.normals[ring], -Math.cos(angle) * thickness)
        .addScaledVector(frames.binormals[ring], Math.sin(angle) * thickness);
      positions.setXYZ(ring * 11 + side, vertex.x, vertex.y, vertex.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function createAvatar(scene: THREE.Scene, kit: GeometryKit) {
  const { material, mesh, box, sphere, cylinder, segment, tube } = kit;
  const avatar = new THREE.Group();
  avatar.name = "developer";
  avatar.position.set(-0.7, 0, 1.3);
  avatar.rotation.y = 0.48;
  avatar.scale.setScalar(1.2);
  scene.add(avatar);

  const upholstery = new THREE.MeshStandardMaterial({ color: "#484b4d", map: makeFabricTexture(), roughness: 0.96 });
  const chairFrame = material("#252a2c", { metalness: 0.25, roughness: 0.48 });
  const chrome = material("#8e989c", { metalness: 0.75, roughness: 0.24 });
  box(avatar, [0.65, 0.12, 0.61], upholstery, [0, 0.48, 0], 0.055);
  const back = box(avatar, [0.66, 0.86, 0.16], upholstery, [0, 0.98, -0.22], 0.075);
  back.rotation.x = -0.1;
  box(avatar, [0.54, 0.54, 0.03], upholstery, [0, 1.05, -0.12], 0.025);
  cylinder(avatar, 0.036, 0.045, 0.35, chrome, [0, 0.27, 0]);
  cylinder(avatar, 0.06, 0.06, 0.2, chairFrame, [0, 0.2, 0]);
  for (let index = 0; index < 5; index++) {
    const leg = new THREE.Group();
    leg.rotation.y = (index / 5) * Math.PI * 2;
    avatar.add(leg);
    segment(leg, [0, 0.13, 0], [0.4, 0.09, 0], 0.027, chairFrame, 0.022);
    const wheels = cylinder(leg, 0.051, 0.051, 0.075, chairFrame, [0.4, 0.065, 0]);
    wheels.rotation.x = Math.PI / 2;
    tube(leg, [[0.4, 0.066, -0.039], [0.43, 0.1, -0.039], [0.45, 0.066, -0.039]], 0.005, chrome, 12);
  }
  for (const side of [-1, 1]) {
    box(avatar, [0.085, 0.06, 0.36], chairFrame, [side * 0.38, 0.75, 0.04], 0.03);
    segment(avatar, [side * 0.33, 0.5, -0.08], [side * 0.37, 0.72, 0.03], 0.025, chairFrame);
  }

  const body = new THREE.Group();
  avatar.add(body);
  const skin = material("#f3bd94", { roughness: 0.48 });
  const skinWarm = material("#e8aa82", { roughness: 0.52 });
  const white = material("#f8f9f5", { roughness: 0.82 });
  const seam = material("#d5dad7", { roughness: 0.82 });
  const navy = material("#233452", { roughness: 0.88 });
  const blue = material("#2459b3", { roughness: 0.5 });
  const belt = material("#342c26", { roughness: 0.65 });
  box(body, [0.47, 0.52, 0.29], white, [0, 0.94, 0.005], 0.095);
  box(body, [0.46, 0.16, 0.32], navy, [0, 0.59, 0.04], 0.065);
  box(body, [0.475, 0.043, 0.31], belt, [0, 0.655, 0.035], 0.012);
  box(body, [0.066, 0.052, 0.015], chrome, [0, 0.655, 0.197], 0.004);
  box(body, [0.042, 0.031, 0.019], belt, [0, 0.655, 0.201], 0.002);
  cylinder(body, 0.069, 0.075, 0.12, skin, [0, 1.23, 0]);
  for (const side of [-1, 1]) {
    mesh(body, faceShape([[0, 0], [side * 0.13, -0.06], [side * 0.07, -0.15], [0, -0.08]]), white, [0, 1.22, 0.153]);
    segment(body, [side * 0.115, 0.54, 0.05], [side * 0.145, 0.49, 0.44], 0.127, navy, 0.12);
    segment(body, [side * 0.145, 0.49, 0.44], [side * 0.15, 0.14, 0.5], 0.112, navy, 0.086);
    box(body, [0.165, 0.085, 0.27], material("#19232e", { roughness: 0.65 }), [side * 0.15, 0.093, 0.56], 0.032);
    tube(body, [[side * 0.15, 0.47, 0.558], [side * 0.15, 0.32, 0.599], [side * 0.15, 0.18, 0.587]], 0.0025, material("#34445f"), 12);
  }
  mesh(body, faceShape([[-0.032, 0], [0.032, 0], [0.045, -0.3], [0, -0.35], [-0.045, -0.3]]), blue, [0, 1.14, 0.165]);
  sphere(body, [0.033, 0.035, 0.025], blue, [0, 1.155, 0.16]);
  tube(body, [[0, 1.11, 0.159], [0, 0.97, 0.159], [0, 0.71, 0.159]], 0.002, seam, 8);
  box(body, [0.095, 0.08, 0.007], white, [0.132, 1.02, 0.153], 0.008);
  box(body, [0.095, 0.004, 0.009], seam, [0.132, 1.06, 0.158], 0);

  // Crossed forearms are the resting pose in the supplied reference.
  for (const side of [-1, 1]) {
    const shoulder: Point3 = [side * 0.215, 1.11, 0.015];
    const elbow: Point3 = [side * 0.285, 0.88 + (side > 0 ? 0.015 : 0), 0.16];
    const wrist: Point3 = [-side * 0.145, 1.015, side > 0 ? 0.285 : 0.33];
    const cuff: Point3 = [elbow[0] * 0.62 + wrist[0] * 0.38, elbow[1] * 0.62 + wrist[1] * 0.38, elbow[2] * 0.62 + wrist[2] * 0.38];
    segment(body, shoulder, elbow, 0.095, white, 0.082);
    segment(body, elbow, cuff, 0.084, white, 0.074);
    segment(body, cuff, wrist, 0.069, skin, 0.052);
    const hand = sphere(body, [0.079, 0.043, 0.033], skin, wrist);
    hand.rotation.z = side * 0.35;
    for (let finger = 0; finger < 4; finger++) {
      segment(body, [wrist[0] - side * 0.018, wrist[1] + 0.024 - finger * 0.014, wrist[2] + 0.025],
        [wrist[0] - side * (0.07 - finger * 0.006), wrist[1] + 0.015 - finger * 0.014, wrist[2] + 0.025], 0.01, skin);
    }
  }

  const head = new THREE.Group();
  head.name = "developer-head";
  head.position.set(0, 1.52, 0.015);
  body.add(head);
  sphere(head, [0.287, 0.305, 0.26], skin, [0, 0, 0]);
  sphere(head, [0.22, 0.15, 0.21], skin, [0, -0.135, 0.025]);
  const hair = material("#754326", { roughness: 0.48 });
  const hairLight = material("#8c5030", { roughness: 0.46 });
  const eyes: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    sphere(head, [0.045, 0.074, 0.046], skin, [side * 0.285, -0.035, 0.005]);
    sphere(head, [0.018, 0.043, 0.025], skinWarm, [side * 0.307, -0.035, 0.025]);
    sphere(head, [0.047, 0.13, 0.09], hair, [side * 0.244, 0.099, -0.014]);
    const eye = new THREE.Group();
    eye.position.set(side * 0.108, 0.025, 0.224);
    eye.rotation.y = side * 0.13;
    head.add(eye);
    sphere(eye, [0.082, 0.099, 0.039], skinWarm, [0, 0, 0]);
    const whiteEye = sphere(eye, [0.074, 0.09, 0.037], material("#fffdf5", { roughness: 0.22 }), [0, 0, 0.008]);
    const iris = sphere(eye, [0.047, 0.06, 0.021], material("#784529", { roughness: 0.2 }), [0.005, -0.007, 0.039]);
    const pupil = sphere(eye, [0.033, 0.046, 0.012], material("#111315", { roughness: 0.16 }), [0.006, -0.004, 0.055]);
    const glint = sphere(eye, [0.014, 0.018, 0.007], material("#ffffff", { emissive: "#ffffff", emissiveIntensity: 0.2 }), [-0.009, 0.018, 0.066]);
    eyes.push(whiteEye, iris, pupil, glint);
    tube(head, [[side * 0.055, 0.153, 0.218], [side * 0.104, 0.173, 0.211], [side * 0.164, 0.151, 0.195]], 0.018, hair, 16);
    sphere(head, [0.04, 0.028, 0.01], material("#e8957d", { roughness: 0.86 }), [side * 0.175, -0.087, 0.212]);
  }
  sphere(head, [0.048, 0.044, 0.045], skinWarm, [0, -0.043, 0.267]);
  sphere(head, [0.035, 0.031, 0.028], skin, [0, -0.035, 0.291]);
  const smile = new THREE.Shape();
  smile.moveTo(-0.105, -0.085);
  smile.quadraticCurveTo(0, -0.126, 0.105, -0.085);
  smile.bezierCurveTo(0.088, -0.2, -0.083, -0.2, -0.105, -0.085);
  mesh(head, new THREE.ShapeGeometry(smile), material("#772d22", { side: THREE.DoubleSide }), [0, 0, 0.246]);
  const teeth = new THREE.Shape();
  teeth.moveTo(-0.086, -0.101);
  teeth.quadraticCurveTo(0, -0.13, 0.086, -0.101);
  teeth.quadraticCurveTo(0.075, -0.153, 0, -0.15);
  teeth.quadraticCurveTo(-0.075, -0.153, -0.086, -0.101);
  mesh(head, new THREE.ShapeGeometry(teeth), material("#fffaf0", { side: THREE.DoubleSide }), [0, 0, 0.248]);
  sphere(head, [0.042, 0.013, 0.004], material("#d9786a"), [0, -0.173, 0.25]);

  const cap = mesh(head, new THREE.SphereGeometry(0.302, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.36), hair, [0, 0.06, -0.035]);
  cap.scale.set(1.02, 1, 0.91);
  const locks: readonly (readonly Point3[])[] = [
    [[-0.27, 0.1, 0.02], [-0.31, 0.21, 0.13], [-0.12, 0.24, 0.255], [0.16, 0.26, 0.23], [0.24, 0.21, 0.04]],
    [[-0.29, 0.19, -0.02], [-0.26, 0.32, 0.12], [-0.04, 0.32, 0.23], [0.2, 0.32, 0.18], [0.21, 0.2, -0.02]],
    [[-0.23, 0.29, -0.06], [-0.22, 0.42, 0.12], [-0.04, 0.4, 0.2], [0.16, 0.4, 0.1], [0.19, 0.25, -0.04]],
    [[-0.12, 0.38, -0.05], [-0.13, 0.49, 0.09], [0.02, 0.46, 0.13], [0.15, 0.4, 0.05], [0.19, 0.25, -0.05]],
    [[0.05, 0.46, -0.08], [0.08, 0.51, 0.02], [0.23, 0.41, 0.08], [0.27, 0.21, -0.02]],
  ];
  locks.forEach((points, index) => {
    mesh(head, hairLock(points, index === 0 ? 0.066 : 0.075), index % 2 ? hair : hairLight);
    const groove = points.map(([x, y, z]) => [x, y + 0.026, z + 0.05] as const);
    tube(head, groove, 0.0025, material("#9c6340", { roughness: 0.6 }), 24);
  });

  return {
    update(time: number, reducedMotion: boolean) {
      body.position.y = reducedMotion ? 0 : Math.sin(time * 1.5) * 0.004;
      head.rotation.z = reducedMotion ? -0.025 : -0.025 + Math.sin(time * 0.7) * 0.015;
      const blinkTime = time % 5.4;
      const blink = !reducedMotion && blinkTime > 5.15 ? Math.max(0.12, Math.abs(blinkTime - 5.275) / 0.125) : 1;
      // Scale the whole eye group so highlights stay attached during a blink.
      for (const eye of eyes) if (eye.parent) eye.parent.scale.y = blink;
    },
  };
}
