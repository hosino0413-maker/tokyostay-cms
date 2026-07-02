import Image from "next/image";
import Link from "next/link";
import { coverImage, text } from "@/lib/properties";
import type { Locale, Property } from "@/types/property";

export function PropertyCard({ property, locale }: { property: Property; locale: Locale }) {
  const images = property.images.length ? property.images : [];
  const cover = coverImage(property);
  const collage = [cover, images[1] ?? cover, images[2] ?? cover].filter(Boolean);

  return (
    <Link
      href={`/property/${property.id}?lang=${locale}`}
      className="group block overflow-hidden rounded-[28px] bg-white shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="grid h-72 grid-cols-[1.25fr_0.75fr] gap-1 bg-line">
        <div className="relative overflow-hidden">
          {collage[0] && (
            <Image src={collage[0].url} alt={collage[0].alt} fill className="object-cover transition duration-500 group-hover:scale-105" />
          )}
        </div>
        <div className="grid grid-rows-2 gap-1">
          {collage.slice(1, 3).map((image) => (
            <div key={image.id} className="relative overflow-hidden">
              <Image src={image.url} alt={image.alt} fill className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{property.area}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{text(property.title, locale)}</h2>
          <p className="mt-2 text-sm leading-6 text-night/62">{property.roomType} · {property.capacity} guests · {property.size}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {property.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-night/70 ring-1 ring-line">
              {amenity}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
