import type { MacroBreakdown, NutrientsPer100g } from "@/lib/types/product";

export interface AiMealEstimate {
  dishName: string;
  estimatedTotalWeightGrams: number | null;
  macros: MacroBreakdown;
  confidenceNote: string | null;
}

export type GeminiEstimateErrorCode =
  | "missing_api_key"
  | "invalid_key"
  | "network_error"
  | "rate_limited"
  | "invalid_response"
  | "api_error"
  | "timeout";

export type GeminiEstimateResult =
  | { ok: true; estimate: AiMealEstimate }
  | { ok: false; error: GeminiEstimateErrorCode; message?: string };

export interface AiLabelScan {
  productName: string | null;
  /** Per-100g/100ml, normalized by the model even when the label prints per-serving values. */
  nutrients: NutrientsPer100g;
  confidenceNote: string | null;
}

export type GeminiLabelScanResult =
  | { ok: true; scan: AiLabelScan }
  | { ok: false; error: GeminiEstimateErrorCode; message?: string };
