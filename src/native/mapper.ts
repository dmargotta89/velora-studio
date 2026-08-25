/**
 * Native room mapper bridge.
 *
 * A real LiDAR / scene-reconstruction mesh is only produced when a native
 * host (iOS ARKit LiDAR or ARCore depth) injects `window.VeloraNativeMapper`.
 * The web app never invents a mesh from a 2D camera frame.
 *
 * This Linux VM cannot build or run the iOS target. See native/ios/README.md
 * (Mac + LiDAR iPhone pool required).
 */

export type NativeLidarPlatform = "arkit-lidar" | "arcore-depth";

export interface NativeMeshResult {
  source: NativeLidarPlatform;
  format: "usdz" | "obj" | "ply";
  bytes: ArrayBuffer;
}

export interface NativeMapperBridge {
  probe(): Promise<
    | { ready: true; platform: NativeLidarPlatform }
    | { ready: false; reason: string }
  >;
  captureLiDARMesh(): Promise<NativeMeshResult>;
}

declare global {
  interface Window {
    VeloraNativeMapper?: NativeMapperBridge;
  }
}

export async function probeNativeMapper(): Promise<
  { ready: true; platform: NativeLidarPlatform } | { ready: false; reason: string }
> {
  if (typeof window === "undefined") {
    return {
      ready: false,
      reason: "Native LiDAR is not available outside the browser/host app.",
    };
  }
  const bridge = window.VeloraNativeMapper;
  if (!bridge) {
    return {
      ready: false,
      reason:
        "No native mapper is injected. This browser is camera-only. LiDAR mesh needs an iOS ARKit (LiDAR) or ARCore depth host — not a photo, and not this web page.",
    };
  }
  try {
    return await bridge.probe();
  } catch {
    return {
      ready: false,
      reason: "The native mapper failed to probe. LiDAR is not running. Camera-only.",
    };
  }
}

export async function captureNativeLiDARMesh(): Promise<NativeMeshResult> {
  const bridge = typeof window !== "undefined" ? window.VeloraNativeMapper : undefined;
  if (!bridge) {
    throw new Error(
      "LiDAR mesh is not available. This device/browser has no native ARKit/ARCore mapper. Camera-only — a photo is not a mesh.",
    );
  }
  const mesh = await bridge.captureLiDARMesh();
  if (!mesh?.bytes || mesh.bytes.byteLength < 1) {
    throw new Error("Native mapper returned an empty mesh. LiDAR capture did not succeed.");
  }
  return mesh;
}
