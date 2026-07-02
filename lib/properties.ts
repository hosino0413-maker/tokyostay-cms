import properties from "@/data/properties.json";
import type { DateRange, Locale, Property } from "@/types/property";

export const locales: { key: Locale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
  { key: "ja", label: "日本語" }
];

export function getProperties(): Property[] {
  return (properties as Property[]).slice().sort((a, b) => a.order - b.order);
}

export function getPublishedProperties(): Property[] {
  return getProperties().filter((property) => property.status === "published");
}

export function getProperty(id: string): Property | undefined {
  return getProperties().find((property) => property.id === id);
}

export function coverImage(property: Property) {
  return property.images.find((image) => image.type === "cover") ?? property.images[0];
}

export function text(value: Record<Locale, string>, locale: Locale) {
  return value[locale] || value.en || value.zh || value.ja || "";
}

export function dateRangeContains(range: DateRange, isoDate: string) {
  return isoDate >= range.start && isoDate <= range.end;
}

export function isUnavailable(ranges: DateRange[], isoDate: string) {
  return ranges.some((range) => dateRangeContains(range, isoDate));
}

export function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function createBlankProperty(): Property {
  const now = new Date().toISOString();
  return {
    id: `property-${Date.now()}`,
    status: "draft",
    order: 999,
    title: { zh: "新房源", en: "New Property", ja: "新規物件" },
    area: "Tokyo",
    priceNote: "请咨询可入住日期",
    roomType: "1LDK",
    capacity: "1-2",
    size: "30 sqm",
    traffic: "请补充车站与步行时间",
    description: { zh: "", en: "", ja: "" },
    sellingPoints: [],
    amenities: ["Wi-Fi", "Kitchen"],
    images: [],
    videos: [],
    map: { type: "google", embedUrl: "", address: "" },
    unavailableDates: [],
    createdAt: now,
    updatedAt: now
  };
}
