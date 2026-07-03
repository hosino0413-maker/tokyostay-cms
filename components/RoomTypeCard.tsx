import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarX, DoorOpen, Ruler, Users } from "lucide-react";
import { roomTypeCover } from "@/lib/buildings";
import { text } from "@/lib/properties";
import { tagLabel } from "@/lib/tags";
import type { Building, Locale, RoomType } from "@/types/property";

const labels = {
  en: { view: "View Details", rooms: "rooms", unavailable: "unavailable periods" },
  zh: { view: "查看详情", rooms: "房间", unavailable: "段不可入住" },
  ja: { view: "詳細を見る", rooms: "部屋", unavailable: "利用不可期間" }
} as const;

export function RoomTypeCard({ building, roomType, locale }: { building: Building; roomType: RoomType; locale: Locale }) {
  const cover = roomTypeCover(roomType);
  const t = labels[locale];

  return (
    <Link
      href={`/building/${building.id}/room/${roomType.id}?lang=${locale}`}
      className="group grid gap-5 rounded-[28px] bg-white p-4 shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-1 hover:shadow-soft md:grid-cols-[260px_minmax(0,1fr)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-line md:aspect-auto md:h-full">
        {cover?.url && (
          <Image src={cover.url} alt={cover.alt || text(roomType.name, locale)} fill sizes="(max-width: 768px) 100vw, 260px" className="object-cover transition duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-5 p-1 md:p-3">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">{text(roomType.name, locale)}</h3>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-night/62">
            <span className="inline-flex items-center gap-1.5"><DoorOpen size={15} /> {roomType.roomType}</span>
            <span className="inline-flex items-center gap-1.5"><Users size={15} /> {roomType.capacity}</span>
            <span className="inline-flex items-center gap-1.5"><Ruler size={15} /> {roomType.size}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarX size={15} /> {roomType.unavailableDates.length} {t.unavailable}</span>
          </div>
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-night/58">{text(roomType.description, locale)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {roomType.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-night/68 ring-1 ring-line">
              {tagLabel(tag, locale)}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold text-night/55">{roomType.rooms.length} {t.rooms}: {roomType.rooms.join(", ") || "-"}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
            {t.view} <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
