import { useRef, useState, type PointerEvent } from "react";
import { money } from "../lib/ids";
import { lookSummary } from "../lib/suggest";
import type { StudioModel } from "../lib/useStudio";
import { FurnitureGlyph } from "./FurnitureGlyph";

export function RoomCanvas({ studio }: { studio: StudioModel }) {
  const room = studio.state.room;
  const stageRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [walkIndex, setWalkIndex] = useState(0);

  if (!room) return null;

  function pointToPercent(event: PointerEvent<HTMLDivElement>) {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return { x: 50, y: 50 };
    return {
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragId) return;
    const next = pointToPercent(event);
    studio.movePlacement(dragId, next.x, next.y);
  }

  const walkItem = studio.placedProducts[walkIndex];

  return (
    <div className="canvas-wrap">
      <div
        ref={stageRef}
        className="canvas"
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragId(null)}
        onPointerLeave={() => setDragId(null)}
        onClick={() => studio.selectPlacement(null)}
      >
        <img className="room-photo" src={room.imageSrc} alt={room.name} />
        <div className="canvas-hint">
          Suggested placements sit on the photo like an AR pass. Drag to
          rearrange. Click a piece to swap it from the store catalog.
        </div>
        {studio.placedProducts.map(({ placement, product }) => {
          const selected = studio.state.selectedId === placement.id;
          return (
            <button
              key={placement.id}
              className={`mark ${placement.slot} ${selected ? "selected" : ""}`}
              style={{
                left: `${placement.x}%`,
                top: `${placement.y}%`,
              }}
              onClick={(event) => {
                event.stopPropagation();
                studio.selectPlacement(placement.id);
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                studio.selectPlacement(placement.id);
                setDragId(placement.id);
              }}
            >
              <span
                className="glyph-wrap"
                style={{
                  transform: `rotate(${placement.rotation}deg) scale(${placement.scale})`,
                }}
              >
                <FurnitureGlyph product={product} />
              </span>
              <span className="mark-card">
                <b>{product.name}</b>
                <small>
                  <i className={`ar-dot ${product.arCapable ? "" : "off"}`} />
                  {product.retailer} · {money(product.price)} ·{" "}
                  {product.arCapable ? "AR model" : "Photo only"}
                </small>
              </span>
            </button>
          );
        })}

        {studio.walkthrough && walkItem ? (
          <div className="walkthrough" onClick={(event) => event.stopPropagation()}>
            <div className="walk-card">
              <p className="eyebrow">Look walkthrough · preview</p>
              <h2>{walkItem.product.name}</h2>
              <p>
                In the full product you walk this composition in AR with the
                retailer&apos;s model. This pass is the design brain only —{" "}
                {walkItem.product.retailer}, {money(walkItem.product.price)},{" "}
                {walkItem.product.arCapable
                  ? "already marked AR-capable."
                  : "photo reference, no AR model yet."}
              </p>
              <div className="walk-actions">
                <button
                  className="btn small"
                  onClick={() =>
                    setWalkIndex((index) =>
                      index === 0 ? studio.placedProducts.length - 1 : index - 1,
                    )
                  }
                >
                  Previous
                </button>
                <button
                  className="btn small"
                  onClick={() =>
                    setWalkIndex((index) =>
                      index === studio.placedProducts.length - 1 ? 0 : index + 1,
                    )
                  }
                >
                  Next piece
                </button>
                <button
                  className="btn ghost small"
                  onClick={() => studio.setWalkthrough(false)}
                >
                  Close
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
          <button className="btn small" onClick={() => studio.setWalkthrough(true)}>
            Preview walkthrough
          </button>
        </div>
      </div>
    </div>
  );
}
