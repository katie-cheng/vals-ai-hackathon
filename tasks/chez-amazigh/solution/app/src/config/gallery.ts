// The family's own photographs (from the property's Airbnb listing). Add or replace files in public/photos and list them here.

export type PhotoGroup = "house" | "rooms" | "table" | "garden";

export type PhotoEntry = { src: string; width: number; height: number; group: PhotoGroup; caption: string };

export const photos = {
  exteriorGarden: { src: "/photos/exterior-garden.jpg", width: 1440, height: 1080, group: "house", caption: "exteriorGarden" },
  facade: { src: "/photos/facade.jpg", width: 1440, height: 810, group: "house", caption: "facade" },
  houseGarden: { src: "/photos/house-garden.jpg", width: 1200, height: 1600, group: "garden", caption: "houseGarden" },
  night: { src: "/photos/night.jpg", width: 1200, height: 1600, group: "house", caption: "night" },
  terrace: { src: "/photos/terrace.jpg", width: 1440, height: 1080, group: "garden", caption: "terrace" },
  gardenView: { src: "/photos/garden-view.jpg", width: 1440, height: 1080, group: "garden", caption: "gardenView" },
  gardenPath: { src: "/photos/garden-path.jpg", width: 738, height: 1600, group: "garden", caption: "gardenPath" },
  parking: { src: "/photos/parking.jpg", width: 1200, height: 1600, group: "house", caption: "parking" },
  salonFireplace: { src: "/photos/salon-fireplace.jpg", width: 1440, height: 1081, group: "rooms", caption: "salonFireplace" },
  salonRed: { src: "/photos/salon-red.jpg", width: 1440, height: 1080, group: "rooms", caption: "salonRed" },
  salonYellow: { src: "/photos/salon-yellow.jpg", width: 1440, height: 1080, group: "rooms", caption: "salonYellow" },
  salonSeating: { src: "/photos/salon-seating.jpg", width: 1440, height: 1080, group: "rooms", caption: "salonSeating" },
  salonTv: { src: "/photos/salon-tv.jpg", width: 1440, height: 1080, group: "rooms", caption: "salonTv" },
  billiards: { src: "/photos/billiards.jpg", width: 1440, height: 1080, group: "rooms", caption: "billiards" },
  bedroom1: { src: "/photos/bedroom-1.jpg", width: 1200, height: 1600, group: "rooms", caption: "bedroom1" },
  bedroom2: { src: "/photos/bedroom-2.jpg", width: 1440, height: 1080, group: "rooms", caption: "bedroom2" },
  bedroom3: { src: "/photos/bedroom-3.jpg", width: 1440, height: 664, group: "rooms", caption: "bedroom3" },
  bathroom: { src: "/photos/bathroom.jpg", width: 1440, height: 1081, group: "rooms", caption: "bathroom" },
  hammam: { src: "/photos/hammam.jpg", width: 1440, height: 1081, group: "rooms", caption: "hammam" },
  kitchen: { src: "/photos/kitchen.jpg", width: 1440, height: 664, group: "rooms", caption: "kitchen" },
  breakfast: { src: "/photos/breakfast-fruit.jpg", width: 1440, height: 1080, group: "table", caption: "breakfast" },
  tagine: { src: "/photos/tagine-table.jpg", width: 1440, height: 1080, group: "table", caption: "tagine" },
} satisfies Record<string, PhotoEntry>;

export type PhotoKey = keyof typeof photos;

export const galleryOrder: PhotoKey[] = [
  "exteriorGarden", "salonFireplace", "breakfast", "terrace", "bedroom2", "hammam", "facade", "salonYellow",
  "tagine", "gardenView", "bedroom1", "billiards", "salonRed", "houseGarden", "bedroom3", "bathroom",
  "kitchen", "salonSeating", "gardenPath", "night", "salonTv", "parking",
];
