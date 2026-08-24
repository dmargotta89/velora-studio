import type {
  FeatureId,
  PaletteOption,
  StyleId,
  Taste,
  TasteOption,
  ThemeId,
} from "../types";

export const themes: TasteOption<ThemeId>[] = [
  {
    id: "warm-modern",
    name: "Warm modern",
    line: "Oak, linen, and easy evening light.",
  },
  {
    id: "coastal-calm",
    name: "Coastal calm",
    line: "Washed woods, air, and quiet blues.",
  },
  {
    id: "moody-luxe",
    name: "Moody luxe",
    line: "Ink velvet, brass, low glow.",
  },
  {
    id: "collected-classic",
    name: "Collected classic",
    line: "Heirloom lines and layered rooms.",
  },
  {
    id: "soft-scandi",
    name: "Soft Scandinavian",
    line: "Pale timber, calm cloth, less noise.",
  },
];

export const styles: TasteOption<StyleId>[] = [
  {
    id: "contemporary",
    name: "Contemporary",
    line: "Clean volumes, current comfort.",
  },
  {
    id: "mid-century",
    name: "Mid-century",
    line: "Tapered legs and honest wood.",
  },
  {
    id: "organic-modern",
    name: "Organic modern",
    line: "Soft geometry, living materials.",
  },
  {
    id: "transitional",
    name: "Transitional",
    line: "Between tailored and lived-in.",
  },
  {
    id: "traditional",
    name: "Traditional",
    line: "Roll arms, turned wood, pattern.",
  },
];

export const palettes: PaletteOption[] = [
  {
    id: "linen-oak",
    name: "Linen & oak",
    line: "Oat upholstery on honey timber.",
    swatches: ["#e7dcc8", "#c9a36a", "#8b6a3e", "#3f3428"],
  },
  {
    id: "sage-cream",
    name: "Sage & cream",
    line: "Garden greens against warm white.",
    swatches: ["#efe8d8", "#b7c4a4", "#6d7f62", "#3d4436"],
  },
  {
    id: "ink-brass",
    name: "Ink & brass",
    line: "Midnight cloth and a little metal.",
    swatches: ["#d8cfc0", "#b08a43", "#4a4550", "#1b1a1d"],
  },
  {
    id: "terracotta-clay",
    name: "Terracotta & clay",
    line: "Sun-baked pigment, dry plaster.",
    swatches: ["#ead7c4", "#d0895d", "#b35a38", "#5a3326"],
  },
  {
    id: "slate-cloud",
    name: "Slate & cloud",
    line: "Cool stone and pale sky.",
    swatches: ["#e4e7ea", "#9aa6b2", "#5d6872", "#2b3136"],
  },
];

export const features: TasteOption<FeatureId>[] = [
  {
    id: "entertaining",
    name: "Entertaining",
    line: "Seats that gather, tables that stay.",
  },
  {
    id: "work-from-home",
    name: "Work from home",
    line: "A real desk that still belongs.",
  },
  {
    id: "small-space",
    name: "Small space",
    line: "Lighter footprints, taller storage.",
  },
  {
    id: "pet-friendly",
    name: "Pet friendly",
    line: "Performance cloth and washable rugs.",
  },
  {
    id: "layered-lighting",
    name: "Layered lighting",
    line: "Lamps before overhead glare.",
  },
];

export const defaultTaste: Taste = {
  theme: "warm-modern",
  style: "organic-modern",
  palette: "linen-oak",
  features: ["entertaining"],
};
