"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import type { DailyGoals } from "@/lib/types/product";
import { DEFAULT_GOALS, getDailyGoals, setDailyGoals } from "@/lib/storage/db";

export default function GoalsPage() {
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDailyGoals()
      .then(setGoals)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof DailyGoals, value: string) => {
    const num = Number(value);
    setGoals((prev) => ({ ...prev, [field]: Number.isFinite(num) ? num : 0 }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDailyGoals(goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <main className="p-4">
        <p className="text-slate-400">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="space-y-4 p-4">
      <Link href="/" className="text-slate-400">
        ← Accueil
      </Link>
      <h1 className="text-xl font-bold text-slate-100">Objectifs journaliers</h1>

      <form onSubmit={handleSave} className="card space-y-4">
        <Field label="Calories (kcal)" value={goals.energyKcal} onChange={(v) => handleChange("energyKcal", v)} />
        <Field label="Protéines (g)" value={goals.proteins} onChange={(v) => handleChange("proteins", v)} />
        <Field label="Glucides (g)" value={goals.carbohydrates} onChange={(v) => handleChange("carbohydrates", v)} />
        <Field label="Lipides (g)" value={goals.fat} onChange={(v) => handleChange("fat", v)} />

        <button type="submit" className="btn-primary w-full">
          Enregistrer
        </button>
        {saved && <p className="text-center text-sm text-green-400">Objectifs enregistrés !</p>}
      </form>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-slate-300">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  );
}
