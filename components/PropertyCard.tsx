import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, TrainFront, Users } from "lucide-react";
import { coverImage, text } from "@/lib/properties";
import { tagLabel } from "@/lib/tags";
import type { Locale, Property } from "@/types/property";

const labels = {
  en: { view: "View Details", guests: "guests", available: "Available" },
  zh: { view: "查看详情", guests: "人", available: "可查看" },
  ja: { view: "詳細を見る", guests: "名", available: "公開中" }
} as const;

export function PropertyCard({ property, locale }: { property: Property; locale: Locale }) {
  const images = property.images.length ? property.images : [];
  const cover = coverImage(property);
  const collage = [cover, images[1] ?? cover, images[2] ?? cover].filter(Boolean);
  const t = labels[locale];

  return (
    <Link
      href={`/property/${property.id}?lang=${locale}`}
      className="group block overflow-hidden rounded-[28px] bg-white shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative h-[280px] bg-line md:grid md:h-72 md:grid-cols-[1.25fr_0.75fr] md:gap-1">
        <div className="relative h-full overflow-hidden">
          {collage[0] && (
            <Image src={collage[0].url} alt={collage[0].alt} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover transition duration-500 group-hover:scale-105" />
          )}
          <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-ink shadow-card">
            {property.status === "published" ? t.available : property.status}
          </div>
        </div>
        <div className="hidden grid-rows-2 gap-1 md:grid">
          {collage.slice(1, 3).map((image) => (
            <div key={image.id} className="relative overflow-hidden">
              <Image src={image.url} alt={image.alt} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-5 p-6">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            <MapPin size={14} /> {property.area}
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{text(property.title, locale)}</h2>
          <div className="mt-3 grid gap-2 text-sm text-night/62">
            <p className="flex items-center gap-2"><Users size={15} /> {property.roomType} · {property.capacity} {t.guests} · {property.size}</p>
            <p className="flex items-center gap-2"><TrainFront size={15} /> {property.traffic}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {property.amenities.slice(0, 5).map((amenity) => (
            <span key={amenity} className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-night/70 ring-1 ring-line">
              {tagLabel(amenity, locale)}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold text-night/55">{property.priceNote}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
            {t.view} <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
