import Link from "next/link";
import type { HistoryEntry } from "@/lib/types/product";
import NutriScoreBadge from "@/components/NutriScoreBadge";
import { IconMeal, IconTrash } from "@/components/icons";

function groupByDay(entries: HistoryEntry[]): Map<string, HistoryEntry[]> {
  const groups = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const key = new Date(entry.timestamp).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }
  return groups;
}

interface HistoryListProps {
  entries: HistoryEntry[];
  onDelete: (id: string) => void;
  limitDays?: number;
}

export default function HistoryList({ entries, onDelete, limitDays }: HistoryListProps) {
  const grouped = Array.from(groupByDay(entries).entries());
  const days = limitDays ? grouped.slice(0, limitDays) : grouped;

  return (
    <>
      {days.map(([day, dayEntries]) => (
        <section key={day}>
          <h2 className="section-label capitalize">{day}</h2>
          <div className="list-group">
            {dayEntries.map((entry) => (
              <div key={entry.id} className="list-row">
                {entry.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.imageUrl} alt={entry.productName} className="h-[29px] w-[29px] flex-shrink-0 rounded-[8px] bg-white object-contain" />
                ) : (
                  <div className="row-icon">
                    <IconMeal className="h-4 w-4 text-slate-300" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {entry.barcode.startsWith("recipe-") ? (
                    <p className="truncate text-[15px] font-medium text-slate-100">{entry.productName}</p>
                  ) : (
                    <Link href={`/product?barcode=${entry.barcode}`} className="block truncate text-[15px] font-medium text-slate-100">
                      {entry.productName}
                    </Link>
                  )}
                  <p className="text-[12.5px] text-slate-500">
                    {entry.quantityGrams}g · {entry.macros.energyKcal} kcal ·{" "}
                    {new Date(entry.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <NutriScoreBadge grade={entry.nutriScore} size="sm" />
                <button onClick={() => onDelete(entry.id)} aria-label="Supprimer" className="icon-btn hover:!text-red-400">
                  <IconTrash className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
