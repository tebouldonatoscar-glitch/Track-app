import type { MacroBreakdown } from "@/lib/types/product";
import { proteinCalorieRatio } from "@/lib/macros/calculate";
import { IconMuscle } from "@/components/icons";

interface MacroRow {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}

export default function MacroBreakdownCard({ macros }: { macros: MacroBreakdown }) {
  const ratio = proteinCalorieRatio(macros);

  const rows: MacroRow[] = [
    { label: "Calories", value: macros.energyKcal, unit: "kcal" },
    { label: "Protéines", value: macros.proteins, unit: "g", highlight: true },
    { label: "Glucides", value: macros.carbohydrates, unit: "g" },
    { label: "  dont sucres", value: macros.sugars, unit: "g" },
    { label: "Lipides", value: macros.fat, unit: "g" },
    { label: "  dont saturés", value: macros.saturatedFat, unit: "g" },
    { label: "Fibres", value: macros.fiber, unit: "g" },
    { label: "Sel", value: macros.salt, unit: "g" },
  ];

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Macronutriments</h3>
        {ratio !== null && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-blue-900/60 px-3 py-1 text-xs font-medium text-blue-300"
            title="Ratio protéines/calories"
          >
            <IconMuscle className="h-3.5 w-3.5" aria-hidden />
            {ratio}% protéines
          </span>
        )}
      </div>
      <dl className="divide-y divide-slate-700/60">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-1.5 text-sm">
            <dt className={row.highlight ? "font-medium text-green-400" : "text-slate-400"}>{row.label}</dt>
            <dd className={row.highlight ? "font-semibold text-green-400" : "text-slate-200"}>
              {row.value} {row.unit}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
