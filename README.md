# Velora Studio

Scan a space. Choose how you want to live in it. Walk the look in AR — with furniture from stores you already shop.

Velora Studio is a home design product. The long-term loop is:

1. **Scan** a room or house (LiDAR / 3D capture).
2. **Style** it with themes, features, color palettes, and styles.
3. **Place** AR furniture from retailers that already ship AR models (Ashley, Amazon, Kirkland’s, and similar).
4. **Walk** the composed look in AR, then swap styles and rearrange pieces in-app.

## What this slice is

This repository is the **design brain** on the web — the taste, suggestion, spatial layout, and preview layer.

A first-time user can:

- Open a room from a **photo upload** or a **sample interior** (stand-in for a future 3D scan).
- Pick a **room type, theme, style, color palette, and living notes**. Those pickers change the furniture suggestions.
- See **mocked retailer product cards** (Ashley, Amazon, Kirkland’s) ranked for the current room and look, with match reasons.
- Rearrange **3D furniture in a spatial room** that uses the photo as the far-wall scan stand-in. Palette lighting tints the room.
- Play a **PREVIEW walkthrough** — a first-person camera pass through the staged room. It is labeled as preview, not live AR.
- Keep the look in **localStorage** on this device. No account, no backend.

## What this is not

This app does **not** include:

- Real LiDAR / room scanning
- Live Ashley, Amazon, or Kirkland’s AR SDKs or store checkout
- Photoreal in-room AR rendering
- Accounts, cloud sync, or a backend

The walkthrough is a composition preview over a simple 3D layout — not a live AR session.

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

Vite, React 19, TypeScript, and Three.js (via React Three Fiber). Client-only.

Sample interiors are bundled under `public/rooms/` (Unsplash photographs, used as scan stand-ins).
