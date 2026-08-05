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
  IconChevronRight,
  IconClock,
  IconDrink,
  IconMeal,
  IconPlus,
  IconSparkles,
  IconStar,
} from "@/components/icons";

// Apple's system color palette (dark mode) - each row/tile gets one, the
// way Wi-Fi/Bluetooth/etc. do in Réglages, instead of a single flat tint.
const QUICK_ACTIONS = [
  { href: "/describe", label: "Décrire un plat (IA)", Icon: IconSparkles, color: "#BF5AF2" },
  { href: "/foods", label: "Aliments courants", Icon: IconMeal, color: "#30D158" },
  { href: "/add/drink", label: "Ajouter une boisson", Icon: IconDrink, color: "#64D2FF" },
  { href: "/add", label: "Ajouter un produit", Icon: IconPlus, color: "#FF9F0A" },
];

const EXPLORE_LINKS = [
  { href: "/history", label: "Historique", Icon: IconClock, color: "#0A84FF" },
  { href: "/favorites", label: "Favoris", Icon: IconStar, color: "#FFD60A" },
  { href: "/recipes", label: "Mes recettes", Icon: IconBook, color: "#5E5CE6" },
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
                <MacroLegendRow color="#0A84FF" label="Protéines" value={totals.proteins} goal={goals.proteins} />
                <MacroLegendRow color="#FF9F0A" label="Glucides" value={totals.carbohydrates} goal={goals.carbohydrates} />
                <MacroLegendRow color="#FF375F" label="Lipides" value={totals.fat} goal={goals.fat} />
              </dl>
              <IconChevronRight className="chevron h-3.5 w-2 self-center" aria-hidden />
            </Link>
          </section>
        )}

        <section>
          <h2 className="section-label">Actions rapides</h2>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ href, label, Icon, color }) => (
              <Link key={href} href={href} className="quick-tile" title={label}>
                <span className="quick-tile-icon" style={{ background: color }}>
                  <Icon className="h-[18px] w-[18px] text-white" aria-hidden />
                </span>
                <span className="text-[11px] font-medium leading-tight text-slate-300">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {frequent.length > 0 && (
          <section>
            <h2 className="section-label">Produits fréquents</h2>
            <div className="list-group">
              {frequent.map((entry) => (
                <Link key={entry.barcode} href={`/product?barcode=${entry.barcode}`} className="list-row">
                  {entry.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.imageUrl} alt={entry.productName} className="h-[29px] w-[29px] flex-shrink-0 rounded-[8px] bg-white object-contain" />
                  ) : (
                    <div className="row-icon">
                      <IconMeal className="h-4 w-4 text-slate-300" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-slate-100">{entry.productName}</p>
                    <p className="text-[12.5px] text-slate-500">{entry.macros.energyKcal} kcal</p>
                  </div>
                  <IconChevronRight className="chevron h-3.5 w-2" aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="section-label">Explorer</h2>
          <div className="list-group">
            {EXPLORE_LINKS.map(({ href, label, Icon, color }) => (
              <Link key={href} href={href} className="list-row">
                <span className="row-icon" style={{ background: color }}>
                  <Icon className="h-4 w-4 text-white" aria-hidden />
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
  const percent = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  const over = goal > 0 && value > goal;
  const barColor = over ? "#FF453A" : color;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: barColor }} aria-hidden />
        <span className="text-[13px] tabular-nums">
          <b className="font-bold text-slate-100">{Math.round(value)}</b>
          <span className="text-slate-500">/{Math.round(goal)}g</span>{" "}
          <span className="text-slate-400">{label}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
