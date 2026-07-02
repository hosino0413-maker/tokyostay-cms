"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { isUnavailable, toIsoDate } from "@/lib/properties";
import type { DateRange } from "@/types/property";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AvailabilityCalendar({ ranges }: { ranges: DateRange[] }) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const days: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
    for (let day = 1; day <= last.getDate(); day += 1) {
      days.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    return days;
  }, [month]);

  function move(delta: number) {
    setMonth((value) => new Date(value.getFullYear(), value.getMonth() + delta, 1));
  }

  return (
    <div className="rounded-[24px] bg-white p-5 shadow-card ring-1 ring-line">
      <div className="mb-5 flex items-center justify-between">
        <button onClick={() => move(-1)} className="rounded-full border border-line p-2 text-night/70 hover:bg-mist" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-lg font-semibold">
          {month.toLocaleDateString("en", { month: "long", year: "numeric" })}
        </h3>
        <button onClick={() => move(1)} className="rounded-full border border-line p-2 text-night/70 hover:bg-mist" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day) => (
          <div key={day} className="py-2 text-center text-[11px] font-bold uppercase text-night/45">
            {day}
          </div>
        ))}
        {cells.map((date, index) => {
          const blocked = date ? isUnavailable(ranges, toIsoDate(date)) : false;
          return (
            <div
              key={date?.toISOString() ?? `empty-${index}`}
              className={`aspect-square rounded-2xl border text-center text-sm leading-[3.1rem] ${
                !date
                  ? "border-transparent"
                  : blocked
                    ? "border-red-200 bg-red-50 font-bold text-red-700 line-through"
                    : "border-line bg-mist/40 text-night/72"
              }`}
            >
              {date?.getDate()}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-night/50">
        Red dates are unavailable for check-in or stay.
      </p>
    </div>
  );
}
