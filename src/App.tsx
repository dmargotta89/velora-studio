import { useState } from "react";
import { RoomPicker } from "./components/RoomPicker";
import { Studio } from "./components/Studio";
import { Welcome } from "./components/Welcome";
import { useStudio } from "./lib/useStudio";
import type { StudioPhase } from "./types";

export default function App() {
  const studio = useStudio();
  const [phase, setPhase] = useState<StudioPhase>("welcome");

  if (!studio.hydrated) {
    return <div className="screen" />;
  }

  const hasSaved = Boolean(studio.state.room);

  if (phase === "welcome") {
    return (
      <Welcome
        hasSaved={hasSaved}
        onStart={() => setPhase("room")}
        onResume={() => setPhase("studio")}
      />
    );
  }

  if (phase === "room" || !studio.state.room) {
    return (
      <RoomPicker
        onBack={() => setPhase(hasSaved ? "studio" : "welcome")}
        onPick={(room) => {
          studio.setRoom(room);
          setPhase("studio");
        }}
      />
    );
  }

  return (
    <Studio
      studio={studio}
      onChangeRoom={() => setPhase("room")}
      onHome={() => setPhase("welcome")}
    />
  );
}
