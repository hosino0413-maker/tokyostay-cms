import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BedDouble, MapPin, Ruler, TrainFront, Users } from "lucide-react";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PropertyInquiryButton } from "@/components/PropertyInquiryButton";
import { PropertySectionNav } from "@/components/PropertySectionNav";
import { MapPanel, VideoPanel } from "@/components/VideoAndMap";
import { getBuildings, getRoomType, stationText } from "@/lib/buildings";
import { text } from "@/lib/properties";
import { tagLabel } from "@/lib/tags";
import type { Locale } from "@/types/property";

const copy = {
  en: { back: "Back to room types", about: "Room type overview", unavailable: "Unavailable dates", amenities: "Amenities" },
  zh: { back: "返回房型列表", about: "房型介绍", unavailable: "不可入住日期", amenities: "设施" },
  ja: { back: "タイプ一覧へ戻る", about: "タイプ紹介", unavailable: "利用不可日", amenities: "設備" }
} as const;

function parseLocale(value?: string): Locale {
  return value === "zh" || value === "ja" ? value : "en";
}

export function generateStaticParams() {
  return getBuildings().flatMap((building) =>
    building.roomTypes.map((roomType) => ({
      buildingId: building.id,
      roomTypeId: roomType.id
    }))
  );
}

export default function RoomTypeDetail({ params, searchParams }: { params: { buildingId: string; roomTypeId: string }; searchParams: { lang?: string } }) {
  const result = getRoomType(params.buildingId, params.roomTypeId);
  if (!result || result.roomType.status !== "published") notFound();

  const { building, roomType } = result;
  const locale = parseLocale(searchParams.lang);
  const t = copy[locale];
  const roomName = text(roomType.name, locale);
  const detailItems = [
    { icon: MapPin, label: building.area },
    { icon: BedDouble, label: roomType.roomType },
    { icon: Users, label: roomType.capacity },
    { icon: Ruler, label: roomType.size },
    { icon: TrainFront, label: stationText(building, locale) }
  ];

  return (
    <main>
      <header className="glass-nav sticky top-0 z-30 border-b border-line/70">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-4">
          <Link href={`/building/${building.id}?lang=${locale}`} className="inline-flex items-center gap-2 text-sm font-semibold text-night/65 hover:text-ink">
            <ArrowLeft size={18} /> {t.back}
          </Link>
          <LanguageSwitcher locale={locale} pathname={`/building/${building.id}/room/${roomType.id}`} />
        </div>
      </header>

      <PropertySectionNav locale={locale} variant="mobile" />

      <section className="mx-auto grid max-w-[1180px] gap-8 px-5 py-8 md:py-12 lg:grid-cols-[180px_minmax(0,1fr)]">
        <PropertySectionNav locale={locale} variant="desktop" />

        <div className="min-w-0">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">{text(building.name, locale)}</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{roomName}</h1>
              <p className="mt-4 text-lg text-night/55">{building.area}</p>
            </div>
            <div className="w-full shrink-0 md:w-40">
              <PropertyInquiryButton propertyId={`${building.id}/${roomType.id}`} propertyName={`${text(building.name, locale)} · ${roomName}`} locale={locale} />
            </div>
          </div>

          <div className="space-y-8">
            <PropertyGallery images={roomType.images} />

            <section id="overview" className="scroll-mt-32">
              <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
                <article className="min-w-0 rounded-[28px] border border-black/[0.06] bg-white/88 p-5 shadow-card md:px-8 md:py-7">
                  <div className="flex flex-wrap gap-3">
                    {detailItems.map((item) => (
                      <div key={item.label} className="flex min-h-[92px] min-w-[128px] flex-1 basis-[140px] flex-col justify-between rounded-[20px] bg-mist/70 px-4 py-4 ring-1 ring-line">
                        <item.icon className="text-brand" size={19} />
                        <p className="mt-3 text-sm font-semibold leading-5 text-night/78">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <h2 className="mt-8 text-2xl font-semibold">{t.about}</h2>
                  <p className="mt-4 text-base leading-8 text-night/65">{text(roomType.description, locale)}</p>
                </article>

                <aside className="min-w-0 lg:max-w-[400px]">
                  <AvailabilityCalendar ranges={roomType.unavailableDates} title={t.unavailable} />
                </aside>
              </div>
            </section>

            <section id="amenities" className="scroll-mt-32 rounded-[28px] border border-black/[0.06] bg-white/86 p-5 shadow-card md:p-8">
              <h2 className="text-2xl font-semibold">{t.amenities}</h2>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {roomType.amenities.map((amenity) => (
                  <span key={amenity} className="max-w-full rounded-full bg-mist px-4 py-2 text-sm font-semibold text-night/65 ring-1 ring-line">
                    {tagLabel(amenity, locale)}
                  </span>
                ))}
              </div>
            </section>

            <div id="video" className="scroll-mt-32">
              <VideoPanel videos={roomType.videos} />
            </div>

            <div id="map" className="scroll-mt-32">
              <MapPanel map={roomType.map} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
