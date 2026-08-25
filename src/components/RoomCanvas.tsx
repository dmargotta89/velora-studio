import { lazy, Suspense, useState } from "react";
import { money } from "../lib/ids";
import { lookSummary } from "../lib/suggest";
import type { StudioModel } from "../lib/useStudio";

const SpatialStage = lazy(async () => {
  const mod = await import("./SpatialStage");
  return { default: mod.SpatialStage };
});

const ArControls = lazy(async () => {
  const mod = await import("./ArControls");
  return { default: mod.ArControls };
});

export function RoomCanvas({ studio }: { studio: StudioModel }) {
  const room = studio.state.room;
  const [walkIndex, setWalkIndex] = useState(0);

  if (!room) return null;

  const count = studio.placedProducts.length;
  const safeIndex = count === 0 ? 0 : ((walkIndex % count) + count) % count;
  const walkItem = studio.placedProducts[safeIndex];
  const captureLine =
    room.source === "camera"
      ? "Camera frame"
      : room.source === "upload"
        ? "Uploaded photo"
        : "Sample photo";

  return (
    <div className="canvas-wrap">
      <div className="canvas spatial-canvas">
        <img className="spatial-photo-bg" src={room.imageSrc} alt="" />
        <Suspense
          fallback={
            <div className="spatial-fallback">
              <span>Staging the look…</span>
            </div>
          }
        >
          <SpatialStage studio={studio} walkIndex={safeIndex} />
        </Suspense>
        <div className="preview-badge">
          <span>PREVIEW</span>
          {captureLine} · 3D stage, not LiDAR · AR only on a compatible device
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
                Piece {safeIndex + 1} of {count}
              </p>
              <h2>{walkItem.product.name}</h2>
              <p>
                First-person pass through the staged room. This is the non-AR path.
                On-device AR is a separate WebXR session when the device supports
                immersive-ar and floor hit-test. {walkItem.product.retailer},{" "}
                {money(walkItem.product.price)}, mocked catalog
                {walkItem.product.arCapable
                  ? " — flagged as AR-capable, not a live store SDK."
                  : " — photo reference, no AR model yet."}
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
          <p className="look-hint">
            Click a piece to select, then drag it. Drag empty space to look around.
            PREVIEW stays the path unless WebXR AR actually starts.
          </p>
        </div>
        <div className="inline canvas-bar-actions">
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
          <Suspense fallback={<span className="ar-check">Checking WebXR…</span>}>
            <ArControls studio={studio} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
