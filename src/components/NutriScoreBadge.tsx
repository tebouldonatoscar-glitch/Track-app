import type { NutriScoreGrade } from "@/lib/types/product";

const COLORS: Record<NutriScoreGrade, string> = {
  a: "bg-green-600",
  b: "bg-lime-600",
  c: "bg-yellow-500",
  d: "bg-orange-600",
  e: "bg-red-600",
  unknown: "bg-slate-600",
};

export default function NutriScoreBadge({ grade, size = "md" }: { grade: NutriScoreGrade; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  const label = grade === "unknown" ? "?" : grade.toUpperCase();

  return (
    <div
      className={`flex ${dims} items-center justify-center rounded-full font-bold text-white ${COLORS[grade]}`}
      title={`Nutri-Score ${label}`}
      aria-label={`Nutri-Score ${label}`}
    >
      {label}
    </div>
  );
}
