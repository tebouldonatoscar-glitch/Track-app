"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FavoriteProduct } from "@/lib/types/product";
import { getFavorites, removeFavorite } from "@/lib/storage/db";
import NutriScoreBadge from "@/components/NutriScoreBadge";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (barcode: string) => {
    await removeFavorite(barcode);
    setFavorites((prev) => prev.filter((f) => f.barcode !== barcode));
  };

  return (
    <main className="space-y-4 p-4">
      <Link href="/" className="text-slate-400">
        ← Accueil
      </Link>
      <h1 className="text-xl font-bold text-slate-100">Favoris</h1>

      {loading && <p className="text-slate-400">Chargement…</p>}

      {!loading && favorites.length === 0 && (
        <div className="card text-center text-slate-400">
          Aucun favori pour le moment. Ajoutez-en depuis la fiche produit.
        </div>
      )}

      <div className="space-y-2">
        {favorites.map((fav) => (
          <div key={fav.barcode} className="card flex items-center gap-3">
            {fav.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fav.imageUrl} alt={fav.productName} className="h-12 w-12 rounded-lg bg-white object-contain" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700">🍽️</div>
            )}
            <div className="min-w-0 flex-1">
              <Link href={`/product?barcode=${fav.barcode}`} className="block truncate font-medium text-slate-200">
                {fav.productName}
              </Link>
              {fav.brand && <p className="truncate text-xs text-slate-500">{fav.brand}</p>}
            </div>
            <NutriScoreBadge grade={fav.nutriScore} size="sm" />
            <button onClick={() => handleRemove(fav.barcode)} aria-label="Retirer des favoris" className="text-xl">
              ⭐
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
