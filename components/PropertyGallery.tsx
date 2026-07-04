"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MediaImage } from "@/types/property";

export function PropertyGallery({ images }: { images: MediaImage[] }) {
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

  useEffect(() => {
    if (active >= gallery.length) setActive(0);
  }, [active, gallery.length]);

  if (!current) {
    return <div id="gallery" className="scroll-mt-32 rounded-[28px] border border-black/[0.06] bg-white/86 p-5 text-night/50 shadow-card md:p-8">No images yet.</div>;
  }

  function move(delta: number) {
    setActive((value) => (value + delta + gallery.length) % gallery.length);
  }

  return (
    <section id="gallery" className="scroll-mt-32 overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/86 p-5 shadow-card md:p-8">
      <div className="relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-[20px] bg-line md:aspect-[16/10]">
        <Image src={current.url} alt={current.alt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-ink/42 to-transparent p-4 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink/50 px-3 py-1.5 text-xs font-bold backdrop-blur">
            <Images size={15} /> {active + 1} / {gallery.length}
          </span>
        </div>
        {gallery.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
            <button onClick={() => move(-1)} className="rounded-full bg-white/92 p-3 text-ink shadow-card transition hover:scale-105" aria-label="Previous image">
              <ChevronLeft size={21} />
            </button>
            <button onClick={() => move(1)} className="rounded-full bg-white/92 p-3 text-ink shadow-card transition hover:scale-105" aria-label="Next image">
              <ChevronRight size={21} />
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 flex max-w-full gap-3 overflow-x-auto px-1 pb-2">
        {gallery.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setActive(index)}
            className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl ring-2 transition md:h-24 md:w-36 ${
              index === active ? "ring-ink" : "ring-transparent opacity-72 hover:opacity-100"
            }`}
            aria-label={`Show image ${index + 1}`}
          >
            <Image src={image.url} alt={image.alt} fill sizes="160px" className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
