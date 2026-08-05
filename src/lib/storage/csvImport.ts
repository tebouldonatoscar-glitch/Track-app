import type { HistoryEntry, NovaGroup, NutriScoreGrade } from "@/lib/types/product";
import { HEADERS as EXPECTED_HEADERS } from "@/lib/storage/csvExport";

const NUTRI_SCORE_GRADES: NutriScoreGrade[] = ["a", "b", "c", "d", "e", "unknown"];

export interface CsvImportResult {
  entries: HistoryEntry[];
  skipped: number;
}

/** Splits CSV text into rows of fields, honoring quoted fields with embedded commas/newlines/escaped quotes. */
function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];

    if (inQuotes) {
      if (char === '"') {
        if (csv[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && csv[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number(value.trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** Parses "dd/mm/yyyy" + "HH:mm:ss" (the exact format historyToCsv writes via toLocaleDateString/toLocaleTimeString("fr-FR")) into a timestamp. */
function parseFrenchDateTime(dateStr: string, timeStr: string): number | null {
  const dateMatch = dateStr?.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateMatch) return null;
  const [, day, month, year] = dateMatch;

  const timeMatch = timeStr?.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  const hour = timeMatch ? Number(timeMatch[1]) : 0;
  const minute = timeMatch ? Number(timeMatch[2]) : 0;
  const second = timeMatch?.[3] ? Number(timeMatch[3]) : 0;

  const date = new Date(Number(year), Number(month) - 1, Number(day), hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

/**
 * Parses a CSV in this app's own export format (see historyToCsv) back into
 * history entries, for restoring a backup or recovering from a cleared
 * browser storage. Imported entries can't be linked back to a real product
 * page (the export only keeps the logged totals, not full per-100g product
 * data), so they get a synthetic "imported-" id/barcode - HistoryList
 * renders those as plain text, the same treatment as recipe log entries.
 */
export function parseHistoryCsv(csv: string): CsvImportResult {
  const text = csv.replace(/^﻿/, "");
  const rows = parseCsvRows(text);
  if (rows.length === 0) return { entries: [], skipped: 0 };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const idx = {
    date: col("date"),
    heure: col("heure"),
    produit: col("produit"),
    marque: col("marque"),
    quantite: col("quantite_g"),
    kcal: col("calories_kcal"),
    proteines: col("proteines_g"),
    glucides: col("glucides_g"),
    sucres: col("sucres_g"),
    lipides: col("lipides_g"),
    fibres: col("fibres_g"),
    sel: col("sel_g"),
    nutriscore: col("nutriscore"),
    nova: col("nova"),
  };

  if (idx.date === -1 || idx.produit === -1 || idx.kcal === -1) {
    return { entries: [], skipped: rows.length - 1 };
  }
  const looksLikeOurFormat = EXPECTED_HEADERS.every((h) => header.includes(h));
  if (!looksLikeOurFormat) {
    return { entries: [], skipped: rows.length - 1 };
  }

  const entries: HistoryEntry[] = [];
  let skipped = 0;

  for (const row of rows.slice(1)) {
    const timestamp = parseFrenchDateTime(row[idx.date], row[idx.heure]);
    const productName = row[idx.produit]?.trim();
    if (timestamp === null || !productName) {
      skipped++;
      continue;
    }

    const rawGrade = row[idx.nutriscore]?.trim().toLowerCase();
    const nutriScore: NutriScoreGrade = NUTRI_SCORE_GRADES.includes(rawGrade as NutriScoreGrade)
      ? (rawGrade as NutriScoreGrade)
      : "unknown";
    const rawNova = Number(row[idx.nova]);
    const novaGroup: NovaGroup = [1, 2, 3, 4].includes(rawNova) ? (rawNova as NovaGroup) : null;

    entries.push({
      id: `imported-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      barcode: `imported-${Math.random().toString(36).slice(2, 10)}`,
      productName,
      brand: row[idx.marque]?.trim() || null,
      imageUrl: null,
      quantityGrams: parseNumber(row[idx.quantite]),
      macros: {
        energyKcal: parseNumber(row[idx.kcal]),
        proteins: parseNumber(row[idx.proteines]),
        carbohydrates: parseNumber(row[idx.glucides]),
        sugars: parseNumber(row[idx.sucres]),
        fat: parseNumber(row[idx.lipides]),
        saturatedFat: 0,
        fiber: parseNumber(row[idx.fibres]),
        salt: parseNumber(row[idx.sel]),
      },
      nutriScore,
      novaGroup,
      timestamp,
    });
  }

  return { entries, skipped };
}
