import type { HomemadeScore, NutrientsPer100g } from "@/lib/types/product";

/**
 * Nutrition score (0-100, higher = better) derived purely from calorie
 * density and macronutrients. Unlike computeHomemadeScore, it never
 * anchors on an external Nutri-Score/NOVA grade — every point comes
 * directly from the nutrient values, so it also works for foods that
 * have no Nutri-Score assigned (e.g. raw oils, butter, nuts).
 */
export function computeMacroScore(nutrients: NutrientsPer100g): HomemadeScore {
  const reasons: string[] = [];
  let score = 100;

  const energy = nutrients.energyKcal ?? 0;
  const energyPenalty = Math.min(40, energy / 15);
  if (energyPenalty >= 0.5) {
    score -= energyPenalty;
    reasons.push(`Densité calorique (${Math.round(energy)} kcal/100g) : -${energyPenalty.toFixed(1)}`);
  }

  const sugars = nutrients.sugars ?? 0;
  const sugarPenalty = Math.min(50, sugars * 0.5);
  if (sugarPenalty >= 0.5) {
    score -= sugarPenalty;
    reasons.push(`Sucres (${sugars}g/100g) : -${sugarPenalty.toFixed(1)}`);
  }

  const saturatedFat = nutrients.saturatedFat ?? 0;
  const saturatedFatPenalty = Math.min(25, saturatedFat * 1.5);
  if (saturatedFatPenalty >= 0.5) {
    score -= saturatedFatPenalty;
    reasons.push(`Acides gras saturés (${saturatedFat}g/100g) : -${saturatedFatPenalty.toFixed(1)}`);
  }

  const salt = nutrients.salt ?? 0;
  const saltPenalty = Math.min(15, salt * 10);
  if (saltPenalty >= 0.5) {
    score -= saltPenalty;
    reasons.push(`Sel (${salt}g/100g) : -${saltPenalty.toFixed(1)}`);
  }

  const fiber = nutrients.fiber ?? 0;
  const fiberBonus = Math.min(10, fiber * 1.2);
  if (fiberBonus >= 0.5) {
    score += fiberBonus;
    reasons.push(`Fibres (${fiber}g/100g) : +${fiberBonus.toFixed(1)}`);
  }

  const proteins = nutrients.proteins ?? 0;
  const proteinBonus = Math.min(10, proteins * 0.5);
  if (proteinBonus >= 0.5) {
    score += proteinBonus;
    reasons.push(`Protéines (${proteins}g/100g) : +${proteinBonus.toFixed(1)}`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: HomemadeScore["label"];
  if (score >= 80) label = "excellent";
  else if (score >= 60) label = "bon";
  else if (score >= 40) label = "moyen";
  else if (score >= 20) label = "mediocre";
  else label = "mauvais";

  return { score, label, reasons };
}
