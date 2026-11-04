import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type Point3 = readonly [number, number, number];

/** Scene-local caches keep repeated keys, fan blades, and hardware inexpensive. */
export function createGeometryKit() {
  const geometries = new Map<string, THREE.BufferGeometry>();
  const materials = new Map<string, THREE.MeshStandardMaterial>();

  function cached(key: string, create: () => THREE.BufferGeometry) {
    let geometry = geometries.get(key);
    if (!geometry) {
      geometry = create();
      geometries.set(key, geometry);
    }
    return geometry;
  }

  function material(color: THREE.ColorRepresentation, options: THREE.MeshStandardMaterialParameters = {}) {
    const key = JSON.stringify([color, options]);
    let result = materials.get(key);
    if (!result) {
      result = new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...options });
      materials.set(key, result);
    }
    return result;
  }

  function mesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    surface: THREE.Material,
    position: Point3 = [0, 0, 0],
  ) {
    const result = new THREE.Mesh(geometry, surface);
    result.position.set(...position);
    result.castShadow = result.receiveShadow = true;
    parent.add(result);
    return result;
  }

  function box(parent: THREE.Object3D, size: Point3, surface: THREE.Material, position: Point3, radius = 0.015) {
    const roundness = Math.max(0, Math.min(radius, ...size.map((side) => side / 2)));
    return mesh(parent, cached(`box:${size}:${roundness}`, () => roundness
      ? new RoundedBoxGeometry(...size, 2, roundness)
      : new THREE.BoxGeometry(...size)), surface, position);
  }

  function sphere(parent: THREE.Object3D, size: Point3, surface: THREE.Material, position: Point3) {
    const result = mesh(parent, cached("sphere", () => new THREE.SphereGeometry(1, 24, 16)), surface, position);
    result.scale.set(...size);
    return result;
  }

  function cylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, surface: THREE.Material, position: Point3) {
    return mesh(parent, cached(`cylinder:${top}:${bottom}:${height}`, () => new THREE.CylinderGeometry(top, bottom, height, 24)), surface, position);
  }

  function segment(parent: THREE.Object3D, from: Point3, to: Point3, radius: number, surface: THREE.Material, endRadius = radius) {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const delta = end.sub(start);
    const result = cylinder(parent, endRadius, radius, delta.length(), surface, [0, 0, 0]);
    result.position.copy(start).addScaledVector(delta, 0.5);
    result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    sphere(parent, [radius, radius, radius], surface, from);
    sphere(parent, [endRadius, endRadius, endRadius], surface, to);
    return result;
  }

  function tube(parent: THREE.Object3D, points: readonly Point3[], radius: number, surface: THREE.Material, segments = 24) {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    return mesh(parent, new THREE.TubeGeometry(curve, segments, radius, 8, false), surface);
  }

  return { material, mesh, box, sphere, cylinder, segment, tube };
}

export type GeometryKit = ReturnType<typeof createGeometryKit>;

/** Dispose shared resources once, including the textures attached to materials. */
export function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);
      for (const surface of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(surface);
        for (const value of Object.values(surface)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    }
    if (object instanceof THREE.DirectionalLight || object instanceof THREE.SpotLight || object instanceof THREE.PointLight) {
      object.shadow.dispose();
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  scene.clear();
}
