import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, MapPin, TrainFront } from "lucide-react";
import { BuildingGallery } from "@/components/BuildingGallery";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RoomTypeCard } from "@/components/RoomTypeCard";
import { getBuilding, stationText } from "@/lib/buildings";
import { text } from "@/lib/properties";
import type { Locale } from "@/types/property";

const copy = {
  en: { back: "Back to residences", roomTypes: "Room Types", intro: "Residence Overview" },
  zh: { back: "返回楼盘列表", roomTypes: "房型", intro: "楼盘介绍" },
  ja: { back: "レジデンス一覧へ戻る", roomTypes: "タイプ", intro: "レジデンス紹介" }
} as const;

function parseLocale(value?: string): Locale {
  return value === "zh" || value === "ja" ? value : "en";
}

export function generateStaticParams() {
  return [];
}

export default function BuildingDetail({ params, searchParams }: { params: { buildingId: string }; searchParams: { lang?: string } }) {
  const building = getBuilding(params.buildingId);
  if (!building) notFound();

  const locale = parseLocale(searchParams.lang);
  const t = copy[locale];
  const gallery = building.gallery.length
    ? building.gallery
    : building.coverImage
      ? [{ id: `${building.id}-cover`, url: building.coverImage, type: "cover" as const, alt: text(building.name, locale) }]
      : [];

  return (
    <main>
      <header className="glass-nav sticky top-0 z-30 border-b border-line/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href={`/?lang=${locale}`} className="inline-flex items-center gap-2 text-sm font-semibold text-night/65 hover:text-ink">
            <ArrowLeft size={18} /> {t.back}
          </Link>
          <LanguageSwitcher locale={locale} pathname={`/building/${building.id}`} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-brand">
              <Building2 size={16} /> Residence
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{text(building.name, locale)}</h1>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-night/60">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-line">
                <MapPin size={15} /> {building.area}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-line">
                <TrainFront size={15} /> {stationText(building, locale)}
              </span>
            </div>
          </div>
          <p className="rounded-[28px] bg-white/86 p-6 leading-8 text-night/62 shadow-card ring-1 ring-line">{text(building.description, locale)}</p>
        </div>

        <BuildingGallery images={gallery} title={text(building.name, locale)} />

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">{t.intro}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{t.roomTypes}</h2>
          </div>
          <div className="grid gap-6">
            {building.roomTypes.filter((roomType) => roomType.status === "published").map((roomType) => (
              <RoomTypeCard key={roomType.id} building={building} roomType={roomType} locale={locale} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
