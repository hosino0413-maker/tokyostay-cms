import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BedDouble, MapPin, Ruler, TrainFront, Users } from "lucide-react";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PropertyGallery } from "@/components/PropertyGallery";
import { MapPanel, VideoPanel } from "@/components/VideoAndMap";
import { getProperty, text } from "@/lib/properties";
import type { Locale } from "@/types/property";

function parseLocale(value?: string): Locale {
  return value === "zh" || value === "ja" ? value : "en";
}

export function generateStaticParams() {
  return [];
}

export default function PropertyDetail({ params, searchParams }: { params: { id: string }; searchParams: { lang?: string } }) {
  const property = getProperty(params.id);
  if (!property || property.status !== "published") notFound();

  const locale = parseLocale(searchParams.lang);
  const detailItems = [
    { icon: MapPin, label: property.area },
    { icon: BedDouble, label: property.roomType },
    { icon: Users, label: `${property.capacity} guests` },
    { icon: Ruler, label: property.size },
    { icon: TrainFront, label: property.traffic }
  ];

  return (
    <main>
      <header className="glass-nav sticky top-0 z-30 border-b border-line/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href={`/?lang=${locale}`} className="inline-flex items-center gap-2 text-sm font-semibold text-night/65 hover:text-ink">
            <ArrowLeft size={18} /> Collection
          </Link>
          <LanguageSwitcher locale={locale} pathname={`/property/${property.id}`} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 md:py-12">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand">{property.area}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">{text(property.title, locale)}</h1>
          <p className="mt-4 text-lg text-night/55">{property.priceNote}</p>
        </div>

        <PropertyGallery images={property.images} />

        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_380px]">
          <div className="space-y-7">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {detailItems.map((item) => (
                <div key={item.label} className="rounded-[22px] bg-white p-4 shadow-card ring-1 ring-line">
                  <item.icon className="mb-4 text-brand" size={20} />
                  <p className="text-sm font-semibold leading-6 text-night/72">{item.label}</p>
                </div>
              ))}
            </div>

            <section className="rounded-[28px] bg-white p-7 shadow-card ring-1 ring-line">
              <h2 className="text-2xl font-semibold">About this stay</h2>
              <p className="mt-4 text-base leading-8 text-night/65">{text(property.description, locale)}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-night/65 ring-1 ring-line">
                    {amenity}
                  </span>
                ))}
              </div>
            </section>

            <VideoPanel videos={property.videos} />
            <MapPanel map={property.map} />
          </div>

          <aside className="space-y-7">
            <AvailabilityCalendar ranges={property.unavailableDates} />
            <div className="rounded-[24px] bg-night p-6 text-white shadow-card">
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">Private inquiry</p>
              <p className="mt-3 text-xl font-semibold">Contact details are intentionally hidden on public listing pages.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
