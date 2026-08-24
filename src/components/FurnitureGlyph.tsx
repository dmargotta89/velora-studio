import type { Product, ProductCategory } from "../types";

const size: Record<ProductCategory, { w: number; h: number }> = {
  sofa: { w: 168, h: 78 },
  chair: { w: 78, h: 72 },
  table: { w: 96, h: 58 },
  bed: { w: 150, h: 92 },
  desk: { w: 124, h: 64 },
  lamp: { w: 58, h: 110 },
  rug: { w: 210, h: 86 },
  plant: { w: 70, h: 108 },
};

export function FurnitureGlyph({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const box = size[product.category];
  const fill = product.swatch;
  const line = product.accent;

  return (
    <svg
      className={className ?? "glyph"}
      width={box.w}
      height={box.h}
      viewBox={`0 0 ${box.w} ${box.h}`}
      aria-hidden="true"
    >
      {product.category === "sofa" && (
        <>
          <ellipse cx="84" cy="70" rx="78" ry="7" fill="rgba(28,18,10,0.16)" />
          <rect x="10" y="28" width="148" height="34" rx="10" fill={fill} stroke={line} />
          <rect x="16" y="14" width="54" height="22" rx="8" fill={fill} stroke={line} />
          <rect x="98" y="14" width="54" height="22" rx="8" fill={fill} stroke={line} />
          <rect x="68" y="36" width="32" height="14" rx="4" fill={line} opacity="0.18" />
        </>
      )}
      {product.category === "chair" && (
        <>
          <ellipse cx="39" cy="66" rx="22" ry="5" fill="rgba(28,18,10,0.16)" />
          <rect x="18" y="28" width="42" height="28" rx="10" fill={fill} stroke={line} />
          <rect x="22" y="10" width="34" height="24" rx="10" fill={fill} stroke={line} />
          <path d="M24 56v10M54 56v10" stroke={line} strokeWidth="3" />
        </>
      )}
      {product.category === "table" && (
        <>
          <ellipse cx="48" cy="52" rx="36" ry="5" fill="rgba(28,18,10,0.14)" />
          <ellipse cx="48" cy="22" rx="38" ry="12" fill={fill} stroke={line} />
          <rect x="45" y="24" width="6" height="26" fill={line} />
          <ellipse cx="48" cy="50" rx="14" ry="4" fill={fill} stroke={line} />
        </>
      )}
      {product.category === "bed" && (
        <>
          <ellipse cx="75" cy="86" rx="62" ry="6" fill="rgba(28,18,10,0.14)" />
          <rect x="16" y="28" width="118" height="50" rx="8" fill={fill} stroke={line} />
          <rect x="22" y="14" width="106" height="24" rx="8" fill="#f7f1e6" stroke={line} />
          <rect x="28" y="20" width="28" height="14" rx="4" fill={fill} />
          <rect x="94" y="20" width="28" height="14" rx="4" fill={fill} />
        </>
      )}
      {product.category === "desk" && (
        <>
          <ellipse cx="62" cy="58" rx="48" ry="5" fill="rgba(28,18,10,0.14)" />
          <rect x="8" y="22" width="108" height="12" rx="3" fill={fill} stroke={line} />
          <rect x="12" y="34" width="8" height="22" fill={line} />
          <rect x="104" y="34" width="8" height="22" fill={line} />
          <rect x="78" y="26" width="28" height="8" fill={line} opacity="0.25" />
        </>
      )}
      {product.category === "lamp" && (
        <>
          <ellipse cx="29" cy="104" rx="16" ry="4" fill="rgba(28,18,10,0.16)" />
          <path d="M28 100 V34" stroke={line} strokeWidth="3" />
          <path d="M28 38 C 8 42, 8 18, 28 14" fill="none" stroke={fill} strokeWidth="6" />
          <circle cx="29" cy="100" r="7" fill={fill} stroke={line} />
        </>
      )}
      {product.category === "rug" && (
        <>
          <ellipse cx="105" cy="44" rx="92" ry="28" fill={fill} stroke={line} opacity="0.85" />
          <ellipse cx="105" cy="44" rx="70" ry="18" fill="none" stroke={line} opacity="0.35" />
        </>
      )}
      {product.category === "plant" && (
        <>
          <ellipse cx="35" cy="102" rx="16" ry="4" fill="rgba(28,18,10,0.14)" />
          <path d="M35 88 C 18 70, 16 44, 34 22 C 40 48, 28 62, 35 88" fill={fill} />
          <path d="M35 88 C 52 68, 58 40, 40 16 C 38 46, 48 64, 35 88" fill={fill} opacity="0.8" />
          <rect x="26" y="84" width="18" height="16" rx="3" fill={line} />
        </>
      )}
    </svg>
  );
}
