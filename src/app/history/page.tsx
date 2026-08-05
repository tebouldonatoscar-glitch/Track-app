"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/types/product";
import { deleteHistoryEntry, getAllHistory } from "@/lib/storage/db";
import { downloadCsv, historyToCsv } from "@/lib/storage/csvExport";
import PageHeader from "@/components/PageHeader";
import HistoryList from "@/components/HistoryList";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllHistory()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

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

        <HistoryList entries={entries} onDelete={handleDelete} />
      </div>
    </main>
  );
}
