import { useEffect, useState } from "react";
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
      <button className="btn ghost small" onClick={() => setOpen((value) => !value)}>
        {studio.mappingMode === "lidar-mesh" ? "LiDAR mesh saved" : "LiDAR / mapping"}
      </button>
      {open ? (
        <div className="ar-why lidar-why">
          <p className="eyebrow">Mapping mode · {copy.tag}</p>
          <p>{copy.line}</p>
          {probe && !lidarReady && !probe.lidar.ready ? (
            <p>
              <strong>LiDAR is not running.</strong> {probe.lidar.reason} This
              device is camera-only unless a native ARKit LiDAR or ARCore depth
              host injects a mapper. We never build a fake mesh from a photo.
            </p>
          ) : null}
          {lidarReady && probe.lidar.ready ? (
            <p>
              Native mapper ready ({probe.lidar.platform}). Capture writes a real
              mesh into the saved AR room.
            </p>
          ) : null}
          {message ? <p>{message}</p> : null}
          <div className="inline" style={{ marginTop: "0.65rem" }}>
            <button className="btn small" disabled={!lidarReady || busy} onClick={() => void onScan()}>
              {busy ? "Capturing mesh…" : "Capture LiDAR mesh"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
