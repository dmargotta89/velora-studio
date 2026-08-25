import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { mappingModeCopy, probeMapping, type MappingProbe } from "../lib/mapping";
import type { StudioModel } from "../lib/useStudio";

export function LidarGate({ studio }: { studio: StudioModel }) {
  const [probe, setProbe] = useState<MappingProbe | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void probeMapping().then((result) => {
      if (alive) setProbe(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function onScan() {
    setBusy(true);
    setMessage(null);
    const result = await studio.tryCaptureLiDAR();
    setBusy(false);
    setMessage(result.ok ? "LiDAR mesh stored on this device." : result.reason);
  }

  const lidarReady = probe?.lidar.ready === true;
  const copy = mappingModeCopy(studio.mappingMode);

  return (
    <div className="lidar-gate">
      <button className="btn ghost small" onClick={() => setOpen(true)}>
        {studio.mappingMode === "lidar-mesh" ? "LiDAR mesh saved" : "LiDAR / mapping"}
      </button>
      {open
        ? createPortal(
            <div className="camera-overlay" role="dialog" aria-modal="true" aria-label="Mapping mode">
              <div className="camera-panel">
                <div className="camera-head">
                  <div>
                    <p className="eyebrow">Mapping mode · {copy.tag}</p>
                    <h2>{copy.tag}</h2>
                  </div>
                  <button className="btn ghost small" onClick={() => setOpen(false)}>
                    Close
                  </button>
                </div>
                <p className="muted">{copy.line}</p>
                {probe && !probe.lidar.ready ? (
                  <div className="camera-blocker" style={{ marginTop: "1rem" }}>
                    <p>
                      <strong>LiDAR is not running.</strong> {probe.lidar.reason} This
                      device is camera-only unless a native ARKit LiDAR or ARCore
                      depth host injects a mapper. We never build a fake mesh from a
                      photo.
                    </p>
                  </div>
                ) : null}
                {lidarReady && probe.lidar.ready ? (
                  <p className="muted" style={{ marginTop: "0.8rem" }}>
                    Native mapper ready ({probe.lidar.platform}). Capture writes a
                    real mesh into the saved AR room.
                  </p>
                ) : null}
                {message ? <p className="muted" style={{ marginTop: "0.8rem" }}>{message}</p> : null}
                <div className="camera-actions" style={{ marginTop: "1rem" }}>
                  <button className="btn small" disabled={!lidarReady || busy} onClick={() => void onScan()}>
                    {busy ? "Capturing mesh…" : "Capture LiDAR mesh"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
