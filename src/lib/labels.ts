import { features, palettes, styles, themes } from "../data/taste";
import type { FeatureId, PaletteId, StyleId, ThemeId } from "../types";

export function themeName(id: ThemeId): string {
  return themes.find((item) => item.id === id)?.name ?? id;
}

export function styleName(id: StyleId): string {
  return styles.find((item) => item.id === id)?.name ?? id;
}

export function paletteName(id: PaletteId): string {
  return palettes.find((item) => item.id === id)?.name ?? id;
}

export function featureName(id: FeatureId): string {
  return features.find((item) => item.id === id)?.name ?? id;
}

export const roomKindLabels = {
  living: "Living room",
  dining: "Dining",
  bedroom: "Bedroom",
  study: "Study",
} as const;
