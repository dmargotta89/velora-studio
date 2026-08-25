import type { Room } from "../types";

export const sampleRooms: Room[] = [
  {
    id: "morning-corner",
    name: "Morning Corner",
    kind: "living",
    imageSrc: "/rooms/morning-corner.jpg",
    source: "sample",
    note: "Sample interior photo — a fallback, not a LiDAR scan.",
  },
  {
    id: "gallery-living",
    name: "Gallery Living",
    kind: "living",
    imageSrc: "/rooms/gallery-living.jpg",
    source: "sample",
    note: "Sun from the garden side. Sample photo for testing a seating look.",
  },
  {
    id: "open-house",
    name: "Open House",
    kind: "living",
    imageSrc: "/rooms/open-house.jpg",
    source: "sample",
    note: "Living into kitchen. Sample photo fallback, not a whole-home scan.",
  },
];
