import type { MacroBreakdown } from "@/lib/types/product";

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
  | "api_error";

export type GeminiEstimateResult =
  | { ok: true; estimate: AiMealEstimate }
  | { ok: false; error: GeminiEstimateErrorCode; message?: string };
