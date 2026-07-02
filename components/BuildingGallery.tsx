"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { MediaImage } from "@/types/property";

export function BuildingGallery({ images, title }: { images: MediaImage[]; title: string }) {
  const gallery = useMemo(() => images.filter((image) => image.url), [images]);
  const [active, setActive] = useState(0);
  const current = gallery[active] ?? gallery[0];

  useEffect(() => {
    if (gallery.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % gallery.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [gallery.length]);

  if (!current) {
    return <div className="mt-8 rounded-[34px] bg-white p-10 text-night/45 shadow-soft ring-1 ring-line">No building images yet.</div>;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-[34px] bg-white p-3 shadow-soft ring-1 ring-line md:p-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-line md:aspect-[16/7]">
        {gallery.map((image, index) => (
          <Image
            key={image.id}
            src={image.url}
            alt={image.alt || title}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto px-1 pb-2">
          {gallery.slice(0, 6).map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-line ring-2 transition md:h-24 md:w-40 ${
                index === active ? "ring-ink" : "ring-transparent opacity-65 hover:opacity-100"
              }`}
              aria-label={`Show ${title} image ${index + 1}`}
            >
              <Image src={image.url} alt={image.alt || title} fill sizes="180px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
