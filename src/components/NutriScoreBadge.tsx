import type { NutriScoreGrade } from "@/lib/types/product";
import { hexToRgba } from "@/lib/color";

// The neon green ("a") reads brightest with dark text, like a real neon
// sign; the other grades stay dark backgrounds with white text.
const COLORS: Record<NutriScoreGrade, string> = {
  a: "bg-green-600 text-black",
  b: "bg-lime-600 text-white",
  c: "bg-yellow-500 text-black",
  d: "bg-orange-600 text-white",
  e: "bg-red-600 text-white",
  unknown: "bg-slate-600 text-white",
};

// Matches each grade's Tailwind background above, used for a matching glow.
const GLOW_COLOR: Record<NutriScoreGrade, string | null> = {
  a: "#32D74B",
  b: "#65A30D",
  c: "#EAB308",
  d: "#EA580C",
  e: "#DC2626",
  unknown: null,
};

export default function NutriScoreBadge({ grade, size = "md" }: { grade: NutriScoreGrade; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  const label = grade === "unknown" ? "?" : grade.toUpperCase();
  const glow = GLOW_COLOR[grade];

  return (
    <div
      className={`flex ${dims} items-center justify-center rounded-full font-bold ${COLORS[grade]}`}
      style={glow ? { boxShadow: `0 0 5px 0 ${hexToRgba(glow, 0.35)}` } : undefined}
      title={`Nutri-Score ${label}`}
      aria-label={`Nutri-Score ${label}`}
    >
      {label}
    </div>
  );
}
