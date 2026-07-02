"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { text } from "@/lib/properties";
import type { Locale, Property } from "@/types/property";

const defaultHeroImage =
  "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1800&auto=format&fit=crop";

const copy = {
  en: {
    title: "Find your Tokyo stay",
    lead: "Curated homes for short stays, monthly stays, relocation, and business travel across Tokyo.",
    area: "Area",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guests: "Guests",
    search: "Search",
    featured: "Featured Properties",
    noResults: "No properties match these filters yet.",
    stays: "stays"
  },
  zh: {
    title: "寻找你的东京住宿",
    lead: "适合东京短住、月租、搬家过渡与商务差旅的精选房源。",
    area: "区域",
    checkIn: "入住日期",
    checkOut: "退房日期",
    guests: "入住人数",
    search: "搜索",
    featured: "Featured Properties",
    noResults: "暂时没有符合筛选条件的房源。",
    stays: "套房源"
  },
  ja: {
    title: "東京の滞在先を探しましょう",
    lead: "短期滞在、月単位の滞在、引越し準備、出張に適した東京の住まいを紹介します。",
    area: "エリア",
    checkIn: "チェックイン",
    checkOut: "チェックアウト",
    guests: "人数",
    search: "検索する",
    featured: "Featured Properties",
    noResults: "条件に一致する物件はまだありません。",
    stays: "件"
  }
} as const;

const areaOptions = [
  { value: "all", label: { en: "All areas", zh: "全部区域", ja: "すべて" }, keywords: [] },
  { value: "shinjuku", label: { en: "Shinjuku", zh: "新宿", ja: "新宿" }, keywords: ["shinjuku", "jingumae", "新宿"] },
  { value: "shibuya", label: { en: "Shibuya", zh: "涉谷", ja: "渋谷" }, keywords: ["shibuya", "渋谷", "涉谷"] },
  { value: "taito", label: { en: "Taito", zh: "台东", ja: "台東" }, keywords: ["taito", "asakusa", "台东", "台東", "浅草"] },
  { value: "bunkyo", label: { en: "Bunkyo", zh: "文京", ja: "文京" }, keywords: ["bunkyo", "文京"] }
];

function capacityMax(capacity: string) {
  const matches = capacity.match(/\d+/g);
  if (!matches?.length) return 0;
  return Math.max(...matches.map(Number));
}

function areaMatches(property: Property, selectedArea: string) {
  if (selectedArea === "all") return true;
  const option = areaOptions.find((item) => item.value === selectedArea);
  if (!option) return true;
  const haystack = [
    property.area,
    text(property.title, "en"),
    text(property.title, "zh"),
    text(property.title, "ja")
  ].join(" ").toLowerCase();
  return option.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function PropertyExplorer({ properties, locale }: { properties: Property[]; locale: Locale }) {
  const t = copy[locale];
  const [area, setArea] = useState("all");
  const [guests, setGuests] = useState("1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [heroImage, setHeroImage] = useState(defaultHeroImage);

  useEffect(() => {
    const saved = localStorage.getItem("tokyostay-home-hero-url");
    if (saved) setHeroImage(saved);
  }, []);

  const featured = useMemo(() => {
    const guestNumber = Number(guests || 1);
    return properties
      .filter((property) => areaMatches(property, area))
      .filter((property) => capacityMax(property.capacity) >= guestNumber)
      .slice(0, 6);
  }, [area, guests, properties]);

  return (
    <>
      <section className="bg-white px-4 pb-12 pt-6 md:px-8 md:pb-16 md:pt-10">
        <div className="relative mx-auto max-w-7xl">
          <div className="relative min-h-[620px] overflow-hidden rounded-[34px] bg-ink shadow-soft md:min-h-[560px]">
            <img src={heroImage} alt="Tokyo skyline" className="absolute inset-0 h-full w-full object-cover" />
          </div>

          <div className="relative z-10 -mt-[580px] flex min-h-[580px] items-center md:-mt-[560px] md:min-h-[560px] md:px-8">
            <div className="w-full max-w-[540px] rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-line md:p-10">
              <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
                {t.title}
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-night/62">{t.lead}</p>

              <div className="mt-7 space-y-3">
                <label className="block rounded-2xl border border-line bg-white px-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-ink">
                    <MapPin size={14} /> {t.area}
                  </span>
                  <select value={area} onChange={(event) => setArea(event.target.value)} className="mt-2 w-full bg-transparent text-lg outline-none">
                    {areaOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label[locale]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white">
                  <label className="block border-r border-line px-4 py-3">
                    <span className="flex items-center gap-2 text-xs font-bold text-ink">
                      <CalendarDays size={14} /> {t.checkIn}
                    </span>
                    <input value={checkIn} onChange={(event) => setCheckIn(event.target.value)} type="date" className="mt-2 w-full bg-transparent text-sm text-night/70 outline-none" />
                  </label>
                  <label className="block px-4 py-3">
                    <span className="flex items-center gap-2 text-xs font-bold text-ink">
                      <CalendarDays size={14} /> {t.checkOut}
                    </span>
                    <input value={checkOut} onChange={(event) => setCheckOut(event.target.value)} type="date" className="mt-2 w-full bg-transparent text-sm text-night/70 outline-none" />
                  </label>
                </div>

                <label className="block rounded-2xl border border-line bg-white px-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-ink">
                    <Users size={14} /> {t.guests}
                  </span>
                  <select value={guests} onChange={(event) => setGuests(event.target.value)} className="mt-2 w-full bg-transparent text-lg outline-none">
                    {[1, 2, 3, 4, 5, 6].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>

                <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E61E5D] px-5 py-4 text-base font-semibold text-white shadow-card transition hover:bg-[#d81352]">
                  <Search size={18} /> {t.search}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 pt-2">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Collection</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{t.featured}</h2>
          </div>
          <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-night/55 ring-1 ring-line">
            {featured.length} {t.stays}
          </p>
        </div>

        {featured.length ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-line bg-white p-10 text-center text-night/58 shadow-card">{t.noResults}</div>
        )}
      </section>
    </>
  );
}
