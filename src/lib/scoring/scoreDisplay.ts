import type { HomemadeScore } from "@/lib/types/product";

/** Shared display mapping for any 0-100 score using the excellent/bon/moyen/mediocre/mauvais label scale. */
export const SCORE_LABEL_TEXT: Record<HomemadeScore["label"], string> = {
  excellent: "Excellent",
  bon: "Bon",
  moyen: "Moyen",
  mediocre: "Médiocre",
  mauvais: "Mauvais",
};

export const SCORE_LABEL_COLOR: Record<HomemadeScore["label"], string> = {
  excellent: "text-green-400",
  bon: "text-lime-400",
  moyen: "text-yellow-400",
  mediocre: "text-orange-400",
  mauvais: "text-red-400",
};

export const SCORE_BAR_COLOR: Record<HomemadeScore["label"], string> = {
  excellent: "bg-green-500",
  bon: "bg-lime-500",
  moyen: "bg-yellow-500",
  mediocre: "bg-orange-500",
  mauvais: "bg-red-500",
};

/** Hex equivalents of SCORE_BAR_COLOR, for a matching glow shadow. */
export const SCORE_GLOW_COLOR: Record<HomemadeScore["label"], string> = {
  excellent: "#30D158",
  bon: "#84CC16",
  moyen: "#EAB308",
  mediocre: "#F97316",
  mauvais: "#EF4444",
};
