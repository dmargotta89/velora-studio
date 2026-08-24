import { defaultTaste } from "../data/taste";
import type { PersistedStudio } from "../types";

export const STORAGE_KEY = "velora-studio-v1";

export const emptyStudio: PersistedStudio = {
  version: 1,
  room: null,
  taste: defaultTaste,
  placements: [],
  selectedId: null,
};

export function loadStudio(): PersistedStudio {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStudio;
    const parsed = JSON.parse(raw) as PersistedStudio;
    if (parsed.version !== 1) return emptyStudio;
    return {
      ...emptyStudio,
      ...parsed,
      taste: { ...defaultTaste, ...parsed.taste },
      placements: parsed.placements ?? [],
    };
  } catch {
    return emptyStudio;
  }
}

export function saveStudio(state: PersistedStudio): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota errors should not break the session.
  }
}

export function clearStudio(): void {
  localStorage.removeItem(STORAGE_KEY);
}
