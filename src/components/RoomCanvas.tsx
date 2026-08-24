import { lazy, Suspense, useState } from "react";
import { money } from "../lib/ids";
import { lookSummary } from "../lib/suggest";
import type { StudioModel } from "../lib/useStudio";

const SpatialStage = lazy(async () => {
  const mod = await import("./SpatialStage");
  return { default: mod.SpatialStage };
});

export function RoomCanvas({ studio }: { studio: StudioModel }) {
  const room = studio.state.room;
  const [walkIndex, setWalkIndex] = useState(0);

  if (!room) return null;

  const walkItem = studio.placedProducts[walkIndex];
  const count = studio.placedProducts.length;

  return (
    <div className="canvas-wrap">
      <div className="canvas spatial-canvas">
        <Suspense fallback={<div className="spatial-fallback">Building the room…</div>}>
          <SpatialStage studio={studio} walkIndex={walkIndex} />
        </Suspense>
        <div className="preview-badge">
          <span>PREVIEW</span>
          Spatial walkthrough of a photo-based room — not live AR, not a LiDAR scan
        </div>
        {studio.walkthrough && walkItem ? (
          <div className="walkthrough" onClick={() => studio.setWalkthrough(false)}>
            <div className="walk-card" onClick={(event) => event.stopPropagation()}>
              <button
                className="walk-close"
                onClick={() => studio.setWalkthrough(false)}
                aria-label="Close preview walkthrough"
              >
                Close
              </button>
              <p className="eyebrow">PREVIEW walkthrough · not live AR</p>
              <p className="walk-count">
                Piece {walkIndex + 1} of {count}
              </p>
              <h2>{walkItem.product.name}</h2>
              <p>
                First-person pass through the staged room. In the full product you
                walk this look with the retailer&apos;s AR model. This camera path
                is a preview only — {walkItem.product.retailer},{" "}
                {money(walkItem.product.price)},{" "}
                {walkItem.product.arCapable
                  ? "mocked as AR-capable."
                  : "photo reference, no AR model yet."}
              </p>
              <div className="walk-actions">
                <button
                  className="btn small"
                  onClick={() =>
                    setWalkIndex((index) => (index === 0 ? count - 1 : index - 1))
                  }
                >
                  Previous
                </button>
                <button
                  className="btn small"
                  onClick={() =>
                    setWalkIndex((index) => (index === count - 1 ? 0 : index + 1))
                  }
                >
                  Next piece
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="canvas-bar">
        <div>
          <p className="eyebrow">{room.name}</p>
          <p className="look-line">{lookSummary(studio.state.taste)}</p>
        </div>
        <div className="inline">
          <button className="btn ghost small" onClick={studio.refreshLook}>
            Reset placements
          </button>
          <button
            className="btn small"
            onClick={() => {
              const selectedIndex = studio.placedProducts.findIndex(
                (item) => item.placement.id === studio.state.selectedId,
              );
              setWalkIndex(selectedIndex >= 0 ? selectedIndex : 0);
              studio.setWalkthrough(true);
            }}
          >
            Preview walkthrough
          </button>
        </div>
      </div>
    </div>
  );
}
