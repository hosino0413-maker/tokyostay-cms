import Link from "next/link";
import { locales } from "@/lib/properties";
import type { Locale } from "@/types/property";

export function LanguageSwitcher({ locale, pathname }: { locale: Locale; pathname: string }) {
  return (
    <div className="flex rounded-full border border-line bg-white p-1 shadow-card">
      {locales.map((item) => (
        <Link
          key={item.key}
          href={`${pathname}?lang=${item.key}`}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            item.key === locale ? "bg-ink text-white" : "text-night/60 hover:text-ink"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
