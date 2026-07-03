import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, DoorOpen, MapPin, TrainFront } from "lucide-react";
import { buildingCover, roomTypeSummary, stationText } from "@/lib/buildings";
import { text } from "@/lib/properties";
import { tagLabel } from "@/lib/tags";
import type { Building, Locale } from "@/types/property";

const labels = {
  en: { view: "View Room Types", types: "room types" },
  zh: { view: "查看房型", types: "种户型" },
  ja: { view: "タイプを見る", types: "タイプ" }
} as const;

export function BuildingCard({ building, locale }: { building: Building; locale: Locale }) {
  const cover = buildingCover(building);
  const t = labels[locale];

  return (
    <Link
      href={`/building/${building.id}?lang=${locale}`}
      className="group block overflow-hidden rounded-[30px] bg-white shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        {cover?.url && (
          <Image src={cover.url} alt={cover.alt || text(building.name, locale)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-bold text-ink shadow-card">
          <Building2 size={14} /> Residence
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            <MapPin size={14} /> {building.area}
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{text(building.name, locale)}</h2>
          <div className="mt-3 grid gap-2 text-sm text-night/62">
            <p className="flex items-center gap-2">
              <TrainFront size={15} /> {stationText(building, locale)}
            </p>
            <p className="flex items-center gap-2">
              <DoorOpen size={15} /> {building.roomTypes.length} {t.types} · {roomTypeSummary(building)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {building.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-night/70 ring-1 ring-line">
              {tagLabel(tag, locale)}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold text-night/55">{roomTypeSummary(building)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
            {t.view} <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
