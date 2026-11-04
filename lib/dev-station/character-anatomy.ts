import * as THREE from "three";
import type { GeometryKit, Point3 } from "./geometry";

const UP = new THREE.Vector3(0, 1, 0);

/** One closed surface follows the seated thigh, knee and lower leg. */
export function sweptGeometry(points: readonly Point3[], radii: readonly number[], steps = 32, sides = 16) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.TubeGeometry(curve, steps, 1, sides, false);
  const frames = curve.computeFrenetFrames(steps, false);
  const vertices = geometry.getAttribute("position");
  const center = new THREE.Vector3();
  for (let ring = 0; ring <= steps; ring++) {
    const t = ring / steps;
    const fraction = t * (radii.length - 1);
    const index = Math.min(radii.length - 2, Math.floor(fraction));
    const radius = THREE.MathUtils.lerp(radii[index], radii[index + 1], fraction - index);
    curve.getPointAt(t, center);
    for (let side = 0; side <= sides; side++) {
      const angle = side / sides * Math.PI * 2;
      vertices.setXYZ(ring * (sides + 1) + side,
        center.x + radius * (-Math.cos(angle) * frames.normals[ring].x + Math.sin(angle) * frames.binormals[ring].x),
        center.y + radius * (-Math.cos(angle) * frames.normals[ring].y + Math.sin(angle) * frames.binormals[ring].y),
        center.z + radius * (-Math.cos(angle) * frames.normals[ring].z + Math.sin(angle) * frames.binormals[ring].z));
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** A sleeve is one deforming cloth tube, with no exposed ball at the elbow. */
function makeSleeve(parent: THREE.Object3D, kit: GeometryKit, surface: THREE.Material) {
  const points = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35);
  const steps = 18;
  const sides = 12;
  const vertices = new Float32Array((steps + 1) * (sides + 1) * 3);
  const indices: number[] = [];
  for (let ring = 0; ring < steps; ring++) for (let side = 0; side < sides; side++) {
    const a = ring * (sides + 1) + side;
    const b = a + sides + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(indices);
  const sleeve = kit.mesh(parent, geometry, surface);
  sleeve.name = "continuous-shirt-sleeve";
  sleeve.frustumCulled = false;
  const center = new THREE.Vector3();
  const next = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const reference = new THREE.Vector3(0, 0, 1);
  return (shoulder: THREE.Vector3, elbow: THREE.Vector3, cuff: THREE.Vector3) => {
    points[0].copy(shoulder);
    points[1].copy(elbow);
    points[2].copy(cuff);
    for (let ring = 0; ring <= steps; ring++) {
      const t = ring / steps;
      curve.getPoint(t, center);
      curve.getPoint(Math.min(1, t + 0.002), next);
      if (ring === steps) {
        curve.getPoint(t - 0.002, next);
        tangent.copy(center).sub(next).normalize();
      } else tangent.copy(next).sub(center).normalize();
      if (ring === 0) {
        normal.crossVectors(tangent, reference);
        if (normal.lengthSq() < 0.001) normal.crossVectors(tangent, UP);
        normal.normalize();
      }
      binormal.crossVectors(tangent, normal).normalize();
      normal.crossVectors(binormal, tangent).normalize();
      const radius = t < 0.55 ? THREE.MathUtils.lerp(0.09, 0.08, t / 0.55) : THREE.MathUtils.lerp(0.08, 0.063, (t - 0.55) / 0.45);
      for (let side = 0; side <= sides; side++) {
        const angle = side / sides * Math.PI * 2;
        const offset = (ring * (sides + 1) + side) * 3;
        vertices[offset] = center.x + radius * (Math.cos(angle) * normal.x + Math.sin(angle) * binormal.x);
        vertices[offset + 1] = center.y + radius * (Math.cos(angle) * normal.y + Math.sin(angle) * binormal.y);
        vertices[offset + 2] = center.z + radius * (Math.cos(angle) * normal.z + Math.sin(angle) * binormal.z);
      }
    }
    geometry.getAttribute("position").needsUpdate = true;
    geometry.computeVertexNormals();
  };
}

function createFinger(parent: THREE.Object3D, kit: GeometryKit, skin: THREE.Material, name: string, base: Point3, lengths: Point3, radius: number) {
  const root = new THREE.Group();
  root.position.set(...base);
  parent.add(root);
  const middle = new THREE.Group();
  middle.position.z = lengths[0];
  root.add(middle);
  const distal = new THREE.Group();
  distal.position.z = lengths[1];
  middle.add(distal);
  const tipCenter = new THREE.Group();
  tipCenter.position.z = lengths[2];
  distal.add(tipCenter);
  const contact = new THREE.Object3D();
  contact.name = name;
  tipCenter.add(contact);
  for (const [part, length, width] of [[root, lengths[0], radius], [middle, lengths[1], radius * 0.9], [distal, lengths[2], radius * 0.8]] as const) {
    const cylinder = kit.cylinder(part, width * 0.95, width, length, skin, [0, 0, length / 2]);
    cylinder.rotation.x = Math.PI / 2;
    kit.sphere(part, [width, width, width], skin, [0, 0, 0]);
    kit.sphere(part, [width * 0.95, width * 0.95, width * 0.95], skin, [0, 0, length]);
  }
  const nail = kit.sphere(distal, [radius * 0.56, 0.0012, lengths[2] * 0.28], kit.material("#efcdb7", { roughness: 0.5 }), [0, radius * 0.72, lengths[2] * 0.65]);
  nail.castShadow = false;
  return { root, middle, distal, tipCenter, contact, lengths, radius: radius * 0.8 * 0.95 };
}

export function createArticulatedArm(parent: THREE.Object3D, kit: GeometryKit, side: number, skin: THREE.Material, shirt: THREE.Material) {
  const label = side < 0 ? "left" : "right";
  const shoulder = new THREE.Vector3(side * 0.222, 1.105, 0.012);
  const elbow = new THREE.Vector3();
  const wrist = new THREE.Vector3();
  const cuff = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const pole = new THREE.Vector3();
  const upperLength = 0.335;
  const forearmLength = 0.32;
  const updateSleeve = makeSleeve(parent, kit, shirt);
  const forearm = kit.mesh(parent, new THREE.CylinderGeometry(0.039, 0.061, 1, 18), skin);
  const wristJoint = kit.sphere(parent, [0.04, 0.04, 0.04], skin, [0, 0, 0]);
  const cuffRing = kit.mesh(parent, new THREE.CylinderGeometry(0.064, 0.066, 0.027, 20), shirt);
  const palm = new THREE.Group();
  palm.name = `developer-hand-${label}`;
  parent.add(palm);
  const outline = new THREE.Shape();
  outline.moveTo(-0.023, 0.008);
  outline.quadraticCurveTo(-0.05, -0.022, -0.052, -0.073);
  outline.quadraticCurveTo(-0.052, -0.095, -0.038, -0.101);
  outline.lineTo(0.038, -0.101);
  outline.quadraticCurveTo(0.052, -0.095, 0.052, -0.073);
  outline.quadraticCurveTo(0.05, -0.022, 0.023, 0.008);
  outline.closePath();
  const palmMesh = kit.mesh(palm, new THREE.ExtrudeGeometry(outline, { depth: 0.024, steps: 1, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.004, bevelSegments: 3 }), skin, [0, -0.012, 0]);
  palmMesh.rotation.x = -Math.PI / 2;
  palmMesh.name = `developer-palm-${label}`;
  const lengths: Point3[] = [[0.036, 0.025, 0.02], [0.04, 0.027, 0.022], [0.037, 0.025, 0.02], [0.029, 0.021, 0.017]];
  const fingers = lengths.map((length, index) => createFinger(palm, kit, skin, `developer-fingertip-${label}-${index}`, [side * (-0.039 + index * 0.026), 0, [0.086, 0.096, 0.091, 0.078][index]], length, index === 3 ? 0.0085 : 0.0095));
  const thumb = createFinger(palm, kit, skin, `developer-thumb-${label}`, [-side * 0.041, -0.002, 0.029], [0.025, 0.022, 0.017], 0.0115);
  thumb.root.rotation.set(0.3, -side * 0.8, 0);
  thumb.middle.rotation.x = 0.4;
  thumb.distal.rotation.x = 0.1;
  const inversePalm = new THREE.Matrix4();
  const targetLocal = new THREE.Vector3();
  const end = new THREE.Vector3();
  const fingerOrientation = new THREE.Euler(0, 0, 0, "YXZ");
  const contactRotation = new THREE.Quaternion();
  const worldDown = new THREE.Vector3(0, -1, 0);
  const forearmDirection = new THREE.Vector3();

  return {
    palm,
    fingers,
    shoulder,
    elbow,
    wrist,
    pose(wristTarget: THREE.Vector3, orientation: THREE.Quaternion) {
      wrist.copy(wristTarget);
      direction.copy(wrist).sub(shoulder);
      const distance = Math.min(direction.length(), upperLength + forearmLength - 0.001);
      direction.normalize();
      const along = (upperLength ** 2 - forearmLength ** 2 + distance ** 2) / (2 * distance);
      const height = Math.sqrt(Math.max(0, upperLength ** 2 - along ** 2));
      pole.set(side * 0.65, -0.8, 0.25).addScaledVector(direction, -pole.dot(direction)).normalize();
      elbow.copy(shoulder).addScaledVector(direction, along).addScaledVector(pole, height);
      cuff.copy(elbow).lerp(wrist, 0.58);
      updateSleeve(shoulder, elbow, cuff);
      forearmDirection.copy(wrist).sub(cuff);
      forearm.position.copy(cuff).addScaledVector(forearmDirection, 0.5);
      forearm.scale.y = forearmDirection.length();
      forearmDirection.normalize();
      forearm.quaternion.setFromUnitVectors(UP, forearmDirection);
      wristJoint.position.copy(wrist);
      cuffRing.position.copy(cuff);
      cuffRing.quaternion.copy(forearm.quaternion);
      palm.position.copy(wrist);
      palm.quaternion.copy(orientation);
      palm.updateWorldMatrix(true, false);
      inversePalm.copy(palm.matrixWorld).invert();
    },
    curl(amount: number) {
      fingers.forEach((finger, index) => {
        finger.root.rotation.set(0.16 + amount * 0.18 + index * 0.015, 0, 0);
        finger.middle.rotation.x = 0.3 + amount * 0.35;
        finger.distal.rotation.x = 0.08 + amount * 0.12;
      });
    },
    aimFinger(index: number, targetWorld: THREE.Vector3, blend: number) {
      const finger = fingers[index];
      // Aim the centre of the rounded fingertip, so its lower surface meets the key.
      targetLocal.copy(targetWorld);
      targetLocal.y += finger.radius * 1.2;
      targetLocal.applyMatrix4(inversePalm);
      if (blend < 1) {
        finger.tipCenter.getWorldPosition(end).applyMatrix4(inversePalm);
        targetLocal.lerpVectors(end, targetLocal, blend);
      }
      targetLocal.sub(finger.root.position);
      const yaw = Math.atan2(targetLocal.x, targetLocal.z);
      const horizontal = Math.hypot(targetLocal.x, targetLocal.z);
      const lengthA = finger.lengths[0];
      const lengthB = finger.lengths[1] + finger.lengths[2];
      const requestedDistance = targetLocal.length();
      const distance = THREE.MathUtils.clamp(requestedDistance, Math.abs(lengthA - lengthB) + 0.00001, lengthA + lengthB - 0.00001);
      const bend = Math.acos(THREE.MathUtils.clamp((distance * distance - lengthA * lengthA - lengthB * lengthB) / (2 * lengthA * lengthB), -1, 1));
      const pitch = Math.atan2(-targetLocal.y, horizontal) - Math.atan2(lengthB * Math.sin(bend), lengthA + lengthB * Math.cos(bend));
      fingerOrientation.set(pitch, yaw, 0, "YXZ");
      finger.root.quaternion.setFromEuler(fingerOrientation);
      finger.middle.rotation.x = bend;
      finger.distal.rotation.x = 0;
      finger.contact.userData.reachError = Math.abs(requestedDistance - distance) * 1.2;
    },
    updateContactMarkers() {
      palm.updateWorldMatrix(true, true);
      for (const finger of fingers) {
        finger.tipCenter.getWorldQuaternion(contactRotation).invert();
        finger.contact.position.copy(worldDown).applyQuaternion(contactRotation).multiplyScalar(finger.radius);
        finger.contact.updateWorldMatrix(false, false);
      }
    },
  };
}
