import { features, palettes, styles, themes } from "../data/taste";
import type { StudioModel } from "../lib/useStudio";

export function TasteRail({ studio }: { studio: StudioModel }) {
  const { taste } = studio.state;

  return (
    <aside className="rail">
      <p className="eyebrow">Step two · Taste</p>
      <h2>How should it feel?</h2>
      <p className="muted">
        These pickers change the retailer suggestions on the photo. Nothing here
        is decorative-only.
      </p>

      <div className="section">
        <h3>Theme</h3>
        <div className="choice-list">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`choice ${taste.theme === theme.id ? "active" : ""}`}
              onClick={() => studio.setTaste({ theme: theme.id })}
            >
              <strong>{theme.name}</strong>
              <span>{theme.line}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Style</h3>
        <div className="chip-row">
          {styles.map((style) => (
            <button
              key={style.id}
              className={`chip ${taste.style === style.id ? "active" : ""}`}
              onClick={() => studio.setTaste({ style: style.id })}
            >
              <strong>{style.name}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Color palette</h3>
        <div className="choice-list">
          {palettes.map((palette) => (
            <button
              key={palette.id}
              className={`swatch-btn ${taste.palette === palette.id ? "active" : ""}`}
              onClick={() => studio.setTaste({ palette: palette.id })}
            >
              <span className="dots" aria-hidden="true">
                {palette.swatches.map((color) => (
                  <i key={color} style={{ background: color }} />
                ))}
              </span>
              <span>
                <strong>{palette.name}</strong>
                <span>{palette.line}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>How you live</h3>
        <div className="chip-row">
          {features.map((feature) => (
            <button
              key={feature.id}
              className={`chip ${taste.features.includes(feature.id) ? "active" : ""}`}
              onClick={() => studio.toggleFeature(feature.id)}
            >
              <strong>{feature.name}</strong>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
