import { mappingModeCopy } from "../lib/mapping";
import type { ArRoomSummary } from "../lib/arRoom";

export function SavedRooms({
  rooms,
  onResume,
  onDelete,
}: {
  rooms: ArRoomSummary[];
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (rooms.length === 0) return null;

  return (
    <div className="saved-rooms">
      <p className="eyebrow">Saved AR rooms</p>
      <p className="muted" style={{ margin: "0.35rem 0 0.8rem" }}>
        Versioned local format on this device. Resume the mapped room, including
        camera frames and furniture. LiDAR meshes appear only if a native scan
        actually stored one.
      </p>
      <div className="saved-room-list">
        {rooms.map((room) => {
          const mode = mappingModeCopy(room.mappingMode);
          return (
            <article key={room.id} className="saved-room-card">
              {room.coverSrc ? <img src={room.coverSrc} alt="" /> : <div className="saved-room-cover" />}
              <div>
                <p className="eyebrow">{mode.tag}</p>
                <h3>{room.name}</h3>
                <p className="muted">
                  {room.frameCount} frame{room.frameCount === 1 ? "" : "s"}
                  {room.hasMesh ? " · LiDAR mesh stored" : " · no LiDAR mesh"}
                </p>
                <div className="inline" style={{ marginTop: "0.55rem" }}>
                  <button className="btn small" onClick={() => onResume(room.id)}>
                    Resume
                  </button>
                  <button className="btn ghost small" onClick={() => onDelete(room.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
