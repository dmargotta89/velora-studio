# Native LiDAR mapper (iOS)

This web slice **does not** reconstruct a room mesh from a camera photo.

A real mesh is produced only by ARKit scene reconstruction on a LiDAR-capable
iPhone / iPad, running in a native host that injects:

```js
window.VeloraNativeMapper = {
  probe: async () => ({ ready: true, platform: "arkit-lidar" }),
  captureLiDARMesh: async () => ({ source: "arkit-lidar", format: "usdz", bytes })
}
```

The TypeScript contract lives in `src/native/mapper.ts`. Swift sources in this
folder are the native side of that contract.

## Why this is not built here

This agent runs on Linux. Xcode, the iOS Simulator, and on-device ARKit LiDAR
require a **Mac + LiDAR iPhone pool**. Until that host exists, `window.VeloraNativeMapper`
is absent, the web app stays **camera-only**, and copy says LiDAR is not running.

## What the Swift mapper must do

1. `ARWorldTrackingConfiguration` with `sceneReconstruction = .mesh` (LiDAR).
2. Export the mesh (USDZ or OBJ) as `Data`.
3. Hand the bytes to JS. Empty data is a failure, not a fake mesh.
4. Devices without LiDAR must `probe()` → `{ ready: false }` so the web UI
   labels them camera-only.

Do not implement a depth-from-photo fallback.
