import Image from "next/image";
import type { MapConfig, MediaVideo } from "@/types/property";

function extractEmbedUrl(value = "") {
  const srcMatch = value.match(/src=["']([^"']+)["']/i);
  return srcMatch?.[1] || value;
}

export function VideoPanel({ videos }: { videos: MediaVideo[] }) {
  const video = videos[0];
  return (
    <section className="rounded-[28px] border border-black/[0.06] bg-white/86 p-5 shadow-card md:p-8">
      <h2 className="mb-4 text-2xl font-semibold">Room tour</h2>
      {!video ? (
        <div className="flex aspect-video w-full max-w-full items-center justify-center overflow-hidden rounded-[20px] bg-mist text-night/45">Video will appear here after publishing.</div>
      ) : video.url.includes("youtube.com") || video.url.includes("youtu.be") ? (
        <iframe src={video.url} title={video.title} className="aspect-video w-full max-w-full overflow-hidden rounded-[20px]" allowFullScreen />
      ) : (
        <video src={video.url} controls className="aspect-video w-full max-w-full overflow-hidden rounded-[20px] bg-black object-contain" />
      )}
    </section>
  );
}

export function MapPanel({ map }: { map: MapConfig }) {
  const embedUrl = extractEmbedUrl(map.embedUrl);
  return (
    <section className="rounded-[28px] border border-black/[0.06] bg-white/86 p-5 shadow-card md:p-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Location</h2>
          <p className="mt-1 text-sm text-night/55">{map.address}</p>
        </div>
        <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold uppercase text-night/55">{map.type}</span>
      </div>
      {map.type === "image" && embedUrl ? (
        <div className="relative aspect-[16/10] w-full max-w-full overflow-hidden rounded-[20px]">
          <Image src={embedUrl} alt={map.address || "Map"} fill className="object-cover" />
        </div>
      ) : embedUrl ? (
        <iframe src={embedUrl} title="Property map" className="aspect-[16/10] w-full max-w-full overflow-hidden rounded-[20px] border-0" loading="lazy" />
      ) : (
        <div className="flex aspect-[16/10] w-full max-w-full items-center justify-center overflow-hidden rounded-[20px] bg-mist text-night/45">Map will appear here after publishing.</div>
      )}
    </section>
  );
}
