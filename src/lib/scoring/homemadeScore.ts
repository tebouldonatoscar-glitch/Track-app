import type { HomemadeScore, NovaGroup, NutrientsPer100g, NutriScoreGrade } from "@/lib/types/product";

const NUTRISCORE_BASE: Record<NutriScoreGrade, number> = {
  a: 95,
  b: 78,
  c: 60,
  d: 42,
  e: 25,
  unknown: 55,
};

const NOVA_PENALTY: Record<Exclude<NovaGroup, null>, number> = {
  1: 0,
  2: 4,
  3: 12,
  4: 25,
};

/**
 * Homemade quality score (0-100, higher = better) combining Nutri-Score,
 * NOVA processing level, sugar density, and additive count. Nutri-Score is
 * the anchor (reflects overall nutrition), NOVA/sugar/additives apply
 * penalties on top since a product can have a decent Nutri-Score while
 * still being heavily processed or sugar-loaded.
 */
export function computeHomemadeScore(
  nutriScore: NutriScoreGrade,
  novaGroup: NovaGroup,
  nutrients: NutrientsPer100g,
  additivesCount: number
): HomemadeScore {
  const reasons: string[] = [];
  let score = NUTRISCORE_BASE[nutriScore];
  const nutriScoreLabel = nutriScore === "unknown" ? "non renseigné" : nutriScore.toUpperCase();
  reasons.push(`Nutri-Score ${nutriScoreLabel} : base ${NUTRISCORE_BASE[nutriScore]}/100`);

  if (novaGroup !== null) {
    const penalty = NOVA_PENALTY[novaGroup];
    if (penalty > 0) {
      score -= penalty;
      reasons.push(`Groupe NOVA ${novaGroup} (transformation) : -${penalty}`);
    }
  }

  if (nutrients.sugars !== null) {
    if (nutrients.sugars > 22.5) {
      score -= 15;
      reasons.push(`Sucres élevés (${roundTo(nutrients.sugars, 1)}g/100g) : -15`);
    } else if (nutrients.sugars > 10) {
      score -= 7;
      reasons.push(`Sucres modérés (${roundTo(nutrients.sugars, 1)}g/100g) : -7`);
    }
  }

  if (additivesCount > 5) {
    score -= 10;
    reasons.push(`Nombreux additifs (${additivesCount}) : -10`);
  } else if (additivesCount > 2) {
    score -= 5;
    reasons.push(`Quelques additifs (${additivesCount}) : -5`);
  }

  if (nutrients.fiber !== null && nutrients.fiber >= 3) {
    score += 5;
    reasons.push(`Bonne teneur en fibres (${roundTo(nutrients.fiber, 1)}g/100g) : +5`);
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

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
