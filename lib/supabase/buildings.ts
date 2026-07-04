import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Building, DateRange, LocalizedText, MediaImage, MediaVideo, RoomType } from "@/types/property";

type BuildingRow = {
  id: string;
  slug: string | null;
  name: LocalizedText;
  area: string | null;
  station: string | null;
  walk_minutes: number | null;
  description: LocalizedText & { _tags?: string[] };
  cover_image: string | null;
  gallery: MediaImage[];
  featured: boolean | null;
  sort_order: number | null;
  status: string | null;
};

type RoomTypeRow = {
  id: string;
  building_id: string;
  slug: string | null;
  name: LocalizedText;
  room_type: string | null;
  capacity: string | number | null;
  size: string | null;
  rooms: string[] | string | null;
  description: LocalizedText & { _capacity?: string };
  tags: string[];
  amenities: string[];
  images: MediaImage[];
  videos: MediaVideo[];
  map: RoomType["map"];
  status: RoomType["status"] | null;
};

type AvailabilityRow = {
  room_type_id: string;
  start_date: string;
  end_date: string;
};

function localized(value: unknown): LocalizedText {
  const data = (value && typeof value === "object" ? value : {}) as Partial<LocalizedText>;
  return {
    zh: data.zh ?? "",
    en: data.en ?? "",
    ja: data.ja ?? ""
  };
}

function arrayValue<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function roomsValue(value: RoomTypeRow["rooms"]): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function buildingToRow(building: Building) {
  return {
    id: building.id,
    slug: building.id,
    name: building.name,
    area: building.area,
    station: building.station,
    walk_minutes: building.walkMinutes,
    description: { ...building.description, _tags: building.tags ?? [] },
    cover_image: building.coverImage,
    gallery: building.gallery ?? [],
    featured: building.featured,
    sort_order: building.order,
    status: building.featured ? "published" : "draft"
  };
}

function roomToRow(buildingId: string, room: RoomType) {
  const capacityNumbers = room.capacity.match(/\d+/g)?.map(Number) ?? [];
  const capacityNumber = capacityNumbers.length ? Math.max(...capacityNumbers) : null;

  return {
    id: room.id,
    building_id: buildingId,
    slug: room.id,
    name: room.name,
    room_type: room.roomType,
    capacity: capacityNumber,
    size: room.size,
    rooms: room.rooms.join(","),
    description: { ...room.description, _capacity: room.capacity },
    tags: room.tags ?? [],
    amenities: room.amenities ?? [],
    images: room.images ?? [],
    videos: room.videos ?? [],
    map: room.map ?? {},
    status: room.status
  };
}

function rowToBuilding(row: BuildingRow, rooms: RoomType[]): Building {
  const description = localized(row.description);

  return {
    id: row.id,
    name: localized(row.name),
    area: row.area ?? "",
    station: row.station ?? "",
    walkMinutes: row.walk_minutes ?? 0,
    description,
    coverImage: row.cover_image ?? "",
    gallery: arrayValue<MediaImage>(row.gallery),
    featured: Boolean(row.featured),
    order: row.sort_order ?? 0,
    tags: arrayValue<string>(row.description?._tags),
    roomTypes: rooms
  };
}

function rowToRoom(row: RoomTypeRow, availability: DateRange[]): RoomType {
  return {
    id: row.id,
    name: localized(row.name),
    roomType: row.room_type ?? "",
    capacity: row.description?._capacity ?? String(row.capacity ?? ""),
    size: row.size ?? "",
    rooms: roomsValue(row.rooms),
    description: localized(row.description),
    tags: arrayValue<string>(row.tags),
    amenities: arrayValue<string>(row.amenities),
    images: arrayValue<MediaImage>(row.images),
    videos: arrayValue<MediaVideo>(row.videos),
    map: row.map ?? { type: "google", embedUrl: "", address: "" },
    unavailableDates: availability,
    status: row.status ?? "draft"
  };
}

export async function getSupabaseBuildings(): Promise<Building[]> {
  const supabase = createServerSupabaseClient();
  const { data: buildingRows, error: buildingError } = await supabase
    .from("buildings")
    .select("*")
    .order("sort_order", { ascending: true });

  if (buildingError) throw new Error(buildingError.message);
  if (!buildingRows?.length) return [];

  const { data: roomRows, error: roomError } = await supabase
    .from("room_types")
    .select("*")
    .order("created_at", { ascending: true });

  if (roomError) throw new Error(roomError.message);

  const { data: availabilityRows, error: availabilityError } = await supabase
    .from("availability_blocks")
    .select("room_type_id,start_date,end_date")
    .order("start_date", { ascending: true });

  if (availabilityError) throw new Error(availabilityError.message);

  const availabilityByRoom = new Map<string, DateRange[]>();
  for (const row of (availabilityRows ?? []) as AvailabilityRow[]) {
    const dates = availabilityByRoom.get(row.room_type_id) ?? [];
    dates.push({ start: row.start_date, end: row.end_date });
    availabilityByRoom.set(row.room_type_id, dates);
  }

  const roomsByBuilding = new Map<string, RoomType[]>();
  for (const row of (roomRows ?? []) as RoomTypeRow[]) {
    const rooms = roomsByBuilding.get(row.building_id) ?? [];
    rooms.push(rowToRoom(row, availabilityByRoom.get(row.id) ?? []));
    roomsByBuilding.set(row.building_id, rooms);
  }

  return ((buildingRows ?? []) as BuildingRow[]).map((row) => rowToBuilding(row, roomsByBuilding.get(row.id) ?? []));
}

export async function saveSupabaseBuildings(buildings: Building[]) {
  const supabase = createServerSupabaseClient();
  const buildingIds = buildings.map((building) => building.id);
  const roomIds = buildings.flatMap((building) => building.roomTypes.map((room) => room.id));

  if (buildingIds.length > 0) {
    const { error } = await supabase.from("buildings").upsert(buildings.map(buildingToRow), { onConflict: "id" });
    if (error) throw new Error(error.message);
  }

  if (roomIds.length > 0) {
    const roomRows = buildings.flatMap((building) => building.roomTypes.map((room) => roomToRow(building.id, room)));
    const { error } = await supabase.from("room_types").upsert(roomRows, { onConflict: "id" });
    if (error) throw new Error(error.message);
  }

  const { error: deleteAvailabilityError } = await supabase
    .from("availability_blocks")
    .delete()
    .in("room_type_id", roomIds.length ? roomIds : ["__none__"]);
  if (deleteAvailabilityError) throw new Error(deleteAvailabilityError.message);

  const availabilityRows = buildings.flatMap((building) =>
    building.roomTypes.flatMap((room) =>
      room.unavailableDates
        .filter((range) => range.start && range.end)
        .map((range) => ({
          room_type_id: room.id,
          start_date: range.start,
          end_date: range.end
        }))
    )
  );

  if (availabilityRows.length > 0) {
    const { error } = await supabase.from("availability_blocks").insert(availabilityRows);
    if (error) throw new Error(error.message);
  }

  if (buildingIds.length > 0) {
    const { data: existingBuildings, error: existingBuildingsError } = await supabase.from("buildings").select("id");
    if (existingBuildingsError) throw new Error(existingBuildingsError.message);
    const staleBuildingIds = (existingBuildings ?? []).map((item) => item.id).filter((id) => !buildingIds.includes(id));
    if (staleBuildingIds.length > 0) {
      const { error } = await supabase.from("buildings").delete().in("id", staleBuildingIds);
      if (error) throw new Error(error.message);
    }
  }

  if (roomIds.length > 0) {
    const { data: existingRooms, error: existingRoomsError } = await supabase.from("room_types").select("id");
    if (existingRoomsError) throw new Error(existingRoomsError.message);
    const staleRoomIds = (existingRooms ?? []).map((item) => item.id).filter((id) => !roomIds.includes(id));
    if (staleRoomIds.length > 0) {
      const { error } = await supabase.from("room_types").delete().in("id", staleRoomIds);
      if (error) throw new Error(error.message);
    }
  }
}
