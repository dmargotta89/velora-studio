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
    return studio.ranked.filter((product) =>
      retailer === "All" ? true : product.retailer === retailer,
    );
  }, [studio.ranked, retailer]);

  return (
    <aside className="panel">
      <p className="eyebrow">Step three · Catalog</p>
      <h2>Store furniture</h2>
      <p className="muted">
        Mocked Ashley, Amazon, and Kirkland&apos;s pieces with AR-ready cards.
        Live store SDKs are not connected.
      </p>

      {selectedProduct && studio.selected ? (
        <div className="inspector">
          <p className="eyebrow">Selected on the photo</p>
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
          Select a pin to rotate, resize, or swap it. Choosing a card places or
          replaces a piece.
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
          {items.map((product) => (
            <button
              key={product.id}
              className={`product-card ${selectedProduct?.id === product.id ? "active" : ""}`}
              onClick={() => studio.swapProduct(product)}
            >
              <span className="thumb" style={{ background: `${product.swatch}33` }}>
                <FurnitureGlyph
                  product={product}
                  className="glyph"
                />
              </span>
              <span>
                <b>{product.name}</b>
                <small>
                  {product.retailer}
                  {" · "}
                  {product.arCapable ? "AR-capable" : "No AR model"}
                </small>
              </span>
              <span className="price">{money(product.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
