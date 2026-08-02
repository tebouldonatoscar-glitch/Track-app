import type { NovaGroup } from "@/lib/types/product";

const LABELS: Record<string, string> = {
  "1": "Non transformé / minimalement transformé",
  "2": "Ingrédient culinaire transformé",
  "3": "Aliment transformé",
  "4": "Ultra-transformé",
};

const COLORS: Record<string, string> = {
  "1": "bg-green-700 text-green-100",
  "2": "bg-lime-700 text-lime-100",
  "3": "bg-orange-700 text-orange-100",
  "4": "bg-red-700 text-red-100",
};

export default function NovaBadge({ group }: { group: NovaGroup }) {
  if (group === null) {
    return (
      <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
        NOVA inconnu
      </span>
    );
  }

  const key = String(group);

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${COLORS[key]}`}>
      NOVA {group} · {LABELS[key]}
    </span>
  );
}
