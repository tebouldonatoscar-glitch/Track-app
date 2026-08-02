import { describe, expect, it } from "vitest";
import { aggregateHistoryByDay, averageMacros } from "@/lib/macros/trends";
import type { HistoryEntry, MacroBreakdown } from "@/lib/types/product";

const macros: MacroBreakdown = {
  energyKcal: 500,
  proteins: 30,
  carbohydrates: 50,
  sugars: 10,
  fat: 15,
  saturatedFat: 5,
  fiber: 4,
  salt: 1,
};

function entryAt(daysAgo: number): HistoryEntry {
  const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  return {
    id: `entry-${daysAgo}`,
    barcode: "builtin-pomme",
    productName: "Pomme",
    brand: null,
    imageUrl: null,
    quantityGrams: 100,
    macros,
    nutriScore: "a",
    novaGroup: 1,
    timestamp,
  };
}

describe("aggregateHistoryByDay", () => {
  it("returns exactly `days` buckets, oldest first, today last", () => {
    const buckets = aggregateHistoryByDay([], 7);
    expect(buckets.length).toBe(7);
  });

  it("buckets entries into the correct calendar day and sums their macros", () => {
    const entries = [entryAt(0), entryAt(0), entryAt(1)];
    const buckets = aggregateHistoryByDay(entries, 7);
    const today = buckets[buckets.length - 1];
    const yesterday = buckets[buckets.length - 2];
    expect(today.macros.energyKcal).toBe(1000);
    expect(yesterday.macros.energyKcal).toBe(500);
  });

  it("fills days with no logged entries with zero macros", () => {
    const buckets = aggregateHistoryByDay([], 7);
    for (const bucket of buckets) {
      expect(bucket.macros.energyKcal).toBe(0);
    }
  });

  it("ignores entries older than the requested window", () => {
    const entries = [entryAt(30)];
    const buckets = aggregateHistoryByDay(entries, 7);
    const total = buckets.reduce((sum, b) => sum + b.macros.energyKcal, 0);
    expect(total).toBe(0);
  });
});

describe("averageMacros", () => {
  it("averages macros across the given days", () => {
    const buckets = aggregateHistoryByDay([entryAt(0), entryAt(1)], 2);
    const avg = averageMacros(buckets);
    expect(avg.energyKcal).toBe(500);
  });

  it("returns all zeros for an empty list", () => {
    const avg = averageMacros([]);
    expect(avg.energyKcal).toBe(0);
    expect(avg.salt).toBe(0);
  });
});
