import { useEffect, useMemo, useState } from "react";
import { productById } from "../data/catalog";
import type {
  FeatureId,
  Placement,
  Product,
  ProductCategory,
  Room,
  Taste,
} from "../types";
import { emptyStudio, loadStudio, saveStudio } from "./storage";
import { rankCatalog, suggestPlacements } from "./suggest";
import { uid } from "./ids";

export function useStudio() {
  const [state, setState] = useState(emptyStudio);
  const [hydrated, setHydrated] = useState(false);
  const [swapSlot, setSwapSlot] = useState<ProductCategory | null>(null);
  const [walkthrough, setWalkthrough] = useState(false);

  useEffect(() => {
    setState(loadStudio());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveStudio(state);
  }, [hydrated, state]);

  const selected = state.placements.find((item) => item.id === state.selectedId);

  const ranked = useMemo(() => {
    if (!state.room) return [];
    return rankCatalog(state.taste, state.room.kind, swapSlot ?? undefined);
  }, [state.room, state.taste, swapSlot]);

  function setRoom(room: Room) {
    setState((current) => ({
      ...current,
      room,
      selectedId: null,
      placements: suggestPlacements(room, current.taste, []),
    }));
    setSwapSlot(null);
  }

  function setTaste(partial: Partial<Taste>) {
    setState((current) => {
      const taste = { ...current.taste, ...partial };
      if (!current.room) return { ...current, taste };
      return {
        ...current,
        taste,
        placements: suggestPlacements(current.room, taste, current.placements),
      };
    });
  }

  function toggleFeature(feature: FeatureId) {
    setState((current) => {
      const has = current.taste.features.includes(feature);
      const features = has
        ? current.taste.features.filter((item) => item !== feature)
        : [...current.taste.features, feature];
      const taste = { ...current.taste, features };
      if (!current.room) return { ...current, taste };
      return {
        ...current,
        taste,
        placements: suggestPlacements(current.room, taste, current.placements),
      };
    });
  }

  function selectPlacement(id: string | null) {
    setState((current) => ({ ...current, selectedId: id }));
    if (!id) {
      setSwapSlot(null);
      return;
    }
    const placement = state.placements.find((item) => item.id === id);
    setSwapSlot(placement?.slot ?? null);
  }

  function movePlacement(id: string, x: number, y: number) {
    setState((current) => ({
      ...current,
      placements: current.placements.map((item) =>
        item.id === id
          ? {
              ...item,
              x: Math.min(92, Math.max(8, x)),
              y: Math.min(90, Math.max(18, y)),
            }
          : item,
      ),
    }));
  }

  function updatePlacement(id: string, patch: Partial<Placement>) {
    setState((current) => ({
      ...current,
      placements: current.placements.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }

  function removePlacement(id: string) {
    if (state.selectedId === id) setSwapSlot(null);
    setState((current) => ({
      ...current,
      selectedId: current.selectedId === id ? null : current.selectedId,
      placements: current.placements.filter((item) => item.id !== id),
    }));
  }

  function swapProduct(product: Product) {
    setState((current) => {
      if (current.selectedId) {
        return {
          ...current,
          placements: current.placements.map((item) =>
            item.id === current.selectedId
              ? { ...item, productId: product.id, slot: product.category }
              : item,
          ),
        };
      }
      if (!current.room) return current;
      const next: Placement = {
        id: uid(product.category),
        slot: product.category,
        productId: product.id,
        x: 50,
        y: 62,
        scale: 1,
        rotation: 0,
      };
      return {
        ...current,
        selectedId: next.id,
        placements: [...current.placements, next],
      };
    });
  }

  function refreshLook() {
    setSwapSlot(null);
    setState((current) => {
      if (!current.room) return current;
      return {
        ...current,
        selectedId: null,
        placements: suggestPlacements(current.room, current.taste, []),
      };
    });
  }

  function resetAll() {
    setState(emptyStudio);
    setSwapSlot(null);
    setWalkthrough(false);
  }

  const placedProducts = state.placements
    .map((placement) => ({
      placement,
      product: productById[placement.productId],
    }))
    .filter((item) => item.product);

  return {
    hydrated,
    state,
    selected,
    ranked,
    swapSlot,
    setSwapSlot,
    walkthrough,
    setWalkthrough,
    placedProducts,
    setRoom,
    setTaste,
    toggleFeature,
    selectPlacement,
    movePlacement,
    updatePlacement,
    removePlacement,
    swapProduct,
    refreshLook,
    resetAll,
  };
}

export type StudioModel = ReturnType<typeof useStudio>;
