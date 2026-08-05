"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DailyGoals, HistoryEntry } from "@/lib/types/product";
import { getDailyGoals, getFrequentProducts, getHistoryForDate } from "@/lib/storage/db";
import { sumMacros } from "@/lib/macros/calculate";
import CalorieRing from "@/components/CalorieRing";
import PageHeader from "@/components/PageHeader";
import {
  IconBook,
  IconCamera,
  IconChart,
  IconChevronRight,
  IconClock,
  IconDrink,
  IconMeal,
  IconPlus,
  IconSparkles,
  IconStar,
} from "@/components/icons";

const QUICK_LINKS = [
  { href: "/history", label: "Historique", Icon: IconClock },
  { href: "/favorites", label: "Favoris", Icon: IconStar },
  { href: "/trends", label: "Tendances", Icon: IconChart },
  { href: "/recipes", label: "Mes recettes", Icon: IconBook },
  { href: "/foods", label: "Aliments courants", Icon: IconMeal },
  { href: "/describe", label: "Décrire un plat (IA)", Icon: IconSparkles },
  { href: "/add/drink", label: "Ajouter une boisson", Icon: IconDrink },
  { href: "/add", label: "Ajouter un produit", Icon: IconPlus },
];

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
    <main className="pb-6">
      <PageHeader title="Accueil" />
      <div className="space-y-5 px-4 pt-3">
        <Link href="/scan" className="btn-primary w-full text-[15px]">
          <IconCamera className="h-5 w-5" aria-hidden />
          Scanner un produit
        </Link>

        {!loading && goals && (
          <section>
            <h2 className="section-label">Aujourd&apos;hui</h2>
            <Link href="/goals" className="card flex items-center gap-4">
              <CalorieRing value={totals.energyKcal} goal={goals.energyKcal} />
              <dl className="flex-1 space-y-2">
                <MacroLegendRow color="#3D7DE0" label="Protéines" value={totals.proteins} goal={goals.proteins} />
                <MacroLegendRow color="#D98A2B" label="Glucides" value={totals.carbohydrates} goal={goals.carbohydrates} />
                <MacroLegendRow color="#D3665C" label="Lipides" value={totals.fat} goal={goals.fat} />
              </dl>
              <IconChevronRight className="chevron h-3.5 w-2 self-center" aria-hidden />
            </Link>
          </section>
        )}

        {frequent.length > 0 && (
          <section>
            <h2 className="section-label">Produits fréquents</h2>
            <div className="grid grid-cols-2 gap-2">
              {frequent.map((entry) => (
                <Link
                  key={entry.barcode}
                  href={`/product?barcode=${entry.barcode}`}
                  className="card flex items-center gap-2 !p-2.5"
                >
                  {entry.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.imageUrl} alt={entry.productName} className="h-10 w-10 rounded-lg bg-white object-contain" />
                  ) : (
                    <div className="row-icon">
                      <IconMeal className="h-4 w-4 text-slate-400" aria-hidden />
                    </div>
                  )}
                  <span className="truncate text-sm text-slate-200">{entry.productName}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="section-label">Explorer</h2>
          <div className="list-group">
            {QUICK_LINKS.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="list-row">
                <span className="row-icon">
                  <Icon className="h-[18px] w-[18px] text-green-400" aria-hidden />
                </span>
                <span className="flex-1 text-[15px] text-slate-100">{label}</span>
                <IconChevronRight className="chevron h-3.5 w-2" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function MacroLegendRow({ color, label, value, goal }: { color: string; label: string; value: number; goal: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} aria-hidden />
      <span className="text-[13px] tabular-nums">
        <b className="font-bold text-slate-100">{Math.round(value)}</b>
        <span className="text-slate-500">/{Math.round(goal)}g</span>{" "}
        <span className="text-slate-400">{label}</span>
      </span>
    </div>
  );
}
