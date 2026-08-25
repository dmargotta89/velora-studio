import { uid } from "./ids";
import {
  AR_ROOM_FORMAT,
  AR_ROOM_FORMAT_VERSION,
  arToPlacements,
  isSavedArRoom,
  mappingNoteFor,
  placementsToAr,
  type ArMeshMeta,
  type ArRoomFrame,
  type ArRoomSummary,
  type SavedArRoom,
} from "./arRoom";
import type { MappingMode, Placement, Pose6, Room, RoomKind, Taste } from "../types";

const DB_NAME = "velora-ar-rooms";
const DB_VERSION = 1;
const ROOM_STORE = "rooms";
const MESH_STORE = "meshes";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ROOM_STORE)) {
        db.createObjectStore(ROOM_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(MESH_STORE)) {
        db.createObjectStore(MESH_STORE, { keyPath: "roomId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open AR room storage."));
  });
}

function req<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("AR room storage failed."));
  });
}

export function createArRoom(input: {
  name: string;
  kind: RoomKind;
  mappingMode: MappingMode;
  taste: Taste;
  frames: ArRoomFrame[];
  placements: Placement[];
}): SavedArRoom {
  const now = new Date().toISOString();
  return {
    format: AR_ROOM_FORMAT,
    version: AR_ROOM_FORMAT_VERSION,
    id: uid("arroom"),
    name: input.name,
    kind: input.kind,
    mappingMode: input.mappingMode,
    mappingNote: mappingNoteFor(input.mappingMode),
    createdAt: now,
    updatedAt: now,
    taste: input.taste,
    frames: input.frames,
    placements: placementsToAr(input.placements),
    mesh: null,
  };
}

export async function putArRoom(room: SavedArRoom): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(ROOM_STORE, "readwrite");
    await req(tx.objectStore(ROOM_STORE).put({ ...room, updatedAt: new Date().toISOString() }));
  } finally {
    db.close();
  }
}

export async function getArRoom(id: string): Promise<SavedArRoom | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(ROOM_STORE, "readonly");
    const value = await req(tx.objectStore(ROOM_STORE).get(id));
    return isSavedArRoom(value) ? value : null;
  } catch {
    return null;
  } finally {
    db.close();
  }
}

export async function listArRooms(): Promise<ArRoomSummary[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(ROOM_STORE, "readonly");
    const values = await req(tx.objectStore(ROOM_STORE).getAll());
    return (values as unknown[])
      .filter(isSavedArRoom)
      .map((room) => ({
        id: room.id,
        name: room.name,
        kind: room.kind,
        mappingMode: room.mappingMode,
        mappingNote: room.mappingNote,
        updatedAt: room.updatedAt,
        frameCount: room.frames.length,
        hasMesh: Boolean(room.mesh),
        coverSrc: room.frames[0]?.imageSrc ?? null,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  } finally {
    db.close();
  }
}

export async function deleteArRoom(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction([ROOM_STORE, MESH_STORE], "readwrite");
    await Promise.all([
      req(tx.objectStore(ROOM_STORE).delete(id)),
      req(tx.objectStore(MESH_STORE).delete(id)),
    ]);
  } finally {
    db.close();
  }
}

export async function putArMesh(
  roomId: string,
  mesh: { source: ArMeshMeta["source"]; format: ArMeshMeta["format"]; bytes: ArrayBuffer },
): Promise<ArMeshMeta> {
  const meta: ArMeshMeta = {
    source: mesh.source,
    format: mesh.format,
    byteLength: mesh.bytes.byteLength,
    capturedAt: new Date().toISOString(),
  };
  const db = await openDb();
  try {
    const tx = db.transaction([ROOM_STORE, MESH_STORE], "readwrite");
    await req(
      tx.objectStore(MESH_STORE).put({
        roomId,
        source: mesh.source,
        format: mesh.format,
        bytes: mesh.bytes,
      }),
    );
    const room = await req(tx.objectStore(ROOM_STORE).get(roomId));
    if (isSavedArRoom(room)) {
      const next: SavedArRoom = {
        ...room,
        mappingMode: "lidar-mesh",
        mappingNote: mappingNoteFor("lidar-mesh"),
        mesh: meta,
        updatedAt: new Date().toISOString(),
      };
      await req(tx.objectStore(ROOM_STORE).put(next));
    }
    return meta;
  } finally {
    db.close();
  }
}

export async function getArMeshBytes(roomId: string): Promise<ArrayBuffer | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(MESH_STORE, "readonly");
    const value = await req(tx.objectStore(MESH_STORE).get(roomId));
    if (!value || typeof value !== "object") return null;
    const bytes = (value as { bytes?: ArrayBuffer }).bytes;
    return bytes instanceof ArrayBuffer && bytes.byteLength > 0 ? bytes : null;
  } catch {
    return null;
  } finally {
    db.close();
  }
}

export function roomFromArRoom(arRoom: SavedArRoom): Room {
  const cover = arRoom.frames[0]?.imageSrc ?? "";
  const source = arRoom.mappingMode === "none" ? "upload" : "camera";
  return {
    id: arRoom.id,
    name: arRoom.name,
    kind: arRoom.kind,
    imageSrc: cover,
    source,
    mappingMode: arRoom.mappingMode,
    note: arRoom.mappingNote,
  };
}

export function newCameraFrame(imageSrc: string, pose: Pose6 | null = null): ArRoomFrame {
  return {
    id: uid("frame"),
    capturedAt: new Date().toISOString(),
    imageSrc,
    pose,
  };
}

export function studioPlacementsFrom(arRoom: SavedArRoom): Placement[] {
  return arToPlacements(arRoom.placements);
}
