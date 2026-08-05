import type { NutriScoreGrade } from "@/lib/types/product";

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

export default function NutriScoreBadge({ grade, size = "md" }: { grade: NutriScoreGrade; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  const label = grade === "unknown" ? "?" : grade.toUpperCase();

  return (
    <div
      className={`flex ${dims} items-center justify-center rounded-full font-bold ${COLORS[grade]}`}
      title={`Nutri-Score ${label}`}
      aria-label={`Nutri-Score ${label}`}
    >
      {label}
    </div>
  );
}
