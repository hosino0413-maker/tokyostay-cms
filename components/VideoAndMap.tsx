import Image from "next/image";
import type { MapConfig, MediaVideo } from "@/types/property";

export function VideoPanel({ videos }: { videos: MediaVideo[] }) {
  const video = videos[0];
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-line">
      <h2 className="mb-4 text-2xl font-semibold">Room tour</h2>
      {!video ? (
        <div className="flex h-72 items-center justify-center rounded-[22px] bg-mist text-night/45">Video will appear here after publishing.</div>
      ) : video.url.includes("youtube.com") || video.url.includes("youtu.be") ? (
        <iframe src={video.url} title={video.title} className="h-72 w-full rounded-[22px] md:h-[460px]" allowFullScreen />
      ) : (
        <video src={video.url} controls className="max-h-[520px] w-full rounded-[22px] bg-black" />
      )}
    </div>
  );
}

export function MapPanel({ map }: { map: MapConfig }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-line">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Location</h2>
          <p className="mt-1 text-sm text-night/55">{map.address}</p>
        </div>
        <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold uppercase text-night/55">{map.type}</span>
      </div>
      {map.type === "image" && map.embedUrl ? (
        <div className="relative h-72 overflow-hidden rounded-[22px] md:h-[460px]">
          <Image src={map.embedUrl} alt={map.address || "Map"} fill className="object-cover" />
        </div>
      ) : map.embedUrl ? (
        <iframe src={map.embedUrl} title="Property map" className="h-72 w-full rounded-[22px] border-0 md:h-[460px]" loading="lazy" />
      ) : (
        <div className="flex h-72 items-center justify-center rounded-[22px] bg-mist text-night/45">Map will appear here after publishing.</div>
      )}
    </div>
  );
}
