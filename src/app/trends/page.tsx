"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DailyGoals, HistoryEntry } from "@/lib/types/product";
import { getAllHistory, getDailyGoals } from "@/lib/storage/db";
import { aggregateHistoryByDay, averageMacros } from "@/lib/macros/trends";
import TrendsChart from "@/components/TrendsChart";
import PageHeader from "@/components/PageHeader";

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
    <main className="pb-4">
      <PageHeader title="Tendances" backHref="/" backLabel="Accueil" />
      <div className="space-y-4 px-4 pt-3">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setPeriodDays(p.days)}
              className={`pill ${periodDays === p.days ? "pill-active" : "pill-inactive"}`}
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
      </div>
    </main>
  );
}
