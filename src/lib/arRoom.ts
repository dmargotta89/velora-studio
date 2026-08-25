import type { MappingMode, Placement, Pose6, ProductCategory, RoomKind, Taste } from "../types";

export const AR_ROOM_FORMAT = "velora-ar-room";
export const AR_ROOM_FORMAT_VERSION = 1 as const;

export interface ArRoomFrame {
  id: string;
  capturedAt: string;
  imageSrc: string;
  /** Real XR viewer pose only. Null for getUserMedia frames. */
  pose: Pose6 | null;
}

export interface ArWorldPlacement {
  id: string;
  slot: ProductCategory;
  productId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  worldPose: Pose6 | null;
}

export interface ArMeshMeta {
  source: "arkit-lidar" | "arcore-depth";
  format: "usdz" | "obj" | "ply";
  byteLength: number;
  capturedAt: string;
}

export interface SavedArRoom {
  format: typeof AR_ROOM_FORMAT;
  version: typeof AR_ROOM_FORMAT_VERSION;
  id: string;
  name: string;
  kind: RoomKind;
  mappingMode: MappingMode;
  mappingNote: string;
  createdAt: string;
  updatedAt: string;
  taste: Taste;
  frames: ArRoomFrame[];
  placements: ArWorldPlacement[];
  mesh: ArMeshMeta | null;
}

export interface ArRoomSummary {
  id: string;
  name: string;
  kind: RoomKind;
  mappingMode: MappingMode;
  mappingNote: string;
  updatedAt: string;
  frameCount: number;
  hasMesh: boolean;
  coverSrc: string | null;
}

export function mappingNoteFor(mode: MappingMode): string {
  if (mode === "lidar-mesh") {
    return "Saved with a native LiDAR / scene-reconstruction mesh. Not a photo stand-in.";
  }
  if (mode === "camera-frame") {
    return "Saved camera frames on this device. Not a LiDAR mesh.";
  }
  return "Photo stand-in only. No camera map, no LiDAR mesh.";
}

export function placementsToAr(placements: Placement[]): ArWorldPlacement[] {
  return placements.map((item) => ({
    id: item.id,
    slot: item.slot,
    productId: item.productId,
    x: item.x,
    y: item.y,
    scale: item.scale,
    rotation: item.rotation,
    worldPose: item.worldPose ?? null,
  }));
}

export function arToPlacements(placements: ArWorldPlacement[]): Placement[] {
  return placements.map((item) => ({
    id: item.id,
    slot: item.slot,
    productId: item.productId,
    x: item.x,
    y: item.y,
    scale: item.scale,
    rotation: item.rotation,
    worldPose: item.worldPose,
  }));
}

export function isSavedArRoom(value: unknown): value is SavedArRoom {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<SavedArRoom>;
  return record.format === AR_ROOM_FORMAT && record.version === AR_ROOM_FORMAT_VERSION;
}
