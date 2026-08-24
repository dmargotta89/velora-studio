import { useRef } from "react";
import { sampleRooms } from "../data/rooms";
import { fileToRoomDataUrl } from "../lib/image";
import { uid } from "../lib/ids";
import type { Room } from "../types";

export function RoomPicker({
  onPick,
  onBack,
}: {
  onPick: (room: Room) => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    try {
      const imageSrc = await fileToRoomDataUrl(file);
      onPick({
        id: uid("room"),
        name: file.name.replace(/\.[^.]+$/, "") || "Your room",
        kind: "living",
        imageSrc,
        source: "upload",
        note: "Your photo stands in for a future 3D scan of this room.",
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
          <p className="eyebrow">Step one · Room</p>
          <h1>Start from a space.</h1>
          <p className="muted" style={{ maxWidth: "36rem", marginTop: "0.6rem" }}>
            Upload a photo of a room, or borrow one of the sample interiors.
            Capture is the stand-in for scanning. Taste and AR-ready furniture
            come next.
          </p>
        </div>
        <button className="btn ghost small" onClick={onBack}>
          Back
        </button>
      </div>
      <div className="room-grid">
        <label className="upload-card">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(event) => void onUpload(event.target.files?.[0])}
          />
          <div>
            <p className="eyebrow">Your scan stand-in</p>
            <h2>Upload a room photo</h2>
            <p className="muted">
              A wide shot works best — living room, dining, bedroom, or a corner
              you want to restyle. We keep it on this device.
            </p>
          </div>
          <span className="btn" style={{ alignSelf: "flex-start" }}>
            Choose photo
          </span>
        </label>
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
    </section>
  );
}
