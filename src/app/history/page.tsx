"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/types/product";
import { deleteHistoryEntry, getAllHistory } from "@/lib/storage/db";
import { downloadCsv, historyToCsv } from "@/lib/storage/csvExport";
import NutriScoreBadge from "@/components/NutriScoreBadge";

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
    <main className="space-y-4 p-4">
      <div className="flex items-center justify-between pt-2">
        <Link href="/" className="text-slate-400">
          ← Accueil
        </Link>
        {entries.length > 0 && (
          <button onClick={handleExport} className="text-sm text-green-400 underline">
            Exporter en CSV
          </button>
        )}
      </div>
      <h1 className="text-xl font-bold text-slate-100">Historique</h1>

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
        <section key={day} className="space-y-2">
          <h2 className="text-sm font-medium capitalize text-slate-400">{day}</h2>
          {dayEntries.map((entry) => (
            <div key={entry.id} className="card flex items-center gap-3">
              {entry.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.imageUrl} alt={entry.productName} className="h-12 w-12 rounded-lg bg-white object-contain" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700">🍽️</div>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/product?barcode=${entry.barcode}`} className="block truncate font-medium text-slate-200">
                  {entry.productName}
                </Link>
                <p className="text-xs text-slate-500">
                  {entry.quantityGrams}g · {entry.macros.energyKcal} kcal ·{" "}
                  {new Date(entry.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <NutriScoreBadge grade={entry.nutriScore} size="sm" />
              <button
                onClick={() => handleDelete(entry.id)}
                aria-label="Supprimer"
                className="text-slate-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
