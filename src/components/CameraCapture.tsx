import { useEffect, useRef, useState } from "react";
import { cameraErrorMessage, videoFrameToRoomDataUrl } from "../lib/image";
import { uid } from "../lib/ids";
import type { Room, RoomKind } from "../types";

export function CameraCapture({
  kind,
  onCapture,
  onCancel,
}: {
  kind: RoomKind;
  onCapture: (room: Room) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);

    async function start() {
      if (!window.isSecureContext) {
        setError(cameraErrorMessage(new Error("insecure context")));
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(cameraErrorMessage(new Error("getUserMedia missing")));
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        setReady(true);
      } catch (caught) {
        if (!cancelled) setError(cameraErrorMessage(caught));
      }
    }

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const video = videoRef.current;
      if (video) video.srcObject = null;
    };
  }, [facing]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !ready) return;
    setBusy(true);
    try {
      const imageSrc = videoFrameToRoomDataUrl(video);
      stopStream();
      onCapture({
        id: uid("room"),
        name: "Camera capture",
        kind,
        imageSrc,
        source: "camera",
        note: "Captured from this device camera as a photo frame. Not a LiDAR mesh.",
      });
    } catch (caught) {
      setBusy(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not grab a frame from the camera.",
      );
    }
  }

  return (
    <div className="camera-overlay" role="dialog" aria-modal="true" aria-label="Camera capture">
      <div className="camera-panel">
        <div className="camera-head">
          <div>
            <p className="eyebrow">Device camera · not LiDAR</p>
            <h2>Capture a room frame</h2>
          </div>
          <button className="btn ghost small" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <p className="muted">
          This uses getUserMedia to take a photo or video frame of the room. It is
          not a LiDAR or 3D mesh. The frame stays on this device.
        </p>
        {error ? (
          <div className="camera-blocker">
            <p>{error}</p>
            <button className="btn small" onClick={onCancel}>
              Use upload or a sample instead
            </button>
          </div>
        ) : (
          <>
            <div className="camera-stage">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                aria-label="Live camera preview"
              />
              {!ready ? <span className="camera-waiting">Opening camera…</span> : null}
            </div>
            <div className="camera-actions">
              <button className="btn" disabled={!ready || busy} onClick={capture}>
                Capture frame
              </button>
              <button
                className="btn ghost"
                disabled={busy}
                onClick={() =>
                  setFacing((current) => (current === "environment" ? "user" : "environment"))
                }
              >
                Flip camera
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
