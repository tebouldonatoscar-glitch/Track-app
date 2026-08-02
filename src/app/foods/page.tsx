"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BUILTIN_FOODS, type FoodCategory } from "@/lib/data/genericFoods";

const CATEGORY_ORDER: FoodCategory[] = ["Fruits", "Légumes", "Œufs & laitages", "Féculents", "Légumineuses & noix"];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

export default function FoodsPage() {
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const query = normalize(search.trim());
    const filtered = query
      ? BUILTIN_FOODS.filter((f) => normalize(f.product.name).includes(query))
      : BUILTIN_FOODS;

    return CATEGORY_ORDER.map((category) => ({
      category,
      items: filtered.filter((f) => f.category === category),
    })).filter((group) => group.items.length > 0);
  }, [search]);

  return (
    <main className="space-y-4 p-4">
      <Link href="/" className="text-slate-400">
        ← Accueil
      </Link>
      <h1 className="text-xl font-bold text-slate-100">Aliments courants</h1>
      <p className="text-sm text-slate-400">
        Fruits, légumes et autres aliments dont les valeurs nutritionnelles ne dépendent pas de la
        marque. Valeurs moyennes pour 100g.
      </p>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un aliment…"
        className="input-field"
      />

      {groups.length === 0 && <p className="text-center text-slate-400">Aucun résultat.</p>}

      {groups.map(({ category, items }) => (
        <section key={category} className="space-y-2">
          <h2 className="text-sm font-medium text-slate-400">{category}</h2>
          <div className="grid grid-cols-2 gap-2">
            {items.map(({ product }) => (
              <Link key={product.barcode} href={`/product?barcode=${product.barcode}`} className="card">
                <p className="truncate text-sm font-medium text-slate-200">{product.name}</p>
                <p className="text-xs text-slate-500">{Math.round(product.nutrients.energyKcal ?? 0)} kcal /100g</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
