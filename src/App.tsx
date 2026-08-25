import { useState } from "react";
import { RoomPicker } from "./components/RoomPicker";
import { Studio } from "./components/Studio";
import { Welcome } from "./components/Welcome";
import { useStudio } from "./lib/useStudio";
import type { StudioPhase } from "./types";

void import("./components/SpatialStage");
void import("./components/ArControls");

export default function App() {
  const studio = useStudio();
  const [phase, setPhase] = useState<StudioPhase>("welcome");

  if (!studio.hydrated) {
    return <div className="screen" />;
  }

  const hasLastLook = Boolean(studio.state.room);

  async function resumeSaved(id: string) {
    await studio.resumeArRoom(id);
    setPhase("studio");
  }

  if (phase === "welcome") {
    return (
      <Welcome
        hasSaved={hasLastLook}
        onStart={() => setPhase("room")}
        onResume={() => setPhase("studio")}
        savedRooms={studio.savedRooms}
        onResumeSaved={(id) => void resumeSaved(id)}
        onDeleteSaved={(id) => void studio.removeSavedRoom(id)}
      />
    );
  }

  if (phase === "room" || !studio.state.room) {
    return (
      <RoomPicker
        savedRooms={studio.savedRooms}
        onResumeSaved={(id) => void resumeSaved(id)}
        onDeleteSaved={(id) => void studio.removeSavedRoom(id)}
        onBack={() => setPhase(hasLastLook ? "studio" : "welcome")}
        onPick={(room) => {
          studio.setRoom(room);
          setPhase("studio");
        }}
        onCameraFrames={(kind, frames) => {
          void studio.openCameraRoom({ kind, frames }).then(() => setPhase("studio"));
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
