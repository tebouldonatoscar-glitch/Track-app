import { describe, expect, it } from "vitest";
import { historyToCsv } from "@/lib/storage/csvExport";
import type { HistoryEntry } from "@/lib/types/product";

const entry: HistoryEntry = {
  id: "1",
  barcode: "3017620422003",
  productName: "Nutella, pâte à tartiner",
  brand: "Ferrero",
  imageUrl: null,
  quantityGrams: 30,
  macros: {
    energyKcal: 161.7,
    proteins: 1.9,
    carbohydrates: 17.3,
    sugars: 16.9,
    fat: 9.3,
    saturatedFat: 3.2,
    fiber: 0,
    salt: 0.03,
  },
  nutriScore: "e",
  novaGroup: 4,
  timestamp: new Date("2026-01-15T12:30:00").getTime(),
};

describe("historyToCsv", () => {
  it("includes a header row and one row per entry", () => {
    const csv = historyToCsv([entry]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("produit");
    expect(lines[1]).toContain("161.7");
  });

  it("quotes fields containing commas so the CSV stays valid", () => {
    const csv = historyToCsv([entry]);
    expect(csv).toContain('"Nutella, pâte à tartiner"');
  });

  it("returns just the header for an empty history", () => {
    const csv = historyToCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
  });
});
