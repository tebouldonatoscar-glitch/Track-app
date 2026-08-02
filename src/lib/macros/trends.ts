import type { HistoryEntry, MacroBreakdown } from "@/lib/types/product";
import { sumMacros } from "@/lib/macros/calculate";

export interface DayTotal {
  dateKey: string;
  label: string;
  macros: MacroBreakdown;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Buckets history entries into the last `days` calendar days (oldest first,
 * today included), filling in zero-macro days that have no logged entries.
 */
export function aggregateHistoryByDay(entries: HistoryEntry[], days: number): DayTotal[] {
  const byDay = new Map<string, MacroBreakdown[]>();
  for (const entry of entries) {
    const key = toDateKey(new Date(entry.timestamp));
    const list = byDay.get(key) ?? [];
    list.push(entry.macros);
    byDay.set(key, list);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: DayTotal[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = toDateKey(date);
    result.push({
      dateKey: key,
      label: date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
      macros: sumMacros(byDay.get(key) ?? []),
    });
  }
  return result;
}

export function averageMacros(days: DayTotal[]): MacroBreakdown {
  if (days.length === 0) {
    return { energyKcal: 0, proteins: 0, carbohydrates: 0, sugars: 0, fat: 0, saturatedFat: 0, fiber: 0, salt: 0 };
  }
  const total = sumMacros(days.map((d) => d.macros));
  const n = days.length;
  return {
    energyKcal: Math.round(total.energyKcal / n),
    proteins: Math.round((total.proteins / n) * 10) / 10,
    carbohydrates: Math.round((total.carbohydrates / n) * 10) / 10,
    sugars: Math.round((total.sugars / n) * 10) / 10,
    fat: Math.round((total.fat / n) * 10) / 10,
    saturatedFat: Math.round((total.saturatedFat / n) * 10) / 10,
    fiber: Math.round((total.fiber / n) * 10) / 10,
    salt: Math.round((total.salt / n) * 100) / 100,
  };
}
