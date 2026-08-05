import type { HistoryEntry } from "@/lib/types/product";

/** The exact column order/names this app's CSV export and import share - keep both in sync. */
export const HEADERS = [
  "date",
  "heure",
  "produit",
  "marque",
  "quantite_g",
  "calories_kcal",
  "proteines_g",
  "glucides_g",
  "sucres_g",
  "lipides_g",
  "fibres_g",
  "sel_g",
  "nutriscore",
  "nova",
];

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function historyToCsv(entries: HistoryEntry[]): string {
  const rows = entries.map((e) => {
    const date = new Date(e.timestamp);
    return [
      date.toLocaleDateString("fr-FR"),
      date.toLocaleTimeString("fr-FR"),
      e.productName,
      e.brand ?? "",
      String(e.quantityGrams),
      String(e.macros.energyKcal),
      String(e.macros.proteins),
      String(e.macros.carbohydrates),
      String(e.macros.sugars),
      String(e.macros.fat),
      String(e.macros.fiber),
      String(e.macros.salt),
      e.nutriScore,
      e.novaGroup ?? "",
    ]
      .map((field) => escapeCsvField(String(field)))
      .join(",");
  });

  return [HEADERS.join(","), ...rows].join("\n");
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
