import { catalog } from "../data/catalog";
import { featureName, paletteName, styleName, themeName } from "./labels";
import type {
  Placement,
  Product,
  ProductCategory,
  Room,
  RoomKind,
  SlotId,
  Taste,
} from "../types";
import { uid } from "./ids";

const livingSlots: SlotId[] = ["rug", "sofa", "table", "chair", "lamp", "plant"];
const diningSlots: SlotId[] = ["rug", "table", "chair", "lamp", "plant"];
const bedroomSlots: SlotId[] = ["rug", "bed", "table", "chair", "lamp", "plant"];
const studySlots: SlotId[] = ["rug", "desk", "chair", "lamp", "plant", "table"];

const slotDefaults: Record<
  SlotId,
  { x: number; y: number; scale: number }
> = {
  rug: { x: 50, y: 74, scale: 1.55 },
  sofa: { x: 34, y: 58, scale: 1.15 },
  bed: { x: 48, y: 56, scale: 1.25 },
  desk: { x: 70, y: 60, scale: 1 },
  table: { x: 52, y: 67, scale: 0.95 },
  chair: { x: 67, y: 60, scale: 0.92 },
  lamp: { x: 22, y: 52, scale: 1.05 },
  plant: { x: 82, y: 56, scale: 1 },
};

export interface RankedItem {
  product: Product;
  score: number;
  reasons: string[];
}

export function slotsFor(kind: RoomKind, taste?: Taste): SlotId[] {
  let slots =
    kind === "dining"
      ? [...diningSlots]
      : kind === "bedroom"
        ? [...bedroomSlots]
        : kind === "study"
          ? [...studySlots]
          : [...livingSlots];

  if (taste?.features.includes("work-from-home") && !slots.includes("desk")) {
    slots = [...slots, "desk"];
  }
  if (taste?.features.includes("small-space")) {
    slots = slots.filter((slot) => slot !== "plant");
  }
  return slots;
}

export function matchReasons(
  product: Product,
  taste: Taste,
  roomKind: RoomKind,
): string[] {
  const reasons: string[] = [];
  if (product.roomKinds.includes(roomKind)) reasons.push("fits this room");
  if (product.themes.includes(taste.theme)) reasons.push(themeName(taste.theme));
  if (product.styles.includes(taste.style)) reasons.push(styleName(taste.style));
  if (product.palettes.includes(taste.palette)) {
    reasons.push(paletteName(taste.palette));
  }
  for (const feature of taste.features) {
    if (product.features.includes(feature)) reasons.push(featureName(feature));
  }
  return reasons;
}

export function scoreProduct(
  product: Product,
  taste: Taste,
  roomKind: RoomKind,
): number {
  let score = 0;
  if (product.roomKinds.includes(roomKind)) score += 14;
  else score -= 28;
  if (product.themes.includes(taste.theme)) score += 14;
  else score -= 6;
  if (product.styles.includes(taste.style)) score += 11;
  else score -= 3;
  if (product.palettes.includes(taste.palette)) score += 12;
  else score -= 5;
  for (const feature of taste.features) {
    if (product.features.includes(feature)) score += 5;
  }
  if (
    taste.features.includes("small-space") &&
    !product.features.includes("small-space") &&
    (product.category === "sofa" || product.category === "table")
  ) {
    score -= 4;
  }
  if (product.arCapable) score += 1;
  return score;
}

export function rankCatalog(
  taste: Taste,
  roomKind: RoomKind,
  category?: ProductCategory,
): RankedItem[] {
  return catalog
    .filter((product) => (category ? product.category === category : true))
    .filter((product) => product.roomKinds.includes(roomKind))
    .map((product) => ({
      product,
      score: scoreProduct(product, taste, roomKind),
      reasons: matchReasons(product, taste, roomKind),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.reasons.length - a.reasons.length ||
        a.product.price - b.product.price,
    );
}

function pickForSlot(
  slot: SlotId,
  taste: Taste,
  roomKind: RoomKind,
  used: Set<string>,
  usedRetailers: Set<string>,
): Product | undefined {
  const ranked = rankCatalog(taste, roomKind, slot).filter(
    (entry) => !used.has(entry.product.id),
  );
  if (ranked.length === 0) return undefined;
  const best = ranked[0];
  const diversified = ranked.find(
    (entry) =>
      !usedRetailers.has(entry.product.retailer) &&
      entry.score >= best.score - 8,
  );
  return (diversified ?? best).product;
}

export function suggestPlacements(
  room: Room,
  taste: Taste,
  existing: Placement[] = [],
): Placement[] {
  const used = new Set<string>();
  const usedRetailers = new Set<string>();
  return slotsFor(room.kind, taste).map((slot) => {
    const previous = existing.find((placement) => placement.slot === slot);
    const product = pickForSlot(slot, taste, room.kind, used, usedRetailers);
    if (product) {
      used.add(product.id);
      usedRetailers.add(product.retailer);
    }
    const fallback = slotDefaults[slot];
    return {
      id: previous?.id ?? uid(slot),
      slot,
      productId: product?.id ?? previous?.productId ?? "",
      x: previous?.x ?? fallback.x,
      y: previous?.y ?? fallback.y,
      scale: previous?.scale ?? fallback.scale,
      rotation: previous?.rotation ?? 0,
    };
  });
}

export function lookSummary(taste: Taste): string {
  const extras =
    taste.features.length > 0
      ? ` · ${taste.features.length} living note${taste.features.length === 1 ? "" : "s"}`
      : "";
  return `${themeName(taste.theme)} · ${styleName(taste.style)} · ${paletteName(taste.palette)}${extras}`;
}
