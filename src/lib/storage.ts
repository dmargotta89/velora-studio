import { defaultTaste } from "../data/taste";
import type { MappingMode, PersistedStudio, Room } from "../types";

export const STORAGE_KEY = "velora-studio-v1";

export const emptyStudio: PersistedStudio = {
  version: 2,
  room: null,
  taste: defaultTaste,
  placements: [],
  selectedId: null,
  activeArRoomId: null,
};

function mappingFromRoom(room: Room | null): MappingMode {
  if (!room) return "none";
  if (room.mappingMode) return room.mappingMode;
  if (room.source === "camera") return "camera-frame";
  return "none";
}

function normalizeRoom(room: Room | null): Room | null {
  if (!room) return null;
  return {
    ...room,
    mappingMode: mappingFromRoom(room),
  };
}

export function loadStudio(): PersistedStudio {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStudio;
    const parsed = JSON.parse(raw) as PersistedStudio;
    if (parsed.version !== 1 && parsed.version !== 2) return emptyStudio;
    const room = normalizeRoom(parsed.room ?? null);
    return {
      ...emptyStudio,
      ...parsed,
      version: 2,
      room,
      taste: { ...defaultTaste, ...parsed.taste },
      placements: parsed.placements ?? [],
      activeArRoomId: parsed.activeArRoomId ?? null,
    };
  } catch {
    return emptyStudio;
  }
}

export function saveStudio(state: PersistedStudio): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, version: 2 } satisfies PersistedStudio),
    );
  } catch {
    // Quota errors should not break the session.
  }
}

export function clearStudio(): void {
  localStorage.removeItem(STORAGE_KEY);
}
