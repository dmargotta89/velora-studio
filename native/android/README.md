# Native depth mapper (Android)

ARCore depth / raw depth can produce a real geometric reconstruction on
supported devices. It is **not** a photo, and it is **not** available in a
normal desktop browser.

The web contract is `window.VeloraNativeMapper` with `platform: "arcore-depth"`.
See `src/native/mapper.ts`.

This Linux cloud VM does not build an Android host. Until an ARCore app injects
the bridge, Velora stays camera-only and must not invent a mesh from getUserMedia.
