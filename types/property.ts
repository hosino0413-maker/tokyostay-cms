export type Locale = "zh" | "en" | "ja";

export type LocalizedText = Record<Locale, string>;

export type PropertyStatus = "draft" | "published" | "hidden";

export type MediaImage = {
  id: string;
  url: string;
  type?: "cover" | "gallery";
  alt: string;
};

export type MediaVideo = {
  id: string;
  url: string;
  title: string;
};

export type MapConfig = {
  type: "google" | "amap" | "image";
  embedUrl: string;
  address: string;
};

export type DateRange = {
  start: string;
  end: string;
};

export type Property = {
  id: string;
  status: PropertyStatus;
  order: number;
  title: LocalizedText;
  area: string;
  priceNote: string;
  roomType: string;
  capacity: string;
  size: string;
  traffic: string;
  description: LocalizedText;
  sellingPoints: LocalizedText[];
  amenities: string[];
  images: MediaImage[];
  videos: MediaVideo[];
  map: MapConfig;
  unavailableDates: DateRange[];
  createdAt: string;
  updatedAt: string;
};

export type RoomType = {
  id: string;
  name: LocalizedText;
  roomType: string;
  capacity: string;
  size: string;
  rooms: string[];
  description: LocalizedText;
  tags: string[];
  amenities: string[];
  images: MediaImage[];
  videos: MediaVideo[];
  map: MapConfig;
  unavailableDates: DateRange[];
  status: PropertyStatus;
};

export type Building = {
  id: string;
  name: LocalizedText;
  area: string;
  station: string;
  walkMinutes: number;
  description: LocalizedText;
  coverImage: string;
  gallery: MediaImage[];
  featured: boolean;
  order: number;
  tags: string[];
  roomTypes: RoomType[];
};

export type AiDraft = {
  description: LocalizedText;
  sellingPoints: LocalizedText[];
  amenities: string[];
  clientCopy: LocalizedText;
};
