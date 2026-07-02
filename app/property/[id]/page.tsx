import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BedDouble, CalendarDays, Film, Home, Map, MapPin, Ruler, Sparkles, TrainFront, Users } from "lucide-react";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PropertyGallery } from "@/components/PropertyGallery";
import { MapPanel, VideoPanel } from "@/components/VideoAndMap";
import { getProperty, text } from "@/lib/properties";
import type { Locale } from "@/types/property";

const copy = {
  en: {
    back: "Back to properties",
    overview: "Overview",
    gallery: "Gallery",
    amenities: "Amenities",
    calendar: "Calendar",
    video: "Video",
    map: "Map",
    about: "About this stay",
    selling: "Highlights",
    privateInquiry: "Private inquiry",
    privateBody: "Public pages do not show contact details. Use TokyoStay internal channels or a controlled inquiry form when it is enabled.",
    unavailable: "Unavailable dates"
  },
  zh: {
    back: "返回房源列表",
    overview: "概览",
    gallery: "图片",
    amenities: "设施",
    calendar: "日历",
    video: "视频",
    map: "地图",
    about: "房源介绍",
    selling: "房源亮点",
    privateInquiry: "私密咨询",
    privateBody: "公开房源页不展示联系方式。后续可接入受控咨询表单，客户提交后进入后台线索管理。",
    unavailable: "不可入住日期"
  },
  ja: {
    back: "物件一覧へ戻る",
    overview: "概要",
    gallery: "写真",
    amenities: "設備",
    calendar: "カレンダー",
    video: "動画",
    map: "地図",
    about: "物件紹介",
    selling: "おすすめポイント",
    privateInquiry: "非公開問い合わせ",
    privateBody: "公開ページには連絡先を表示しません。必要に応じて管理された問い合わせフォームを追加できます。",
    unavailable: "利用不可日"
  }
} as const;

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
  const t = copy[locale];
  const detailItems = [
    { icon: MapPin, label: property.area },
    { icon: BedDouble, label: property.roomType },
    { icon: Users, label: property.capacity },
    { icon: Ruler, label: property.size },
    { icon: TrainFront, label: property.traffic }
  ];
  const navItems = [
    { id: "gallery", icon: Home, label: t.gallery },
    { id: "overview", icon: Sparkles, label: t.overview },
    { id: "amenities", icon: BedDouble, label: t.amenities },
    { id: "calendar", icon: CalendarDays, label: t.calendar },
    { id: "video", icon: Film, label: t.video },
    { id: "map", icon: Map, label: t.map }
  ];

  return (
    <main>
      <header className="glass-nav sticky top-0 z-30 border-b border-line/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href={`/?lang=${locale}`} className="inline-flex items-center gap-2 text-sm font-semibold text-night/65 hover:text-ink">
            <ArrowLeft size={18} /> {t.back}
          </Link>
          <LanguageSwitcher locale={locale} pathname={`/property/${property.id}`} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 md:py-12">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">{property.area}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{text(property.title, locale)}</h1>
            <p className="mt-4 text-lg text-night/55">{property.priceNote}</p>
          </div>
          <div className="rounded-[24px] bg-white p-5 shadow-card ring-1 ring-line">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">{t.privateInquiry}</p>
            <p className="mt-3 text-sm leading-6 text-night/62">{t.privateBody}</p>
          </div>
        </div>

        <PropertyGallery images={property.images} />

        <div className="mt-8 grid gap-7 lg:grid-cols-[190px_1fr_360px]">
          <nav className="top-24 hidden self-start rounded-[24px] bg-white p-3 shadow-card ring-1 ring-line lg:sticky lg:block">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-night/62 transition hover:bg-mist hover:text-ink">
                <item.icon size={17} /> {item.label}
              </a>
            ))}
          </nav>

          <div className="sticky top-[73px] z-20 -mx-5 flex gap-2 overflow-x-auto border-y border-line bg-mist/95 px-5 py-3 backdrop-blur lg:hidden">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-night/65 ring-1 ring-line">
                {item.label}
              </a>
            ))}
          </div>

          <div className="space-y-7">
            <section id="overview" className="scroll-mt-28 rounded-[28px] bg-white p-7 shadow-card ring-1 ring-line">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {detailItems.map((item) => (
                  <div key={item.label} className="rounded-[22px] bg-mist/70 p-4 ring-1 ring-line">
                    <item.icon className="mb-4 text-brand" size={20} />
                    <p className="text-sm font-semibold leading-6 text-night/72">{item.label}</p>
                  </div>
                ))}
              </div>
              <h2 className="mt-8 text-2xl font-semibold">{t.about}</h2>
              <p className="mt-4 text-base leading-8 text-night/65">{text(property.description, locale)}</p>
            </section>

            {!!property.sellingPoints.length && (
              <section className="rounded-[28px] bg-ink p-7 text-white shadow-card">
                <h2 className="text-2xl font-semibold">{t.selling}</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {property.sellingPoints.map((point) => (
                    <div key={text(point, locale)} className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/82 ring-1 ring-white/10">
                      {text(point, locale)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section id="amenities" className="scroll-mt-28 rounded-[28px] bg-white p-7 shadow-card ring-1 ring-line">
              <h2 className="text-2xl font-semibold">{t.amenities}</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-night/65 ring-1 ring-line">
                    {amenity}
                  </span>
                ))}
              </div>
            </section>

            <div id="video" className="scroll-mt-28">
              <VideoPanel videos={property.videos} />
            </div>
            <div id="map" className="scroll-mt-28">
              <MapPanel map={property.map} />
            </div>
          </div>

          <aside id="calendar" className="scroll-mt-28 space-y-7 lg:sticky lg:top-24 lg:self-start">
            <AvailabilityCalendar ranges={property.unavailableDates} title={t.unavailable} />
          </aside>
        </div>
      </section>
    </main>
  );
}
