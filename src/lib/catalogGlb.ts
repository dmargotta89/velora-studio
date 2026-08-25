import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Product } from "../types";
import { createFurnitureGroup } from "./furnitureGroup";

const templates = new Map<string, THREE.Group>();
const loader = new GLTFLoader();

function exportBinary(object: THREE.Object3D): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    new GLTFExporter().parse(
      object,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error("GLB export did not return binary."));
      },
      reject,
      { binary: true },
    );
  });
}

/**
 * Simple local catalog GLB generated from the mocked piece.
 * Not a live Ashley / Amazon / Kirkland's AR SDK asset.
 */
export async function loadCatalogGlb(product: Product): Promise<THREE.Group> {
  const cached = templates.get(product.id);
  if (cached) return cached.clone();

  const source = createFurnitureGroup(product);
  try {
    const glb = await exportBinary(source);
    const gltf = await loader.parseAsync(glb, "");
    const group = gltf.scene as THREE.Group;
    templates.set(product.id, group);
    return group.clone();
  } catch {
    templates.set(product.id, source);
    return source.clone();
  }
}
