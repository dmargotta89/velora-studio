import type { MappingMode } from "../types";
import { probeNativeMapper } from "../native/mapper";

export interface MappingProbe {
  /** What this device can do right now — never lidar unless a native mapper is actually present. */
  capture: "none" | "camera-frame";
  lidar: { ready: true; platform: "arkit-lidar" | "arcore-depth" } | { ready: false; reason: string };
  camera: { ready: true } | { ready: false; reason: string };
}

export function mappingModeCopy(mode: MappingMode): { tag: string; line: string } {
  if (mode === "lidar-mesh") {
    return {
      tag: "LiDAR mesh",
      line: "A real native mesh is stored for this room. This is not a photo stand-in.",
    };
  }
  if (mode === "camera-frame") {
    return {
      tag: "Camera frame",
      line: "Mapped from device camera frames. Not a LiDAR mesh — a 2D capture, optionally with WebXR poses if AR actually ran.",
    };
  }
  return {
    tag: "None",
    line: "No room map. Sample or uploaded photo only — not camera mapping, not LiDAR.",
  };
}

export async function probeMapping(): Promise<MappingProbe> {
  const native = await probeNativeMapper();
  const secure = typeof window === "undefined" ? false : window.isSecureContext;
  const hasGetUserMedia = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

  let camera: MappingProbe["camera"];
  if (!secure) {
    camera = {
      ready: false,
      reason: "Camera needs HTTPS or localhost. This page is not a secure context.",
    };
  } else if (!hasGetUserMedia) {
    camera = {
      ready: false,
      reason: "This browser does not expose getUserMedia.",
    };
  } else {
    camera = { ready: true };
  }

  return {
    capture: camera.ready ? "camera-frame" : "none",
    lidar: native,
    camera,
  };
}
