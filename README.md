# Velora Studio

Scan a space. Choose how you want to live in it. Walk the look in AR — with furniture from stores you already shop.

Velora Studio is a home design product. The long-term loop is:

1. **Scan** a room or house (LiDAR / 3D capture on native devices that can actually reconstruct a mesh).
2. **Style** it with themes, features, color palettes, and styles.
3. **Place** AR furniture from retailers that already ship AR models (Ashley, Amazon, Kirkland’s, and similar).
4. **Walk** the composed look in AR, then swap styles and rearrange pieces in-app.

## What this slice is

Honest capture, a **saved AR room** on this device, and a **gated** LiDAR path:

- **Camera capture** — `getUserMedia` starts from the Open camera click (so phones can grant permission), waits for a live frame, and lets you grab one or more photo frames. Upload and sample interiors remain as fallback. This is **not** LiDAR and is **never** turned into a fake mesh.
- **Saved AR rooms** — versioned local format (`velora-ar-room` v1 in IndexedDB): frames, furniture placements, taste, and **real WebXR poses only if an AR session actually recorded them**. Resume later on this device.
- **Mapping mode is always labeled:** `camera frame` · `LiDAR mesh` · `none`.
- **LiDAR / true mapping** — only if a native host injects `window.VeloraNativeMapper` (iOS ARKit scene reconstruction or ARCore depth) and that host stores a real mesh. Typical web cannot. The iOS scaffold lives in `native/ios/` and **requires a Mac + LiDAR iPhone pool** to build and run.
- Pick a **room type, theme, style, color palette, and living notes**. Those pickers change the furniture suggestions (mocked Ashley / Amazon / Kirkland’s).
- **On-device AR** — WebXR `immersive-ar` + floor hit-test when available; otherwise PREVIEW. We never pretend AR is live.

## What this is not

- A LiDAR mesh generated from a 2D camera frame
- Live Ashley, Amazon, or Kirkland’s AR SDKs
- A compiled iOS/Android app in this Linux environment

Camera needs **HTTPS or localhost**, a camera, and permission. LiDAR needs the native mapper; without it the UI says **camera-only / LiDAR is not running**.

## Run locally

You need Node.js 20+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). On a phone, use the Network URL over HTTPS (or a tunnel) so `getUserMedia` is allowed.

Saved AR rooms use IndexedDB (`velora-ar-rooms`). The last look pointer stays in `localStorage` key `velora-studio-v1`.

## Stack

Vite, React 19, TypeScript, and Three.js. Client-only. Catalog GLBs are simple local models, not live retailer assets.
