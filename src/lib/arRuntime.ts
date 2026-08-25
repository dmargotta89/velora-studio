import * as THREE from "three";
import type { Pose6, Product } from "../types";
import { loadCatalogGlb } from "./catalogGlb";
import { matrixToPose6 } from "./pose";
import { arStartError } from "./webxr";

export type ArRuntimeStatus =
  | { kind: "starting" }
  | { kind: "no-floor" }
  | { kind: "floor" }
  | { kind: "placed"; name: string; count: number };

export interface ArPiece {
  product: Product;
  scale: number;
}

/**
 * Real WebXR immersive-ar session with floor hit-test.
 * Never constructed unless requestSession succeeds.
 */
export class FloorArRuntime {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private session: XRSession | null = null;
  private hitTestSource: XRHitTestSource | null = null;
  private reticle: THREE.Mesh | null = null;
  private placed: THREE.Object3D[] = [];
  private hasFloor = false;
  private lastHitMatrix = new THREE.Matrix4();
  private scratchScale = new THREE.Vector3();
  private getPiece: () => ArPiece | null = () => null;
  private onStatus: (status: ArRuntimeStatus) => void = () => {};
  private selectHandler: (() => void) | null = null;
  private endHandler: (() => void) | null = null;
  private endedCallback: (() => void) | null = null;
  private onPlaced: ((result: { productId: string; pose: Pose6 }) => void) | null = null;

  async start(options: {
    overlay: HTMLElement;
    getPiece: () => ArPiece | null;
    onStatus: (status: ArRuntimeStatus) => void;
    onEnded: () => void;
    onPlaced?: (result: { productId: string; pose: Pose6 }) => void;
  }): Promise<void> {
    this.getPiece = options.getPiece;
    this.onStatus = options.onStatus;
    this.endedCallback = options.onEnded;
    this.onPlaced = options.onPlaced ?? null;
    this.onStatus({ kind: "starting" });

    if (!navigator.xr) {
      throw new Error("No WebXR on this browser. AR is not running.");
    }

    const withOverlay: XRSessionInit = {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay", "local-floor"],
      domOverlay: { root: options.overlay },
    };

    let session: XRSession;
    try {
      session = await navigator.xr.requestSession("immersive-ar", withOverlay);
    } catch (first) {
      try {
        session = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["local-floor"],
        });
      } catch (second) {
        throw arStartError(second ?? first);
      }
    }

    this.session = session;

    const canvas = document.createElement("canvas");
    canvas.className = "ar-gl";
    const gl =
      canvas.getContext("webgl2", { xrCompatible: true, alpha: true, antialias: true }) ??
      canvas.getContext("webgl", { xrCompatible: true, alpha: true, antialias: true });
    if (!gl) {
      await session.end().catch(() => undefined);
      throw new Error("WebGL is required for AR. AR is not running.");
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl as WebGLRenderingContext,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    const camera = new THREE.PerspectiveCamera();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.05));
    const key = new THREE.DirectionalLight(0xffffff, 0.7);
    key.position.set(0.4, 1.5, 0.3);
    scene.add(key);

    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.11, 36).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xf7f1e6, opacity: 0.92, transparent: true }),
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
    this.reticle = reticle;

    await renderer.xr.setSession(session);

    let refSpace = renderer.xr.getReferenceSpace();
    if (!refSpace) {
      try {
        refSpace = await session.requestReferenceSpace("local-floor");
      } catch {
        refSpace = await session.requestReferenceSpace("local");
      }
      renderer.xr.setReferenceSpace(refSpace);
    }

    if (!session.requestHitTestSource) {
      await session.end().catch(() => undefined);
      throw new Error(
        "Floor hit-test is not available on this session. AR is not running. Use PREVIEW.",
      );
    }

    const viewerSpace = await session.requestReferenceSpace("viewer");
    const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
    if (!hitTestSource) {
      await session.end().catch(() => undefined);
      throw new Error(
        "Floor hit-test source could not be created. AR is not running. Use PREVIEW.",
      );
    }
    this.hitTestSource = hitTestSource;

    this.selectHandler = () => {
      void this.placeAtReticle();
    };
    session.addEventListener("select", this.selectHandler);

    this.endHandler = () => {
      this.cleanup();
      this.endedCallback?.();
    };
    session.addEventListener("end", this.endHandler);

    renderer.setAnimationLoop((_time, frame) => {
      if (!frame || !this.hitTestSource) return;
      const space = renderer.xr.getReferenceSpace();
      if (!space) return;
      const hits = frame.getHitTestResults(this.hitTestSource);
      if (hits.length > 0) {
        const pose = hits[0].getPose(space);
        if (pose) {
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
          this.lastHitMatrix.fromArray(pose.transform.matrix);
          if (!this.hasFloor) {
            this.hasFloor = true;
            this.onStatus({ kind: "floor" });
          }
        }
      } else if (this.hasFloor || reticle.visible) {
        reticle.visible = false;
        this.hasFloor = false;
        this.onStatus({ kind: "no-floor" });
      }
      renderer.render(scene, camera);
    });

    this.onStatus({ kind: "no-floor" });
  }

  async placeAtReticle(): Promise<{ productId: string; pose: Pose6 } | null> {
    if (!this.hasFloor || !this.reticle?.visible || !this.scene) return null;
    const piece = this.getPiece();
    if (!piece) return null;
    const root = await loadCatalogGlb(piece.product);
    this.lastHitMatrix.decompose(root.position, root.quaternion, this.scratchScale);
    root.scale.setScalar(piece.scale);
    this.scene.add(root);
    this.placed.push(root);
    const pose = matrixToPose6(this.lastHitMatrix);
    this.onStatus({
      kind: "placed",
      name: piece.product.name,
      count: this.placed.length,
    });
    const result = { productId: piece.product.id, pose };
    this.onPlaced?.(result);
    return result;
  }

  undo(): void {
    const last = this.placed.pop();
    last?.removeFromParent();
    this.onStatus(this.hasFloor ? { kind: "floor" } : { kind: "no-floor" });
  }

  async end(): Promise<void> {
    const session = this.session;
    if (session) {
      try {
        await session.end();
      } catch {
        this.cleanup();
        this.endedCallback?.();
      }
    } else {
      this.cleanup();
      this.endedCallback?.();
    }
  }

  private cleanup(): void {
    this.hitTestSource?.cancel();
    this.hitTestSource = null;
    if (this.session && this.selectHandler) {
      this.session.removeEventListener("select", this.selectHandler);
    }
    if (this.session && this.endHandler) {
      this.session.removeEventListener("end", this.endHandler);
    }
    this.renderer?.setAnimationLoop(null);
    this.renderer?.dispose();
    this.renderer = null;
    this.scene = null;
    this.session = null;
    this.placed = [];
    this.hasFloor = false;
    this.reticle = null;
    this.selectHandler = null;
    this.endHandler = null;
  }
}
