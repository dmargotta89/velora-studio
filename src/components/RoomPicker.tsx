import { useRef, useState } from "react";
import { sampleRooms } from "../data/rooms";
import { fileToRoomDataUrl } from "../lib/image";
import { uid } from "../lib/ids";
import { roomKindLabels } from "../lib/labels";
import type { Room, RoomKind } from "../types";
import { CameraCapture } from "./CameraCapture";

const kinds: RoomKind[] = ["living", "dining", "bedroom", "study"];

export function RoomPicker({
  onPick,
  onBack,
}: {
  onPick: (room: Room) => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<RoomKind>("living");
  const [cameraOpen, setCameraOpen] = useState(false);

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
        note: "Uploaded photo, kept on this device. Not a LiDAR mesh.",
      });
    } catch {
      window.alert("That file could not be opened as a room photo.");
    }
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
            borrow a sample interior. Capture is a camera frame — not LiDAR, not a
            live 3D scan. Taste and mocked store furniture come next.
          </p>
        </div>
        <button className="btn ghost small" onClick={onBack}>
          Back
        </button>
      </div>
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
          <button className="upload-card" type="button" onClick={() => setCameraOpen(true)}>
            <div>
              <p className="eyebrow">Device camera</p>
              <h2>Capture a room</h2>
              <p className="muted">
                Uses the camera on this device (getUserMedia). You grab a photo or
                video frame — not a LiDAR mesh. Permission may be required.
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
              <p className="eyebrow">Fallback</p>
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
              <p className="eyebrow">{room.kind}</p>
              <h2>{room.name}</h2>
              <p className="muted">{room.note}</p>
            </div>
          </button>
        ))}
      </div>
      {cameraOpen ? (
        <CameraCapture
          kind={kind}
          onCancel={() => setCameraOpen(false)}
          onCapture={(room) => {
            setCameraOpen(false);
            onPick(room);
          }}
        />
      ) : null}
    </section>
  );
}
