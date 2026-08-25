# Velora Studio

Scan a space. Choose how you want to live in it. Walk the look in AR — with furniture from stores you already shop.

Velora Studio is a home design product. The long-term loop is:

1. **Scan** a room or house (future LiDAR / 3D capture — not this slice).
2. **Style** it with themes, features, color palettes, and styles.
3. **Place** AR furniture from retailers that already ship AR models (Ashley, Amazon, Kirkland’s, and similar).
4. **Walk** the composed look in AR, then swap styles and rearrange pieces in-app.

## What this slice is

This repository is the **design brain** on the web, plus the next honest capture and AR steps:

- **Camera capture** — take a photo or video frame with the device camera (`getUserMedia`). Upload and sample interiors remain as fallback. This is not LiDAR and not a live 3D mesh.
- Pick a **room type, theme, style, color palette, and living notes**. Those pickers change the furniture suggestions.
- See **mocked retailer product cards** (Ashley, Amazon, Kirkland’s) ranked for the current room and look. Live store SDKs are not connected.
- Rearrange **3D furniture in a spatial PREVIEW room**. Palette lighting tints the room.
- **On-device AR** — if WebXR `immersive-ar` and floor **hit-test** are available, place mocked catalog GLB pieces on a detected floor. If they are not, the PREVIEW walkthrough stays the path and the UI says AR is not running. We never pretend AR is live.
- Keep the look in **localStorage** on this device. No account, no backend.

## What this is not

This app does **not** include:

- LiDAR / true 3D room scanning (camera capture is a 2D frame)
- Live Ashley, Amazon, or Kirkland’s AR SDKs or store checkout
- Photoreal in-room rendering from a retailer SDK
- Accounts, cloud sync, or a backend

Camera needs a **secure context** (HTTPS or localhost) and a camera the browser can open. Permission denial, missing camera, or an insecure page is a hard stop for capture — upload and samples still work.

WebXR AR typically needs a compatible device (for example Android Chrome with ARCore). Desktop browsers usually fail `isSessionSupported('immersive-ar')`; that is expected, and PREVIEW is the honest path there.

## Run locally

You need Node.js 20+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build
npm run preview
```

The production build is a static site. Designs persist in the browser via `localStorage` key `velora-studio-v1`.

## Stack

Vite, React 19, TypeScript, and Three.js (via React Three Fiber). Client-only. WebXR is used directly for the AR session (hit-test required). Catalog GLBs are simple local models generated from the mocked pieces.

Sample interiors are bundled under `public/rooms/` (Unsplash photographs).
