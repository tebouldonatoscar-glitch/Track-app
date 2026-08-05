"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/types/product";
import { addHistoryEntries, deleteHistoryEntry, getAllHistory } from "@/lib/storage/db";
import { downloadCsv, historyToCsv } from "@/lib/storage/csvExport";
import { parseHistoryCsv } from "@/lib/storage/csvImport";
import PageHeader from "@/components/PageHeader";
import HistoryList from "@/components/HistoryList";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleImportFile = async (file: File) => {
    setImportMessage(null);
    const text = await file.text();
    const { entries: parsed, skipped } = parseHistoryCsv(text);

    if (parsed.length === 0) {
      setImportMessage(
        skipped > 0
          ? "Aucune entrée valide dans ce fichier."
          : "Ce fichier ne ressemble pas à un export Historique NutriScan."
      );
      return;
    }

    const existingKeys = new Set(entries.map((e) => `${e.timestamp}|${e.productName}`));
    const toInsert = parsed.filter((e) => !existingKeys.has(`${e.timestamp}|${e.productName}`));
    const duplicates = parsed.length - toInsert.length;

    if (toInsert.length > 0) {
      await addHistoryEntries(toInsert);
      setEntries((prev) => [...toInsert, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    }

    const parts = [`${toInsert.length} entrée${toInsert.length > 1 ? "s" : ""} importée${toInsert.length > 1 ? "s" : ""}`];
    if (duplicates > 0) parts.push(`${duplicates} déjà présente${duplicates > 1 ? "s" : ""} ignorée${duplicates > 1 ? "s" : ""}`);
    if (skipped > 0) parts.push(`${skipped} ligne${skipped > 1 ? "s" : ""} illisible${skipped > 1 ? "s" : ""}`);
    setImportMessage(parts.join(" · "));
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
        <div>
          <label htmlFor={fileInputId} className="btn-secondary w-full cursor-pointer">
            Importer un CSV
          </label>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleImportFile(file);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          />
          {importMessage && <p className="mt-2 text-center text-xs text-slate-400">{importMessage}</p>}
        </div>

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
