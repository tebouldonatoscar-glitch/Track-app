"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DailyGoals, HistoryEntry } from "@/lib/types/product";
import { getAllHistory, getDailyGoals } from "@/lib/storage/db";
import { aggregateHistoryByDay, averageMacros } from "@/lib/macros/trends";
import TrendsChart from "@/components/TrendsChart";

const PERIODS = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
] as const;

export default function TrendsPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllHistory(), getDailyGoals()])
      .then(([loadedEntries, loadedGoals]) => {
        setEntries(loadedEntries);
        setGoals(loadedGoals);
      })
      .finally(() => setLoading(false));
  }, []);

  const days = useMemo(() => aggregateHistoryByDay(entries, periodDays), [entries, periodDays]);
  const loggedDays = useMemo(() => days.filter((d) => d.macros.energyKcal > 0), [days]);
  const average = useMemo(() => averageMacros(loggedDays), [loggedDays]);

  return (
    <main className="space-y-4 p-4">
      <Link href="/" className="text-slate-400">
        ← Accueil
      </Link>
      <h1 className="text-xl font-bold text-slate-100">Tendances</h1>

      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => setPeriodDays(p.days)}
            className={`rounded-full px-3 py-1 text-sm ${
              periodDays === p.days ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-400">Chargement…</p>}

      {!loading && entries.length === 0 && (
        <div className="card text-center text-slate-400">
          Aucune donnée pour le moment.
          <div className="mt-3">
            <Link href="/scan" className="btn-primary">
              Scanner un produit
            </Link>
          </div>
        </div>
      )}

      {!loading && entries.length > 0 && goals && (
        <>
          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-200">Calories par jour</h2>
            <TrendsChart days={days} goalKcal={goals.energyKcal} />
            <p className="text-xs text-slate-500">
              Ligne pointillée = objectif quotidien ({goals.energyKcal} kcal). Orange = jour au-dessus de l&apos;objectif.
            </p>
          </div>

          <div className="card space-y-2">
            <h2 className="font-semibold text-slate-200">
              {loggedDays.length > 0
                ? `Moyenne sur ${loggedDays.length} jour${loggedDays.length > 1 ? "s" : ""} suivi${loggedDays.length > 1 ? "s" : ""}`
                : "Aucun jour suivi sur cette période"}
            </h2>
            {loggedDays.length > 0 && (
              <dl className="grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-slate-400">Calories</dt>
                <dd className="text-right text-slate-200">{average.energyKcal} kcal</dd>
                <dt className="text-slate-400">Protéines</dt>
                <dd className="text-right text-slate-200">{average.proteins} g</dd>
                <dt className="text-slate-400">Glucides</dt>
                <dd className="text-right text-slate-200">{average.carbohydrates} g</dd>
                <dt className="text-slate-400">Lipides</dt>
                <dd className="text-right text-slate-200">{average.fat} g</dd>
              </dl>
            )}
          </div>
        </>
      )}
    </main>
  );
}
