import { useMemo, useState } from "react";
import { productById } from "../data/catalog";
import { money } from "../lib/ids";
import type { StudioModel } from "../lib/useStudio";
import type { Retailer } from "../types";
import { FurnitureGlyph } from "./FurnitureGlyph";

const retailers: Array<Retailer | "All"> = ["All", "Ashley", "Amazon", "Kirkland's"];

export function CatalogPanel({ studio }: { studio: StudioModel }) {
  const [retailer, setRetailer] = useState<Retailer | "All">("All");
  const selectedProduct = studio.selected
    ? productById[studio.selected.productId]
    : undefined;

  const items = useMemo(() => {
    const byStore = studio.ranked.filter((entry) =>
      retailer === "All" ? true : entry.product.retailer === retailer,
    );
    const matched = byStore.filter((entry) => entry.score >= 8);
    return matched.length > 0 ? matched : byStore;
  }, [studio.ranked, retailer]);

  return (
    <aside className="panel">
      <p className="eyebrow">Step three · Catalog</p>
      <h2>Store furniture</h2>
      <p className="muted">
        Mocked Ashley, Amazon, and Kirkland&apos;s pieces ranked for this room
        and look. Live store SDKs are not connected.
      </p>

      {selectedProduct && studio.selected ? (
        <div className="inspector">
          <p className="eyebrow">Selected in the room</p>
          <h3>{selectedProduct.name}</h3>
          <div className="meta-row">
            <span>
              {selectedProduct.retailer} ·{" "}
              {selectedProduct.arCapable ? "AR model" : "Photo only"}
            </span>
            <span>{money(selectedProduct.price)}</span>
          </div>
          <div className="tag-row">
            {selectedProduct.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="inline">
            <button
              className="btn ghost small"
              onClick={() =>
                studio.updatePlacement(studio.selected!.id, {
                  rotation: (studio.selected!.rotation + 15) % 360,
                })
              }
            >
              Rotate
            </button>
            <button
              className="btn ghost small"
              onClick={() =>
                studio.updatePlacement(studio.selected!.id, {
                  scale: Math.min(1.8, studio.selected!.scale + 0.1),
                })
              }
            >
              Larger
            </button>
            <button
              className="btn ghost small"
              onClick={() =>
                studio.updatePlacement(studio.selected!.id, {
                  scale: Math.max(0.55, studio.selected!.scale - 0.1),
                })
              }
            >
              Smaller
            </button>
            <button
              className="btn danger small"
              onClick={() => studio.removePlacement(studio.selected!.id)}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <p className="empty">
          Select a piece to rotate, resize, or swap it. Choosing a card places or
          replaces furniture in the room.
        </p>
      )}

      <div className="section">
        <h3>
          {studio.swapSlot
            ? `Swap ${studio.swapSlot}`
            : "Suggested for this look"}
        </h3>
        <div className="chip-row" style={{ marginBottom: "0.7rem" }}>
          {retailers.map((name) => (
            <button
              key={name}
              className={`retailer-filter chip ${retailer === name ? "active" : ""}`}
              onClick={() => setRetailer(name)}
            >
              <strong>{name}</strong>
            </button>
          ))}
          {studio.swapSlot ? (
            <button className="chip" onClick={() => studio.setSwapSlot(null)}>
              <strong>All categories</strong>
            </button>
          ) : null}
        </div>
        <div className="product-list">
          {items.map(({ product, reasons }) => (
            <button
              key={product.id}
              className={`product-card ${selectedProduct?.id === product.id ? "active" : ""}`}
              onClick={() => studio.swapProduct(product)}
            >
              <span className="thumb" style={{ background: `${product.swatch}33` }}>
                <FurnitureGlyph product={product} className="glyph" />
              </span>
              <span>
                <b>{product.name}</b>
                <small>
                  {product.retailer}
                  {" · "}
                  {product.arCapable ? "AR-capable" : "No AR model"}
                </small>
                {reasons.length > 0 ? (
                  <small className="match-line">
                    {reasons.slice(0, 3).join(" · ")}
                  </small>
                ) : null}
              </span>
              <span className="price">{money(product.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
