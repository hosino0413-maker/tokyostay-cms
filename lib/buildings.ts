import buildingsData from "@/data/buildings.json";
import { coverImage, getProperties } from "@/lib/properties";
import type { Building, Locale, Property, RoomType } from "@/types/property";

type BuildingFile = {
  buildings: Building[];
};

function propertyToRoomType(property: Property): RoomType {
  return {
    id: property.roomType.toLowerCase().replace(/[^a-z0-9]+/g, "-") || property.id,
    name: property.title,
    roomType: property.roomType,
    capacity: property.capacity,
    size: property.size,
    rooms: [],
    description: property.description,
    tags: property.amenities.slice(0, 4),
    amenities: property.amenities,
    images: property.images,
    videos: property.videos,
    map: property.map,
    unavailableDates: property.unavailableDates,
    status: property.status
  };
}

function propertyToBuilding(property: Property): Building {
  const cover = coverImage(property);
  return {
    id: property.id,
    name: property.title,
    area: property.area,
    station: property.traffic,
    walkMinutes: 0,
    description: property.description,
    coverImage: cover?.url ?? "",
    gallery: property.images,
    featured: property.status === "published",
    order: property.order,
    tags: property.amenities.slice(0, 3),
    roomTypes: [propertyToRoomType(property)]
  };
}

export function getBuildings(): Building[] {
  const fileBuildings = (buildingsData as BuildingFile).buildings ?? [];
  const buildings = fileBuildings.length ? fileBuildings : getProperties().map(propertyToBuilding);
  return buildings.slice().sort((a, b) => a.order - b.order);
}

export function getFeaturedBuildings(): Building[] {
  return getBuildings().filter((building) => building.featured).slice(0, 6);
}

export function getBuilding(id: string): Building | undefined {
  return getBuildings().find((building) => building.id === id);
}

export function getRoomType(buildingId: string, roomTypeId: string): { building: Building; roomType: RoomType } | undefined {
  const building = getBuilding(buildingId);
  const roomType = building?.roomTypes.find((item) => item.id === roomTypeId);
  return building && roomType ? { building, roomType } : undefined;
}

export function buildingCover(building: Building) {
  return building.gallery.find((image) => image.type === "cover") ?? building.gallery[0] ?? {
    id: `${building.id}-cover`,
    url: building.coverImage,
    alt: building.name.en,
    type: "cover" as const
  };
}

export function roomTypeCover(roomType: RoomType) {
  return roomType.images.find((image) => image.type === "cover") ?? roomType.images[0];
}

export function roomTypeSummary(building: Building) {
  return building.roomTypes.map((roomType) => roomType.roomType).join(" / ");
}

export function stationText(building: Building, locale: Locale) {
  const suffix = building.walkMinutes ? `${building.walkMinutes} min walk` : "";
  if (locale === "zh") return `${building.station}${building.walkMinutes ? ` · 步行 ${building.walkMinutes} 分钟` : ""}`;
  if (locale === "ja") return `${building.station}${building.walkMinutes ? ` · 徒歩 ${building.walkMinutes}分` : ""}`;
  return [building.station, suffix].filter(Boolean).join(" · ");
}
