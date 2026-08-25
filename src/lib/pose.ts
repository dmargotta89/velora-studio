import * as THREE from "three";
import type { Pose6 } from "../types";

export function matrixToPose6(matrix: THREE.Matrix4): Pose6 {
  const position = new THREE.Vector3();
  const orientation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, orientation, scale);
  return {
    position: [position.x, position.y, position.z],
    orientation: [orientation.x, orientation.y, orientation.z, orientation.w],
  };
}
