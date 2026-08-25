export type RoomKind = "living" | "dining" | "bedroom" | "study";

export type Retailer = "Ashley" | "Amazon" | "Kirkland's";

export type ProductCategory =
  | "sofa"
  | "chair"
  | "table"
  | "bed"
  | "desk"
  | "lamp"
  | "rug"
  | "plant";

export type ThemeId =
  | "warm-modern"
  | "coastal-calm"
  | "moody-luxe"
  | "collected-classic"
  | "soft-scandi";

export type StyleId =
  | "contemporary"
  | "mid-century"
  | "organic-modern"
  | "transitional"
  | "traditional";

export type PaletteId =
  | "linen-oak"
  | "sage-cream"
  | "ink-brass"
  | "terracotta-clay"
  | "slate-cloud";

export type FeatureId =
  | "entertaining"
  | "work-from-home"
  | "small-space"
  | "pet-friendly"
  | "layered-lighting";

export type RoomSource = "sample" | "upload" | "camera";

/** Honest mapping state. Never set lidar-mesh unless a real native mesh was stored. */
export type MappingMode = "none" | "camera-frame" | "lidar-mesh";

/** 6-DoF pose from a real XR session. Never inferred from a 2D photo. */
export interface Pose6 {
  position: [number, number, number];
  orientation: [number, number, number, number];
}

export interface Room {
  id: string;
  name: string;
  kind: RoomKind;
  imageSrc: string;
  source: RoomSource;
  note: string;
  mappingMode: MappingMode;
}

export interface TasteOption<T extends string> {
  id: T;
  name: string;
  line: string;
}

export interface PaletteOption extends TasteOption<PaletteId> {
  swatches: string[];
}

export interface Taste {
  theme: ThemeId;
  style: StyleId;
  palette: PaletteId;
  features: FeatureId[];
}

export interface Product {
  id: string;
  name: string;
  retailer: Retailer;
  price: number;
  category: ProductCategory;
  arCapable: boolean;
  swatch: string;
  accent: string;
  themes: ThemeId[];
  styles: StyleId[];
  palettes: PaletteId[];
  features: FeatureId[];
  roomKinds: RoomKind[];
  tags: string[];
}

export type SlotId = ProductCategory;

export interface Placement {
  id: string;
  slot: SlotId;
  productId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  /** Set only when this piece was placed during a real WebXR hit-test. */
  worldPose?: Pose6 | null;
}

export interface PersistedStudio {
  version: 1 | 2;
  room: Room | null;
  taste: Taste;
  placements: Placement[];
  selectedId: string | null;
  activeArRoomId?: string | null;
}

export type StudioPhase = "welcome" | "room" | "studio";
