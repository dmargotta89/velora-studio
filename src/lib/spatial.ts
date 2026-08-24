import type { PaletteId } from "../types";

/** Floor extents in meters. x percent maps across width; y percent maps into depth. */
export const FLOOR_WIDTH = 6.4;
export const FLOOR_NEAR = 2.15;
export const FLOOR_FAR = -3.05;

const X_MIN = 8;
const X_MAX = 92;
const Y_MIN = 18;
const Y_MAX = 90;

export function percentToWorld(x: number, y: number): [number, number, number] {
  const tx = (x - X_MIN) / (X_MAX - X_MIN);
  const ty = (y - Y_MIN) / (Y_MAX - Y_MIN);
  const wx = (tx - 0.5) * FLOOR_WIDTH;
  const wz = FLOOR_FAR + ty * (FLOOR_NEAR - FLOOR_FAR);
  return [wx, 0, wz];
}

export function worldToPercent(wx: number, wz: number): { x: number; y: number } {
  const x = X_MIN + ((wx + FLOOR_WIDTH / 2) / FLOOR_WIDTH) * (X_MAX - X_MIN);
  const y = Y_MIN + ((wz - FLOOR_FAR) / (FLOOR_NEAR - FLOOR_FAR)) * (Y_MAX - Y_MIN);
  return {
    x: Math.min(X_MAX, Math.max(X_MIN, x)),
    y: Math.min(Y_MAX, Math.max(Y_MIN, y)),
  };
}

export interface Atmosphere {
  floor: string;
  wall: string;
  ambient: string;
  key: string;
  fill: string;
  rim: string;
}

export const paletteAtmosphere: Record<PaletteId, Atmosphere> = {
  "linen-oak": {
    floor: "#c4a06a",
    wall: "#efe4d2",
    ambient: "#fff1dc",
    key: "#ffe0b8",
    fill: "#d7c4a8",
    rim: "#b08a43",
  },
  "sage-cream": {
    floor: "#b7b49a",
    wall: "#e7eee3",
    ambient: "#eef5ea",
    key: "#e0edd4",
    fill: "#c5d0bc",
    rim: "#6d7f62",
  },
  "ink-brass": {
    floor: "#2c2826",
    wall: "#3c3842",
    ambient: "#2a2730",
    key: "#e0c48a",
    fill: "#6a5c48",
    rim: "#b08a43",
  },
  "terracotta-clay": {
    floor: "#a56a48",
    wall: "#ead2bc",
    ambient: "#f4e0cc",
    key: "#f0b888",
    fill: "#d4a078",
    rim: "#b35a38",
  },
  "slate-cloud": {
    floor: "#8a9198",
    wall: "#d8dee6",
    ambient: "#e6eef6",
    key: "#d0dbe8",
    fill: "#9aa6b2",
    rim: "#5d6872",
  },
};
