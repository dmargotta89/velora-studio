import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FloorArRuntime, type ArRuntimeStatus } from "../lib/arRuntime";
import { probeImmersiveAr, type XrProbe } from "../lib/webxr";
import type { StudioModel } from "../lib/useStudio";

function statusCopy(status: ArRuntimeStatus | null): string {
  if (!status || status.kind === "starting") {
    return "Starting a real WebXR session with floor hit-test…";
  }
  if (status.kind === "no-floor") {
    return "Point the camera at the floor until the reticle appears. AR is running only if you see the live room behind this menu.";
  }
  if (status.kind === "floor") {
    return "Floor found. Tap the floor (or Place here) to drop the selected mocked catalog piece.";
  }
  return `Placed ${status.name} (${status.count}). Still mocked catalog GLB — not a live store SDK.`;
}

export function ArControls({ studio }: { studio: StudioModel }) {
  const [probe, setProbe] = useState<XrProbe | null>(null);
  const [why, setWhy] = useState(false);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ArRuntimeStatus | null>(null);
  const [pieceId, setPieceId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<FloorArRuntime | null>(null);
  const pieceRef = useRef<(typeof studio.placedProducts)[number] | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    void probeImmersiveAr().then((result) => {
      if (alive) setProbe(result);
    });
    const root = document.createElement("div");
    root.className = "ar-dom-overlay";
    document.body.appendChild(root);
    overlayRef.current = root;
    return () => {
      alive = false;
      overlayRef.current = null;
      root.remove();
      void runtimeRef.current?.end();
    };
  }, []);

  useEffect(() => {
    if (studio.walkthrough) setWhy(false);
  }, [studio.walkthrough]);

  const pieces = studio.placedProducts;
  const selected = pieces.find((item) => item.product.id === pieceId) ?? pieces[0];
  pieceRef.current = selected;

  async function enterAr() {
    const overlay = overlayRef.current;
    if (!overlay) {
      setError("Could not open the AR overlay. AR is not running.");
      return;
    }
    setError(null);
    setWhy(false);
    setLive(true);
    setStatus({ kind: "starting" });
    const runtime = new FloorArRuntime();
    runtimeRef.current = runtime;
    try {
      await runtime.start({
        overlay,
        getPiece: () => {
          const item = pieceRef.current;
          if (!item) return null;
          return { product: item.product, scale: item.placement.scale };
        },
        onStatus: setStatus,
        onEnded: () => {
          runtimeRef.current = null;
          setLive(false);
          setStatus(null);
        },
      });
    } catch (caught) {
      runtimeRef.current = null;
      setLive(false);
      setStatus(null);
      setError(caught instanceof Error ? caught.message : "Could not start AR. AR is not running.");
    }
  }

  function exitAr() {
    void runtimeRef.current?.end();
  }

  const checking = probe === null;
  const unsupported = probe !== null && !probe.ready;
  const overlay = overlayRef.current;

  return (
    <>
      <div className="ar-launch">
        {checking ? (
          <span className="ar-check">Checking WebXR…</span>
        ) : unsupported ? (
          <button className="btn ghost small" onClick={() => setWhy((open) => !open)}>
            AR needs a compatible device
          </button>
        ) : (
          <button className="btn small" onClick={() => void enterAr()} disabled={live || pieces.length === 0}>
            Place on floor in AR
          </button>
        )}
      </div>
      {why && unsupported ? (
        <div className="ar-why">
          <p className="eyebrow">AR is not running</p>
          <p>{probe.reason}</p>
          <p>
            Use <strong>Preview walkthrough</strong> on this device. On-device AR
            is WebXR immersive-ar with floor hit-test — never a simulated AR
            view. Catalog pieces stay mocked; live Ashley / Amazon / Kirkland&apos;s
            SDKs are not connected.
          </p>
        </div>
      ) : null}
      {error ? (
        <div className="ar-why">
          <p className="eyebrow">AR is not running</p>
          <p>{error}</p>
        </div>
      ) : null}
      {live && overlay
        ? createPortal(
            <div className="ar-hud">
              <div className="ar-hud-banner">
                <span>ON-DEVICE AR</span>
                Floor hit-test · mocked catalog GLB · not a live store SDK
              </div>
              <p className="ar-hud-status">{statusCopy(status)}</p>
              <div className="ar-piece-row">
                {pieces.map(({ product }) => (
                  <button
                    key={product.id}
                    className={`chip ${selected?.product.id === product.id ? "active" : ""}`}
                    onClick={() => setPieceId(product.id)}
                  >
                    <strong>{product.name}</strong>
                  </button>
                ))}
              </div>
              <div className="ar-hud-actions">
                <button
                  className="btn small"
                  disabled={status?.kind !== "floor" && status?.kind !== "placed"}
                  onClick={() => void runtimeRef.current?.placeAtReticle()}
                >
                  Place here
                </button>
                <button className="btn ghost small" onClick={() => runtimeRef.current?.undo()}>
                  Undo
                </button>
                <button className="btn ghost small" onClick={exitAr}>
                  Exit AR
                </button>
              </div>
            </div>,
            overlay,
          )
        : null}
    </>
  );
}
