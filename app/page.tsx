import Link from "next/link";
import { Building2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PropertyExplorer } from "@/components/PropertyExplorer";
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href={`/?lang=${locale}`} className="flex items-center gap-3 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-white">
              <Building2 size={19} />
            </span>
            <span>TokyoStay</span>
          </Link>
          <LanguageSwitcher locale={locale} pathname="/" />
        </div>
      </header>

      <PropertyExplorer properties={properties} locale={locale} />
    </main>
  );
}
