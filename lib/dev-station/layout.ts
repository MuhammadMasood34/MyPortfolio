import type * as THREE from "three";

/** Shared dimensions keep fingers, key caps, and keyboard cables in agreement. */
export const KEYBOARD_LAYOUT = {
  position: [-0.1, 0.851, 0.49] as const,
  rotationY: 0,
  scale: 1.1,
  rows: 5,
  columns: 13,
  pitchX: 0.034,
  pitchZ: 0.033,
  startX: -0.207,
  startZ: -0.071,
  restKeyY: 0.019,
  keyHeight: 0.012,
  travel: 0.0035,
};

export interface KeyPress {
  row: number;
  column: number;
  amount: number;
}

export interface KeyboardRig {
  /** The current top surface of a physical key, including its press travel. */
  getKeyWorldPosition(row: number, column: number, target: THREE.Vector3): THREE.Vector3;
  setPressedKeys(presses: readonly KeyPress[]): void;
}
