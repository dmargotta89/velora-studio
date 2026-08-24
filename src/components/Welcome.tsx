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
            Scan · Style · Walk through
          </p>
          <h1>See the room. Then live in the look.</h1>
          <p className="lede">
            Velora is the design brain for a future AR walkthrough. You scan a
            home, choose a theme and palette, and place furniture that already
            has AR models from Ashley, Amazon, and Kirkland&apos;s.
          </p>
          <p className="honest">
            This web slice is not LiDAR scanning and not a live retailer AR SDK.
            It is the taste-and-suggestion layer: open a room photo, set how you
            want to live, and compose a store look you can later walk in AR.
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
            <h3>Scan</h3>
            <p>A photo today. A 3D room or house scan when the capture layer lands.</p>
          </article>
          <article>
            <p className="eyebrow">02</p>
            <h3>Style</h3>
            <p>Theme, style, palette, and living notes change the store suggestions.</p>
          </article>
          <article>
            <p className="eyebrow">03</p>
            <h3>Walk</h3>
            <p>AR from real retailers is next. Here you swap, restyle, and rearrange.</p>
          </article>
        </div>
      </div>
      <div className="hero-visual">
        <img src="/rooms/gallery-living.jpg" alt="A sunlit living room sample" />
        <div className="hero-caption">
          <p className="eyebrow">Coming next</p>
          <strong>AR walkthrough with store-true models</strong>
          <p>
            Not wired in this build. The pins you place here are the composition
            pass before you walk the room.
          </p>
        </div>
      </div>
    </section>
  );
}
