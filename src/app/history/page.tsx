"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/types/product";
import { deleteHistoryEntry, getAllHistory } from "@/lib/storage/db";
import { downloadCsv, historyToCsv } from "@/lib/storage/csvExport";
import NutriScoreBadge from "@/components/NutriScoreBadge";
import PageHeader from "@/components/PageHeader";
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

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllHistory()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => groupByDay(entries), [entries]);

  const handleDelete = async (id: string) => {
    await deleteHistoryEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleExport = () => {
    const csv = historyToCsv(entries);
    downloadCsv(csv, `nutriscan-historique-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <main className="pb-4">
      <PageHeader
        title="Historique"
        backHref="/"
        backLabel="Accueil"
        action={
          entries.length > 0 ? (
            <button onClick={handleExport} className="text-[15px] font-medium text-green-400">
              Exporter en CSV
            </button>
          ) : undefined
        }
      />

      <div className="space-y-4 px-4 pt-3">
        {loading && <p className="text-slate-400">Chargement…</p>}

        {!loading && entries.length === 0 && (
          <div className="card text-center text-slate-400">
            Aucun scan enregistré pour le moment.
            <div className="mt-3">
              <Link href="/scan" className="btn-primary">
                Scanner un produit
              </Link>
            </div>
          </div>
        )}

        {Array.from(grouped.entries()).map(([day, dayEntries]) => (
          <section key={day}>
            <h2 className="section-label capitalize">{day}</h2>
            <div className="list-group">
              {dayEntries.map((entry) => (
                <div key={entry.id} className="list-row">
                  {entry.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.imageUrl} alt={entry.productName} className="h-11 w-11 flex-shrink-0 rounded-full bg-white object-contain" />
                  ) : (
                    <div className="row-icon">
                      <IconMeal className="h-[18px] w-[18px] text-slate-400" aria-hidden />
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
                  <button onClick={() => handleDelete(entry.id)} aria-label="Supprimer" className="icon-btn hover:!text-red-400">
                    <IconTrash className="h-[18px] w-[18px]" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
