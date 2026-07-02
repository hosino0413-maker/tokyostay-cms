import Link from "next/link";
import { ArrowUpRight, Building2, LayoutDashboard } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PropertyCard } from "@/components/PropertyCard";
import { getPublishedProperties } from "@/lib/properties";
import type { Locale } from "@/types/property";

function parseLocale(value?: string): Locale {
  return value === "zh" || value === "ja" ? value : "en";
}

export default function Home({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = parseLocale(searchParams.lang);
  const properties = getPublishedProperties();

  return (
    <main>
      <header className="glass-nav sticky top-0 z-30 border-b border-line/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href={`/?lang=${locale}`} className="flex items-center gap-3 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-white">
              <Building2 size={19} />
            </span>
            <span>TokyoStay</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-night/70 shadow-card md:inline-flex">
              进入后台
            </Link>
            <LanguageSwitcher locale={locale} pathname="/" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-8 md:pb-14 md:pt-12">
        <div className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand">Tokyo furnished stays</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            TokyoStay 房源展示
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-night/62 md:text-lg">
            前台只展示房源信息、图片、视频、地图和不可入住日期，不显示联系方式。后台可以继续维护房源、上传媒体和发布链接。
          </p>
        </div>
          <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">
            <LayoutDashboard size={17} /> 进入后台编辑器
          </Link>
        </div>

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} locale={locale} />
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-white/55">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 md:grid-cols-3">
          <Info title="三图拼图" body="每个房源卡片直接展示 3 张图，点击进入详情页。" />
          <Info title="详情页展示" body="包含轮播、缩略图、视频、地图、设施和不可入住日历。" />
          <Info title="后台发布" body="在后台维护数据，配置 COS 和域名后再接入真实发布。" />
        </div>
      </section>
    </main>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card ring-1 ring-line">
      <div className="mb-4 inline-flex rounded-full bg-mist p-3 text-brand">
        <ArrowUpRight size={18} />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-night/60">{body}</p>
    </div>
  );
}
