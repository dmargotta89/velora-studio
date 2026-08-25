export function Welcome({
  onStart,
  hasSaved,
  onResume,
}: {
  onStart: () => void;
  hasSaved: boolean;
  onResume: () => void;
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
            Velora is heading toward 3D-scan → style → live retailer AR. This
            slice is the honest next step: capture a room from your camera, choose
            a theme and palette, and place mocked furniture from Ashley, Amazon,
            and Kirkland&apos;s. On-device AR runs only where WebXR can hit-test a
            floor.
          </p>
          <p className="honest">
            Camera capture is a photo or video frame — not LiDAR. On-device AR
            preview runs only on a compatible device with WebXR immersive-ar and
            floor hit-test; otherwise you get the PREVIEW stage, and we do not
            pretend AR is running. Catalog cards are mocked, not live store SDKs.
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
              Device camera, photo upload, or a sample interior. A frame of the
              room — not a LiDAR mesh.
            </p>
          </article>
          <article>
            <p className="eyebrow">02</p>
            <h3>Style</h3>
            <p>Theme, style, palette, and living notes change the store suggestions.</p>
          </article>
          <article>
            <p className="eyebrow">03</p>
            <h3>Walk</h3>
            <p>
              On-device AR preview where WebXR floor hit-test is available.
              PREVIEW walkthrough otherwise. Catalog stays mocked.
            </p>
          </article>
        </div>
      </div>
      <div className="hero-visual">
        <img src="/rooms/gallery-living.jpg" alt="A sunlit living room sample" />
        <div className="hero-caption">
          <p className="eyebrow">Now in this slice</p>
          <strong>Camera capture · AR where supported</strong>
          <p>
            Capture from the device camera. Place mocked catalog GLB pieces on a
            detected floor in WebXR. If AR is not available, PREVIEW is the path
            — we never fake a live AR session or store SDK.
          </p>
        </div>
      </div>
    </section>
  );
}
