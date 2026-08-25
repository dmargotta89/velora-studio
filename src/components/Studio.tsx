import { useEffect } from "react";
import type { StudioModel } from "../lib/useStudio";
import { CatalogPanel } from "./CatalogPanel";
import { LidarGate } from "./LidarGate";
import { MappingBadge } from "./MappingBadge";
import { RoomCanvas } from "./RoomCanvas";
import { TasteRail } from "./TasteRail";

export function Studio({
  studio,
  onChangeRoom,
  onHome,
}: {
  studio: StudioModel;
  onChangeRoom: () => void;
  onHome: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!studio.state.selectedId) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        const target = event.target as HTMLElement | null;
        if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
        event.preventDefault();
        studio.removePlacement(studio.state.selectedId);
      }
      if (event.key === "Escape") studio.selectPlacement(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio]);

  return (
    <div className="studio">
      <header className="topbar">
        <button className="wordmark" onClick={onHome}>
          <strong>Velora</strong>
          <span>Studio</span>
        </button>
        <MappingBadge mode={studio.mappingMode} />
        <div className="topbar-actions">
          <span className="save-pill">
            {studio.state.activeArRoomId ? "AR room saved on this device" : "Saved on this device"}
          </span>
          <LidarGate studio={studio} />
          <button className="btn ghost small" onClick={onChangeRoom}>
            Change room
          </button>
          <button
            className="btn ghost small"
            onClick={() => {
              studio.resetAll();
              onHome();
            }}
          >
            Start over
          </button>
        </div>
      </header>
      <div className="studio-body">
        <TasteRail studio={studio} />
        <RoomCanvas studio={studio} />
        <CatalogPanel studio={studio} />
      </div>
    </div>
  );
}
