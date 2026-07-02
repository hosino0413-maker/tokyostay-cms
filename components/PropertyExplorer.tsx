"use client";

import { useMemo, useState } from "react";
import { Building2, Heart, MapPinned, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { text } from "@/lib/properties";
import type { Locale, Property } from "@/types/property";

const copy = {
  en: {
    eyebrow: "Tokyo furnished stays",
    title: "Tokyo Vacation Rentals",
    subtitle: "Modern Living in Tokyo",
    lead: "Curated homes for short stays, monthly stays, relocation, and business travel across Tokyo.",
    search: "Search area, station, room type, or amenity",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guests: "Guests",
    allAreas: "All areas",
    allGuests: "Any guests",
    featured: "Featured Properties",
    map: "Explore by Map",
    about: "About TokyoStay",
    aboutBody: "TokyoStay presents clean, private property pages for guests to review rooms, photos, availability, video, and map context without public contact details.",
    noResults: "No properties match these filters yet.",
    quick: ["Popular", "Family", "Business", "Near Station", "Long Stay"]
  },
  zh: {
    eyebrow: "东京精选住宿",
    title: "Tokyo Vacation Rentals",
    subtitle: "Modern Living in Tokyo",
    lead: "适合东京短住、长租、搬家过渡与商务差旅的精选房源。",
    search: "搜索区域、车站、房型或设施",
    checkIn: "入住日期",
    checkOut: "退房日期",
    guests: "入住人数",
    allAreas: "全部区域",
    allGuests: "不限人数",
    featured: "精选房源",
    map: "地图探索",
    about: "关于 TokyoStay",
    aboutBody: "TokyoStay 用干净、私密的房源展示页帮助客户查看图片、日历、视频和地图信息，前台不会公开联系方式。",
    noResults: "暂时没有符合筛选条件的房源。",
    quick: ["热门", "家庭", "商务", "近车站", "长住"]
  },
  ja: {
    eyebrow: "東京の厳選ステイ",
    title: "Tokyo Vacation Rentals",
    subtitle: "Modern Living in Tokyo",
    lead: "短期滞在、月単位滞在、引越し準備、出張に適した東京の住まいを紹介します。",
    search: "エリア、駅、間取り、設備を検索",
    checkIn: "チェックイン",
    checkOut: "チェックアウト",
    guests: "人数",
    allAreas: "すべてのエリア",
    allGuests: "人数指定なし",
    featured: "おすすめ物件",
    map: "地図で探す",
    about: "TokyoStayについて",
    aboutBody: "TokyoStayは、連絡先を公開せずに写真、空室カレンダー、動画、地図を確認できる物件ページを提供します。",
    noResults: "条件に一致する物件はまだありません。",
    quick: ["人気", "家族向け", "ビジネス", "駅近", "長期滞在"]
  }
} as const;

function capacityMax(capacity: string) {
  const matches = capacity.match(/\d+/g);
  if (!matches?.length) return 0;
  return Math.max(...matches.map(Number));
}

export function PropertyExplorer({ properties, locale }: { properties: Property[]; locale: Locale }) {
  const t = copy[locale];
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [guests, setGuests] = useState("all");
  const [quick, setQuick] = useState("");

  const areas = useMemo(() => Array.from(new Set(properties.map((property) => property.area))), [properties]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const guestNumber = guests === "all" ? 0 : Number(guests);

    return properties.filter((property) => {
      const haystack = [
        text(property.title, locale),
        property.area,
        property.roomType,
        property.traffic,
        property.amenities.join(" ")
      ].join(" ").toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      const matchesArea = area === "all" || property.area === area;
      const matchesGuests = !guestNumber || capacityMax(property.capacity) >= guestNumber;
      const matchesQuick = !quick || haystack.includes(quick.toLowerCase()) || property.amenities.join(" ").toLowerCase().includes(quick.toLowerCase());
      return matchesQuery && matchesArea && matchesGuests && matchesQuick;
    });
  }, [area, guests, locale, properties, query, quick]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-[#f8f6f1]">
        <div className="absolute inset-x-0 top-0 h-28 bg-white/70" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-8 md:grid-cols-[1fr_0.86fr] md:pb-14 md:pt-12">
          <div className="flex min-h-[440px] flex-col justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand shadow-card">
                <Sparkles size={14} /> {t.eyebrow}
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-ink md:text-7xl">
                {t.title}
                <span className="mt-3 block text-night/58">{t.subtitle}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-night/62 md:text-lg">{t.lead}</p>
            </div>

            <div className="mt-8 rounded-[28px] border border-line bg-white p-3 shadow-soft">
              <div className="grid gap-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.72fr_auto]">
                <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3">
                  <Search size={18} className="text-night/45" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="w-full bg-transparent text-sm outline-none placeholder:text-night/45" />
                </label>
                <input type="date" aria-label={t.checkIn} className="rounded-2xl bg-mist px-4 py-3 text-sm text-night/70 outline-none" />
                <input type="date" aria-label={t.checkOut} className="rounded-2xl bg-mist px-4 py-3 text-sm text-night/70 outline-none" />
                <select value={guests} onChange={(event) => setGuests(event.target.value)} aria-label={t.guests} className="rounded-2xl bg-mist px-4 py-3 text-sm text-night/70 outline-none">
                  <option value="all">{t.allGuests}</option>
                  {[1, 2, 3, 4].map((value) => (
                    <option key={value} value={value}>{value}+</option>
                  ))}
                </select>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
                  <SlidersHorizontal size={17} /> Filter
                </button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] min-w-0 overflow-hidden rounded-[36px] bg-ink shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop"
              alt="Tokyo skyline"
              className="block h-full w-full object-cover opacity-92"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/72 to-transparent p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">TokyoStay</p>
              <p className="mt-2 max-w-sm text-2xl font-semibold">Clean property pages for confident guest decisions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setArea("all")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line ${area === "all" ? "bg-ink text-white" : "bg-white text-night/68"}`}>
            {t.allAreas}
          </button>
          {areas.map((item) => (
            <button key={item} onClick={() => setArea(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line ${area === item ? "bg-ink text-white" : "bg-white text-night/68"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {t.quick.map((item) => (
            <button key={item} onClick={() => setQuick(quick === item ? "" : item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line ${quick === item ? "bg-brand text-white" : "bg-white text-night/68"}`}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Collection</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{t.featured}</h2>
          </div>
          <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-night/55 ring-1 ring-line">{filtered.length} stays</p>
        </div>
        {filtered.length ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-line bg-white p-10 text-center text-night/58 shadow-card">{t.noResults}</div>
        )}
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-5 pb-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] bg-white p-7 shadow-card ring-1 ring-line">
          <div className="mb-5 inline-flex rounded-full bg-mist p-3 text-brand">
            <Building2 size={20} />
          </div>
          <h2 className="text-2xl font-semibold">{t.about}</h2>
          <p className="mt-4 leading-8 text-night/62">{t.aboutBody}</p>
        </div>
        <div className="overflow-hidden rounded-[28px] bg-white shadow-card ring-1 ring-line">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><MapPinned size={20} className="text-brand" /> {t.map}</h2>
            <span className="text-sm text-night/45">Tokyo</span>
          </div>
          <div className="grid min-h-[280px] place-items-center bg-[radial-gradient(circle_at_20%_20%,rgba(184,70,47,.18),transparent_28%),linear-gradient(135deg,#f6f4ef,#ffffff)] p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {properties.map((property) => (
                <a key={property.id} href={`/property/${property.id}?lang=${locale}`} className="rounded-2xl bg-white/90 p-4 shadow-card ring-1 ring-line transition hover:-translate-y-0.5">
                  <div className="mb-2 inline-flex rounded-full bg-brand/10 p-2 text-brand"><Heart size={16} /></div>
                  <p className="font-semibold">{text(property.title, locale)}</p>
                  <p className="mt-1 text-sm text-night/55">{property.area}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
