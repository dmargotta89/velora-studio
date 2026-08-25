import { useRef, useState } from "react";
import { sampleRooms } from "../data/rooms";
import { openCameraStream, stopStream } from "../lib/camera";
import { cameraErrorMessage, fileToRoomDataUrl } from "../lib/image";
import { mappingNoteFor } from "../lib/arRoom";
import { uid } from "../lib/ids";
import { roomKindLabels } from "../lib/labels";
import type { Room, RoomKind } from "../types";
import { CameraCapture, type CapturedFrame } from "./CameraCapture";
import { SavedRooms } from "./SavedRooms";
import type { ArRoomSummary } from "../lib/arRoom";

const kinds: RoomKind[] = ["living", "dining", "bedroom", "study"];

export function RoomPicker({
  onPick,
  onCameraFrames,
  onBack,
  savedRooms,
  onResumeSaved,
  onDeleteSaved,
}: {
  onPick: (room: Room) => void;
  onCameraFrames: (kind: RoomKind, frames: CapturedFrame[]) => void;
  onBack: () => void;
  savedRooms: ArRoomSummary[];
  onResumeSaved: (id: string) => void;
  onDeleteSaved: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<RoomKind>("living");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    try {
      const imageSrc = await fileToRoomDataUrl(file);
      onPick({
        id: uid("room"),
        name: file.name.replace(/\.[^.]+$/, "") || "Your room",
        kind,
        imageSrc,
        source: "upload",
        mappingMode: "none",
        note: mappingNoteFor("none"),
      });
    } catch {
      window.alert("That file could not be opened as a room photo.");
    }
  }

  async function onOpenCamera() {
    setCameraError(null);
    try {
      const stream = await openCameraStream("environment");
      setCameraStream(stream);
      setCameraOpen(true);
    } catch (caught) {
      stopStream(cameraStream);
      setCameraStream(null);
      setCameraError(cameraErrorMessage(caught));
      setCameraOpen(true);
    }
  }

  function closeCamera() {
    stopStream(cameraStream);
    setCameraStream(null);
    setCameraOpen(false);
    setCameraError(null);
  }

  return (
    <section className="room-screen screen">
      <div className="wordmark">
        <strong>Velora</strong>
        <span>Studio</span>
      </div>
      <div className="room-head">
        <div>
          <p className="eyebrow">Step one · Capture</p>
          <h1>Start from a space.</h1>
          <p className="muted" style={{ maxWidth: "36rem", marginTop: "0.6rem" }}>
            Take a photo from this device camera, upload one you already have, or
            borrow a sample interior. Camera mode is a frame — not LiDAR. LiDAR
            mesh only runs if a native mapper is actually present.
          </p>
        </div>
        <button className="btn ghost small" onClick={onBack}>
          Back
        </button>
      </div>
      <p className="muted" style={{ margin: "0 0 1rem", maxWidth: "36rem" }}>
        Opening the camera requests a live preview. If permission is denied or no
        camera exists, you get a concrete error and can still upload or use a
        sample. Saved AR rooms on this device are listed below.
      </p>
      <div className="chip-row" style={{ marginBottom: "1rem" }}>
        {kinds.map((item) => (
          <button
            key={item}
            className={`chip ${kind === item ? "active" : ""}`}
            onClick={() => setKind(item)}
          >
            <strong>{roomKindLabels[item]}</strong>
          </button>
        ))}
      </div>
      <p className="muted" style={{ marginBottom: "0.9rem" }}>
        Room type is used for camera and uploaded photos so the mocked catalog can
        stay relevant. Sample interiors are living rooms.
      </p>
      <div className="room-grid">
        <div className="capture-pair">
          <button className="upload-card" type="button" onClick={() => void onOpenCamera()}>
            <div>
              <p className="eyebrow">Device camera</p>
              <h2>Capture a room</h2>
              <p className="muted">
                Uses getUserMedia on this click so phone browsers can grant
                permission. You grab photo frames — not a LiDAR mesh.
              </p>
            </div>
            <span className="btn" style={{ alignSelf: "flex-start" }}>
              Open camera
            </span>
          </button>
          <label className="upload-card">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(event) => void onUpload(event.target.files?.[0])}
            />
            <div>
              <p className="eyebrow">Fallback · mapping none</p>
              <h2>Upload a room photo</h2>
              <p className="muted">
                A wide shot works best. We keep it on this device. Sample interiors
                below if you would rather not use a camera.
              </p>
            </div>
            <span className="btn" style={{ alignSelf: "flex-start" }}>
              Choose photo
            </span>
          </label>
        </div>
        {sampleRooms.map((room) => (
          <button
            key={room.id}
            className="room-card"
            onClick={() => onPick(room)}
          >
            <img src={room.imageSrc} alt={room.name} />
            <div>
              <p className="eyebrow">{room.kind} · mapping none</p>
              <h2>{room.name}</h2>
              <p className="muted">{room.note}</p>
            </div>
          </button>
        ))}
      </div>
      <SavedRooms rooms={savedRooms} onResume={onResumeSaved} onDelete={onDeleteSaved} />
      {cameraOpen ? (
        <CameraCapture
          kind={kind}
          initialStream={cameraStream}
          initialError={cameraError}
          onCancel={closeCamera}
          onCommit={(frames) => {
            closeCamera();
            onCameraFrames(kind, frames);
          }}
        />
      ) : null}
    </section>
  );
}
