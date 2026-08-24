import type { Room } from "../types";

export const sampleRooms: Room[] = [
  {
    id: "morning-corner",
    name: "Morning Corner",
    kind: "living",
    imageSrc: "/rooms/morning-corner.jpg",
    source: "sample",
    note: "A quiet sitting wall — stand-in for a future living-room scan.",
  },
  {
    id: "gallery-living",
    name: "Gallery Living",
    kind: "living",
    imageSrc: "/rooms/gallery-living.jpg",
    source: "sample",
    note: "Sun from the garden side. Good for testing a full seating look.",
  },
  {
    id: "open-house",
    name: "Open House",
    kind: "living",
    imageSrc: "/rooms/open-house.jpg",
    source: "sample",
    note: "Living into kitchen. The photo stands in for a whole-home scan.",
  },
];
