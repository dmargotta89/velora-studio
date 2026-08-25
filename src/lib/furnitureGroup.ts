import * as THREE from "three";
import type { Product } from "../types";

function mat(color: string, extras?: { roughness?: number; metalness?: number; emissive?: string; emissiveIntensity?: number }) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extras?.roughness ?? 0.7,
    metalness: extras?.metalness ?? 0,
    emissive: extras?.emissive ?? "#000000",
    emissiveIntensity: extras?.emissiveIntensity ?? 0,
  });
}

function box(
  parent: THREE.Group,
  [w, h, d]: [number, number, number],
  [x, y, z]: [number, number, number],
  material: THREE.Material,
  cast = true,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
}

/** Simple local catalog mesh — not a live retailer AR asset. */
export function createFurnitureGroup(product: Product): THREE.Group {
  const fill = mat(product.swatch, { roughness: 0.72 });
  const line = mat(product.accent, { roughness: 0.55 });
  const group = new THREE.Group();
  group.name = product.id;

  switch (product.category) {
    case "rug": {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.55), mat(product.swatch, { roughness: 0.9 }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.015;
      mesh.receiveShadow = true;
      group.add(mesh);
      break;
    }
    case "sofa":
      box(group, [2.05, 0.42, 0.82], [0, 0.22, 0.05], fill);
      box(group, [2.05, 0.55, 0.22], [0, 0.52, -0.3], fill);
      box(group, [0.22, 0.32, 0.7], [-0.9, 0.4, 0.08], line);
      box(group, [0.22, 0.32, 0.7], [0.9, 0.4, 0.08], line);
      break;
    case "chair":
      box(group, [0.62, 0.16, 0.62], [0, 0.28, 0], fill);
      box(group, [0.62, 0.48, 0.14], [0, 0.52, -0.22], fill);
      box(group, [0.08, 0.28, 0.08], [-0.2, 0.14, 0.2], line);
      box(group, [0.08, 0.28, 0.08], [0.2, 0.14, 0.2], line);
      box(group, [0.08, 0.28, 0.08], [-0.2, 0.14, -0.2], line);
      box(group, [0.08, 0.28, 0.08], [0.2, 0.14, -0.2], line);
      break;
    case "table": {
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 28), mat(product.swatch, { roughness: 0.45 }));
      top.position.set(0, 0.42, 0);
      top.castShadow = true;
      group.add(top);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.38, 12), line);
      stem.position.set(0, 0.22, 0);
      stem.castShadow = true;
      group.add(stem);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), fill);
      base.position.set(0, 0.04, 0);
      group.add(base);
      break;
    }
    case "bed":
      box(group, [1.7, 0.32, 2.05], [0, 0.28, 0.05], fill);
      box(group, [1.7, 0.7, 0.12], [0, 0.62, -0.92], line);
      break;
    case "desk":
      box(group, [1.35, 0.06, 0.62], [0, 0.72, 0], fill);
      box(group, [0.08, 0.72, 0.08], [-0.58, 0.36, 0.22], line);
      box(group, [0.08, 0.72, 0.08], [0.58, 0.36, 0.22], line);
      box(group, [0.08, 0.72, 0.08], [-0.58, 0.36, -0.22], line);
      box(group, [0.08, 0.72, 0.08], [0.58, 0.36, -0.22], line);
      break;
    case "lamp": {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.05, 16), line);
      base.position.set(0, 0.04, 0);
      group.add(base);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.3, 8),
        mat(product.accent, { metalness: 0.4, roughness: 0.4 }),
      );
      pole.position.set(0, 0.7, 0);
      pole.castShadow = true;
      group.add(pole);
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.28, 16, 1, true),
        mat(product.swatch, { roughness: 0.6, emissive: product.swatch, emissiveIntensity: 0.55 }),
      );
      shade.position.set(0, 1.42, 0);
      shade.castShadow = true;
      group.add(shade);
      break;
    }
    case "plant": {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.24, 12), line);
      pot.position.set(0, 0.12, 0);
      pot.castShadow = true;
      group.add(pot);
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), mat(product.swatch, { roughness: 0.85 }));
      leaf.position.set(0, 0.7, 0);
      leaf.castShadow = true;
      group.add(leaf);
      const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), mat(product.swatch, { roughness: 0.85 }));
      leaf2.position.set(0.12, 1.0, -0.05);
      leaf2.castShadow = true;
      group.add(leaf2);
      break;
    }
  }

  return group;
}
