"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { MediaImage } from "@/types/property";

export function PropertyGallery({ images }: { images: MediaImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="rounded-[30px] bg-white p-10 text-night/50 shadow-card">No images yet.</div>;
  }

  function move(delta: number) {
    setActive((value) => (value + delta + images.length) % images.length);
  }

  return (
    <section className="rounded-[30px] bg-white p-3 shadow-soft ring-1 ring-line md:p-5">
      <div className="relative h-[420px] overflow-hidden rounded-[24px] bg-line md:h-[640px]">
        <Image src={current.url} alt={current.alt} fill priority className="object-cover" />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button onClick={() => move(-1)} className="rounded-full bg-white/92 p-3 text-ink shadow-card" aria-label="Previous image">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => move(1)} className="rounded-full bg-white/92 p-3 text-ink shadow-card" aria-label="Next image">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setActive(index)}
            className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl ring-2 transition md:h-24 md:w-36 ${
              index === active ? "ring-ink" : "ring-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={image.url} alt={image.alt} fill className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
