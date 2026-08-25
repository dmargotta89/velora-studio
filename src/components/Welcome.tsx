import { SavedRooms } from "./SavedRooms";
import type { ArRoomSummary } from "../lib/arRoom";

export function Welcome({
  onStart,
  hasSaved,
  onResume,
  savedRooms,
  onResumeSaved,
  onDeleteSaved,
}: {
  onStart: () => void;
  hasSaved: boolean;
  onResume: () => void;
  savedRooms: ArRoomSummary[];
  onResumeSaved: (id: string) => void;
  onDeleteSaved: (id: string) => void;
}) {
  return (
    <section className="hero screen">
      <div className="hero-copy">
        <div>
          <div className="wordmark">
            <strong>Velora</strong>
            <span>Studio</span>
          </div>
          <p className="eyebrow" style={{ marginTop: "2.6rem" }}>
            Capture · Style · Walk through
          </p>
          <h1>See the room. Then live in the look.</h1>
          <p className="lede">
            Capture a room from your camera, save an AR version on this device,
            and walk mocked store furniture. LiDAR mesh mapping runs only on a
            native ARKit / ARCore host — never from a 2D photo.
          </p>
          <p className="honest">
            Three honest modes: <strong>camera frame</strong> (getUserMedia, not
            LiDAR), <strong>LiDAR mesh</strong> (only if a native scan actually
            stored a mesh), or <strong>none</strong> (sample/upload photo).
            On-device AR preview still needs WebXR hit-test. Catalog cards are
            mocked, not live store SDKs.
          </p>
          <div className="hero-actions">
            <button className="btn" onClick={onStart}>
              Open a room
            </button>
            {hasSaved ? (
              <button className="btn ghost" onClick={onResume}>
                Resume last look
              </button>
            ) : null}
          </div>
        </div>
        <div className="loop">
          <article>
            <p className="eyebrow">01</p>
            <h3>Capture</h3>
            <p>
              Device camera frames, or a sample/upload with mapping none. Not a
              LiDAR mesh unless a native mapper is present.
            </p>
          </article>
          <article>
            <p className="eyebrow">02</p>
            <h3>Style</h3>
            <p>Theme, style, palette, and living notes change the store suggestions.</p>
          </article>
          <article>
            <p className="eyebrow">03</p>
            <h3>Save AR room</h3>
            <p>
              Frames, furniture, and real XR poses (when AR actually ran) persist
              locally so you can resume. LiDAR stays gated.
            </p>
          </article>
        </div>
        <SavedRooms rooms={savedRooms} onResume={onResumeSaved} onDelete={onDeleteSaved} />
      </div>
      <div className="hero-visual">
        <img src="/rooms/gallery-living.jpg" alt="A sunlit living room sample" />
        <div className="hero-caption">
          <p className="eyebrow">Now in this slice</p>
          <strong>Working camera · saved AR rooms · gated LiDAR</strong>
          <p>
            Capture from the device camera and resume the saved AR room later.
            If this phone has no LiDAR host, it is camera-only — we do not fake a
            mesh.
          </p>
        </div>
      </div>
    </section>
  );
}
