import { describe, expect, it } from "vitest";
import { parseHistoryCsv } from "@/lib/storage/csvImport";
import { historyToCsv } from "@/lib/storage/csvExport";
import type { HistoryEntry } from "@/lib/types/product";

const SAMPLE_CSV = `﻿date,heure,produit,marque,quantite_g,calories_kcal,proteines_g,glucides_g,sucres_g,lipides_g,fibres_g,sel_g,nutriscore,nova
04/08/2026,22:12:29,Boîte de sardines,Estimation IA,125,198,25,0.6,0.1,10.6,0,1.2,unknown,
04/08/2026,17:34:15,Huile d'olive,,14,124,0,0,0,14,0,0,unknown,2
04/08/2026,17:32:03,"Poulet boucané avec riz, brocolis et sauce créole",Estimation IA,0,760,36,101,4.5,23.5,0,0,unknown,`;

describe("parseHistoryCsv", () => {
  it("parses every data row, including a quoted field with an embedded comma", () => {
    const { entries, skipped } = parseHistoryCsv(SAMPLE_CSV);
    expect(skipped).toBe(0);
    expect(entries).toHaveLength(3);
    expect(entries[2].productName).toBe("Poulet boucané avec riz, brocolis et sauce créole");
  });

  it("reconstructs the timestamp from the French date/time columns", () => {
    const { entries } = parseHistoryCsv(SAMPLE_CSV);
    const date = new Date(entries[0].timestamp);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7); // August, 0-indexed
    expect(date.getDate()).toBe(4);
    expect(date.getHours()).toBe(22);
    expect(date.getMinutes()).toBe(12);
  });

  it("maps macros, brand, nutriScore and novaGroup for a normal row", () => {
    const { entries } = parseHistoryCsv(SAMPLE_CSV);
    const oil = entries[1];
    expect(oil.brand).toBeNull();
    expect(oil.macros.energyKcal).toBe(124);
    expect(oil.macros.fat).toBe(14);
    expect(oil.nutriScore).toBe("unknown");
    expect(oil.novaGroup).toBe(2);
  });

  it("defaults a blank nova column to null rather than 0", () => {
    const { entries } = parseHistoryCsv(SAMPLE_CSV);
    expect(entries[0].novaGroup).toBeNull();
  });

  it("gives imported entries a synthetic id/barcode that isn't a real product", () => {
    const { entries } = parseHistoryCsv(SAMPLE_CSV);
    expect(entries[0].barcode.startsWith("imported-")).toBe(true);
    expect(entries[0].id.startsWith("imported-")).toBe(true);
  });

  it("round-trips historyToCsv output back into equivalent entries", () => {
    const original: HistoryEntry = {
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
      timestamp: new Date(2026, 0, 15, 12, 30, 0).getTime(),
    };

    const csv = historyToCsv([original]);
    const { entries } = parseHistoryCsv(csv);
    expect(entries).toHaveLength(1);
    expect(entries[0].productName).toBe(original.productName);
    expect(entries[0].macros.energyKcal).toBe(original.macros.energyKcal);
    expect(entries[0].nutriScore).toBe("e");
    expect(entries[0].novaGroup).toBe(4);
    expect(entries[0].timestamp).toBe(original.timestamp);
  });

  it("skips rows with an unparseable date instead of throwing", () => {
    const csv = `date,heure,produit,marque,quantite_g,calories_kcal,proteines_g,glucides_g,sucres_g,lipides_g,fibres_g,sel_g,nutriscore,nova
not-a-date,12:00:00,Test,,100,100,1,1,1,1,1,1,unknown,`;
    const { entries, skipped } = parseHistoryCsv(csv);
    expect(entries).toHaveLength(0);
    expect(skipped).toBe(1);
  });

  it("rejects a CSV that isn't in NutriScan's export format", () => {
    const csv = `name,price\nApple,1.50`;
    const { entries } = parseHistoryCsv(csv);
    expect(entries).toHaveLength(0);
  });

  it("returns an empty result for an empty string", () => {
    const { entries, skipped } = parseHistoryCsv("");
    expect(entries).toHaveLength(0);
    expect(skipped).toBe(0);
  });
});
