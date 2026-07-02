"use client";

import { BedDouble, Film, Home, Map, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/types/property";

const labels = {
  en: {
    gallery: "Gallery",
    overview: "Overview",
    amenities: "Amenities",
    video: "Video",
    map: "Map"
  },
  zh: {
    gallery: "图片",
    overview: "概览",
    amenities: "设施",
    video: "视频",
    map: "地图"
  },
  ja: {
    gallery: "写真",
    overview: "概要",
    amenities: "設備",
    video: "動画",
    map: "地図"
  }
} as const;

const sectionIds = ["gallery", "overview", "amenities", "video", "map"] as const;

const icons = {
  gallery: Home,
  overview: Sparkles,
  amenities: BedDouble,
  video: Film,
  map: Map
};

type SectionId = (typeof sectionIds)[number];

function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PropertySectionNav({ locale, variant = "both" }: { locale: Locale; variant?: "both" | "desktop" | "mobile" }) {
  const [activeId, setActiveId] = useState<SectionId>("gallery");
  const [navY, setNavY] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const items = useMemo(
    () =>
      sectionIds.map((id) => ({
        id,
        label: labels[locale][id],
        icon: icons[id]
      })),
    [locale]
  );

  useEffect(() => {
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio || a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible?.target?.id && sectionIds.includes(visible.target.id as SectionId)) {
          setActiveId(visible.target.id as SectionId);
        }
      },
      {
        rootMargin: "-145px 0px -52% 0px",
        threshold: [0.1, 0.24, 0.4, 0.6]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (variant === "mobile") return;

    let frame = 0;
    let currentY = 0;

    function clamp(value: number, min: number, max: number) {
      return Math.min(Math.max(value, min), max);
    }

    function animate() {
      const wrapper = wrapperRef.current;
      const nav = navRef.current;

      if (wrapper && nav && window.innerWidth >= 1024) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperTop = window.scrollY + wrapperRect.top;
        const maxY = Math.max(0, wrapper.offsetHeight - nav.offsetHeight);
        const targetY = clamp(window.scrollY + 120 - wrapperTop, 0, maxY);

        currentY += (targetY - currentY) * 0.14;

        if (Math.abs(targetY - currentY) < 0.2) {
          currentY = targetY;
        }

        setNavY(currentY);
      } else {
        currentY = 0;
        setNavY(0);
      }

      frame = window.requestAnimationFrame(animate);
    }

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [variant]);

  return (
    <>
      {variant !== "mobile" && (
        <div ref={wrapperRef} className="relative hidden min-h-full self-stretch lg:block">
          <nav
            ref={navRef}
            className="absolute left-0 top-0 z-20 w-[180px] rounded-[24px] border border-white/75 bg-white/86 p-2.5 shadow-[0_20px_55px_rgba(23,20,18,0.10)] ring-1 ring-line/70 backdrop-blur-xl will-change-transform"
            style={{ transform: `translate3d(0, ${navY}px, 0)` }}
            aria-label="Property sections"
          >
            <div className="flex flex-col gap-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-full px-3.5 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-brand/10 font-bold text-brand shadow-[inset_0_0_0_1px_rgba(203,72,48,0.12)]"
                        : "font-semibold text-night/62 hover:bg-mist hover:text-ink"
                    }`}
                  >
                    <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {variant !== "desktop" && (
        <nav className="sticky top-[69px] z-20 flex gap-2 overflow-x-auto border-b border-line/70 bg-mist/88 px-5 py-3 shadow-[0_16px_35px_rgba(23,20,18,0.08)] backdrop-blur-xl lg:hidden" aria-label="Property sections">
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  active ? "bg-brand/10 font-bold text-brand ring-1 ring-brand/15" : "bg-white/86 font-semibold text-night/62 ring-1 ring-line"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
