import { useEffect, useRef, useState } from "react";
import {
  attachCameraStream,
  openCameraStream,
  stopStream,
  waitForVideoFrame,
} from "../lib/camera";
import { cameraErrorMessage, videoFrameToRoomDataUrl } from "../lib/image";
import type { Pose6, RoomKind } from "../types";

export interface CapturedFrame {
  imageSrc: string;
  pose: Pose6 | null;
}

export function CameraCapture({
  kind,
  initialStream,
  initialError,
  onCommit,
  onCancel,
}: {
  kind: RoomKind;
  initialStream: MediaStream | null;
  initialError: string | null;
  onCommit: (frames: CapturedFrame[]) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(initialStream);
  const [error, setError] = useState<string | null>(initialError);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [busy, setBusy] = useState(false);
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [status, setStatus] = useState("Opening camera…");

  useEffect(() => {
    return () => stopStream(streamRef.current);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || error) return;
    let cancelled = false;
    attachCameraStream(video, stream);
    setStatus("Waiting for a live frame…");
    void waitForVideoFrame(video)
      .then(() => {
        if (!cancelled) {
          setReady(true);
          setStatus("Live camera · capture a frame of the room");
        }
      })
      .catch((caught) => {
        if (!cancelled) setError(cameraErrorMessage(caught));
      });
    return () => {
      cancelled = true;
    };
  }, [error]);

  async function startCamera(nextFacing: "environment" | "user") {
    setError(null);
    setReady(false);
    setStatus("Opening camera…");
    stopStream(streamRef.current);
    streamRef.current = null;
    try {
      const stream = await openCameraStream(nextFacing);
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera preview is not ready.");
      attachCameraStream(video, stream);
      await waitForVideoFrame(video);
      setReady(true);
      setStatus("Live camera · capture a frame of the room");
    } catch (caught) {
      setError(cameraErrorMessage(caught));
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !ready) return;
    setBusy(true);
    try {
      const imageSrc = videoFrameToRoomDataUrl(video);
      setFrames((current) => [...current, { imageSrc, pose: null }]);
      setStatus(`Captured ${frames.length + 1} camera frame${frames.length === 0 ? "" : "s"} · not LiDAR`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not grab a frame from the camera.",
      );
    } finally {
      setBusy(false);
    }
  }

  function commit() {
    if (frames.length === 0) return;
    stopStream(streamRef.current);
    streamRef.current = null;
    onCommit(frames);
  }

  return (
    <div className="camera-overlay" role="dialog" aria-modal="true" aria-label="Camera capture">
      <div className="camera-panel">
        <div className="camera-head">
          <div>
            <p className="eyebrow">Mode · Camera frame · not LiDAR</p>
            <h2>Capture a room frame</h2>
          </div>
          <button className="btn ghost small" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <p className="muted">
          This is getUserMedia — a photo or video frame of the {kind} room. It is
          not a LiDAR mesh and we do not invent camera poses from the picture.
          Capture one or more frames, then open the room. The AR version saves on
          this device.
        </p>
        {error ? (
          <div className="camera-blocker">
            <p>{error}</p>
            <div className="camera-actions">
              <button className="btn small" onClick={() => void startCamera(facing)}>
                Try camera again
              </button>
              <button className="btn ghost small" onClick={onCancel}>
                Use upload or a sample instead
              </button>
            </div>
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
              {!ready ? <span className="camera-waiting">{status}</span> : null}
            </div>
            <p className="camera-status">{status}</p>
            {frames.length > 0 ? (
              <div className="camera-thumbs">
                {frames.map((frame, index) => (
                  <img key={frame.imageSrc.slice(-24) + index} src={frame.imageSrc} alt={`Captured frame ${index + 1}`} />
                ))}
              </div>
            ) : null}
            <div className="camera-actions">
              <button className="btn" disabled={!ready || busy} onClick={capture}>
                Capture frame
              </button>
              <button
                className="btn ghost"
                disabled={busy}
                onClick={() => {
                  const next = facing === "environment" ? "user" : "environment";
                  setFacing(next);
                  void startCamera(next);
                }}
              >
                Flip camera
              </button>
              <button className="btn" disabled={frames.length === 0} onClick={commit}>
                Open room with {frames.length || "no"} frame{frames.length === 1 ? "" : "s"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
