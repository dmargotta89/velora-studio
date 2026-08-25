import { useEffect, useMemo, useRef, useState } from "react";
import { productById } from "../data/catalog";
import type {
  FeatureId,
  MappingMode,
  Placement,
  Pose6,
  Product,
  ProductCategory,
  Room,
  RoomKind,
  Taste,
} from "../types";
import {
  mappingNoteFor,
  placementsToAr,
  type ArRoomSummary,
  type SavedArRoom,
} from "./arRoom";
import {
  createArRoom,
  deleteArRoom,
  getArRoom,
  listArRooms,
  newCameraFrame,
  putArMesh,
  putArRoom,
  roomFromArRoom,
  studioPlacementsFrom,
} from "./arRoomStore";
import { emptyStudio, loadStudio, saveStudio } from "./storage";
import { rankCatalog, suggestPlacements } from "./suggest";
import { uid } from "./ids";
import { captureNativeLiDARMesh, probeNativeMapper } from "../native/mapper";

export function useStudio() {
  const [state, setState] = useState(emptyStudio);
  const [hydrated, setHydrated] = useState(false);
  const [swapSlot, setSwapSlot] = useState<ProductCategory | null>(null);
  const [walkthrough, setWalkthrough] = useState(false);
  const [savedRooms, setSavedRooms] = useState<ArRoomSummary[]>([]);
  const [arSaveError, setArSaveError] = useState<string | null>(null);
  const skipPersist = useRef(true);

  async function refreshSavedRooms() {
    setSavedRooms(await listArRooms());
  }

  useEffect(() => {
    void (async () => {
      const loaded = loadStudio();
      if (loaded.activeArRoomId) {
        const stored = await getArRoom(loaded.activeArRoomId);
        if (stored) {
          setState({
            ...loaded,
            version: 2,
            room: roomFromArRoom(stored),
            taste: stored.taste,
            placements: studioPlacementsFrom(stored),
            activeArRoomId: stored.id,
          });
          await refreshSavedRooms();
          setHydrated(true);
          skipPersist.current = false;
          return;
        }
      }
      setState(loaded);
      await refreshSavedRooms();
      setHydrated(true);
      skipPersist.current = false;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated || skipPersist.current) return;
    saveStudio(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated || skipPersist.current || !state.activeArRoomId || !state.room) return;
    const handle = window.setTimeout(() => {
      void (async () => {
        const existing = await getArRoom(state.activeArRoomId!);
        if (!existing) return;
        try {
          await putArRoom({
            ...existing,
            name: state.room?.name ?? existing.name,
            kind: state.room?.kind ?? existing.kind,
            mappingMode: state.room?.mappingMode ?? existing.mappingMode,
            mappingNote: mappingNoteFor(state.room?.mappingMode ?? existing.mappingMode),
            taste: state.taste,
            placements: placementsToAr(state.placements),
            updatedAt: new Date().toISOString(),
          });
          await refreshSavedRooms();
        } catch (error) {
          setArSaveError(
            error instanceof Error ? error.message : "Could not save the AR room on this device.",
          );
        }
      })();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [hydrated, state]);

  const selected = state.placements.find((item) => item.id === state.selectedId);
  const mappingMode: MappingMode = state.room?.mappingMode ?? "none";

  const ranked = useMemo(() => {
    if (!state.room) return [];
    return rankCatalog(state.taste, state.room.kind, swapSlot ?? undefined);
  }, [state.room, state.taste, swapSlot]);

  async function persistNewArRoom(room: Room, placements: Placement[], taste: Taste) {
    const frames = room.imageSrc ? [newCameraFrame(room.imageSrc)] : [];
    const arRoom = createArRoom({
      name: room.name,
      kind: room.kind,
      mappingMode: room.mappingMode,
      taste,
      frames,
      placements,
    });
    await putArRoom(arRoom);
    await refreshSavedRooms();
    setState({
      version: 2,
      room: { ...room, id: arRoom.id, note: arRoom.mappingNote },
      taste,
      placements,
      selectedId: null,
      activeArRoomId: arRoom.id,
    });
  }

  function setRoom(room: Room) {
    const placements = suggestPlacements(room, state.taste, []);
    setSwapSlot(null);
    setState({
      version: 2,
      room,
      taste: state.taste,
      placements,
      selectedId: null,
      activeArRoomId: state.activeArRoomId ?? null,
    });
    void persistNewArRoom(room, placements, state.taste);
  }

  function setRoomKind(kind: RoomKind) {
    setSwapSlot(null);
    setState((current) => {
      if (!current.room || current.room.kind === kind) return current;
      const room = { ...current.room, kind };
      return {
        ...current,
        room,
        selectedId: null,
        placements: suggestPlacements(room, current.taste, []),
      };
    });
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
        worldPose: null,
      };
      return {
        ...current,
        selectedId: next.id,
        placements: [...current.placements, next],
      };
    });
  }

  function recordWorldPose(productId: string, pose: Pose6) {
    setState((current) => ({
      ...current,
      placements: current.placements.map((item) =>
        item.productId === productId ? { ...item, worldPose: pose } : item,
      ),
    }));
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

  async function openCameraRoom(input: {
    kind: RoomKind;
    name?: string;
    frames: { imageSrc: string; pose: Pose6 | null }[];
  }) {
    if (input.frames.length === 0) {
      throw new Error("Capture at least one camera frame before opening the room.");
    }
    const cover = input.frames[0].imageSrc;
    const placements = suggestPlacements(
      {
        id: uid("room"),
        name: input.name ?? "Camera capture",
        kind: input.kind,
        imageSrc: cover,
        source: "camera",
        mappingMode: "camera-frame",
        note: mappingNoteFor("camera-frame"),
      },
      state.taste,
      [],
    );
    const arRoom = createArRoom({
      name: input.name ?? "Camera capture",
      kind: input.kind,
      mappingMode: "camera-frame",
      taste: state.taste,
      frames: input.frames.map((frame) => newCameraFrame(frame.imageSrc, frame.pose)),
      placements,
    });
    await putArRoom(arRoom);
    await refreshSavedRooms();
    setSwapSlot(null);
    setState({
      version: 2,
      room: roomFromArRoom(arRoom),
      taste: state.taste,
      placements,
      selectedId: null,
      activeArRoomId: arRoom.id,
    });
  }

  async function addCameraFrame(imageSrc: string, pose: Pose6 | null = null) {
    if (!state.activeArRoomId || !state.room) return;
    const existing = await getArRoom(state.activeArRoomId);
    if (!existing) return;
    const frame = newCameraFrame(imageSrc, pose);
    const next: SavedArRoom = {
      ...existing,
      frames: [...existing.frames, frame],
      updatedAt: new Date().toISOString(),
    };
    await putArRoom(next);
    await refreshSavedRooms();
    setState((current) => ({
      ...current,
      room: current.room
        ? { ...current.room, imageSrc, mappingMode: "camera-frame", note: mappingNoteFor("camera-frame") }
        : current.room,
    }));
  }

  async function resumeArRoom(id: string) {
    const stored = await getArRoom(id);
    if (!stored) throw new Error("That saved AR room was not found on this device.");
    setSwapSlot(null);
    setWalkthrough(false);
    setState({
      version: 2,
      room: roomFromArRoom(stored),
      taste: stored.taste,
      placements: studioPlacementsFrom(stored),
      selectedId: null,
      activeArRoomId: stored.id,
    });
  }

  async function removeSavedRoom(id: string) {
    await deleteArRoom(id);
    await refreshSavedRooms();
    if (state.activeArRoomId === id) {
      setState({ ...emptyStudio, taste: state.taste });
    }
  }

  async function tryCaptureLiDAR(): Promise<{ ok: true } | { ok: false; reason: string }> {
    const probe = await probeNativeMapper();
    if (!probe.ready) {
      return { ok: false, reason: probe.reason };
    }
    if (!state.activeArRoomId) {
      return {
        ok: false,
        reason: "Save a camera AR room first, then attach a native LiDAR mesh to it.",
      };
    }
    try {
      const mesh = await captureNativeLiDARMesh();
      await putArMesh(state.activeArRoomId, mesh);
      await refreshSavedRooms();
      setState((current) => ({
        ...current,
        room: current.room
          ? {
              ...current.room,
              mappingMode: "lidar-mesh",
              note: mappingNoteFor("lidar-mesh"),
            }
          : current.room,
      }));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : "LiDAR capture failed. LiDAR is not running.",
      };
    }
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
    savedRooms,
    mappingMode,
    arSaveError,
    setRoom,
    setRoomKind,
    setTaste,
    toggleFeature,
    selectPlacement,
    movePlacement,
    updatePlacement,
    removePlacement,
    swapProduct,
    recordWorldPose,
    refreshLook,
    openCameraRoom,
    addCameraFrame,
    resumeArRoom,
    removeSavedRoom,
    tryCaptureLiDAR,
    refreshSavedRooms,
    resetAll,
  };
}

export type StudioModel = ReturnType<typeof useStudio>;
