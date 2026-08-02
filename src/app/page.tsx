"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DailyGoals, HistoryEntry } from "@/lib/types/product";
import { getDailyGoals, getFrequentProducts, getHistoryForDate } from "@/lib/storage/db";
import { sumMacros } from "@/lib/macros/calculate";
import GoalProgressBar from "@/components/GoalProgressBar";

export default function HomePage() {
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [todayEntries, setTodayEntries] = useState<HistoryEntry[]>([]);
  const [frequent, setFrequent] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [g, entries, freq] = await Promise.all([
          getDailyGoals(),
          getHistoryForDate(new Date()),
          getFrequentProducts(6),
        ]);
        if (cancelled) return;
        setGoals(g);
        setTodayEntries(entries);
        setFrequent(freq);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = sumMacros(todayEntries.map((e) => e.macros));

  return (
    <main className="space-y-5 p-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-slate-100">NutriScan</h1>
        <p className="text-sm text-slate-400">Scannez, analysez, progressez.</p>
      </header>

      <Link href="/scan" className="btn-primary w-full text-lg">
        📷 Scanner un produit
      </Link>

      {!loading && goals && (
        <section className="card space-y-3">
          <h2 className="font-semibold text-slate-200">Aujourd&apos;hui</h2>
          <GoalProgressBar label="Calories" value={totals.energyKcal} goal={goals.energyKcal} unit="kcal" color="bg-green-500" />
          <GoalProgressBar label="Protéines" value={totals.proteins} goal={goals.proteins} unit="g" color="bg-blue-500" />
          <GoalProgressBar label="Glucides" value={totals.carbohydrates} goal={goals.carbohydrates} unit="g" color="bg-yellow-500" />
          <GoalProgressBar label="Lipides" value={totals.fat} goal={goals.fat} unit="g" color="bg-orange-500" />
          <Link href="/goals" className="block text-center text-xs text-slate-500 underline">
            Modifier mes objectifs
          </Link>
        </section>
      )}

      {frequent.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-slate-200">Produits fréquents</h2>
          <div className="grid grid-cols-2 gap-2">
            {frequent.map((entry) => (
              <Link
                key={entry.barcode}
                href={`/product?barcode=${entry.barcode}`}
                className="card flex items-center gap-2"
              >
                {entry.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.imageUrl} alt={entry.productName} className="h-10 w-10 rounded-lg bg-white object-contain" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">🍽️</div>
                )}
                <span className="truncate text-sm text-slate-200">{entry.productName}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <Link href="/history" className="btn-secondary">📋 Historique</Link>
        <Link href="/favorites" className="btn-secondary">⭐ Favoris</Link>
        <Link href="/trends" className="btn-secondary">📊 Tendances</Link>
        <Link href="/recipes" className="btn-secondary">🍲 Mes recettes</Link>
        <Link href="/foods" className="btn-secondary">🥕 Aliments courants</Link>
        <Link href="/describe" className="btn-secondary">🤖 Décrire un plat (IA)</Link>
        <Link href="/add/drink" className="btn-secondary">🥤 Ajouter une boisson</Link>
        <Link href="/add" className="btn-secondary">➕ Ajouter un produit</Link>
      </section>
    </main>
  );
}
