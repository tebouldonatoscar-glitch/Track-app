"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FavoriteProduct } from "@/lib/types/product";
import { getFavorites, removeFavorite } from "@/lib/storage/db";
import NutriScoreBadge from "@/components/NutriScoreBadge";
import PageHeader from "@/components/PageHeader";
import { IconMeal, IconStarFilled } from "@/components/icons";

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
    <main className="pb-4">
      <PageHeader title="Favoris" backHref="/" backLabel="Accueil" />
      <div className="space-y-4 px-4 pt-3">
        {loading && <p className="text-slate-400">Chargement…</p>}

        {!loading && favorites.length === 0 && (
          <div className="card text-center text-slate-400">
            Aucun favori pour le moment. Ajoutez-en depuis la fiche produit.
          </div>
        )}

        {favorites.length > 0 && (
          <div className="list-group">
            {favorites.map((fav) => (
              <div key={fav.barcode} className="list-row">
                {fav.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fav.imageUrl} alt={fav.productName} className="h-[29px] w-[29px] flex-shrink-0 rounded-[8px] bg-white object-contain" />
                ) : (
                  <div className="row-icon">
                    <IconMeal className="h-4 w-4 text-slate-300" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/product?barcode=${fav.barcode}`} className="block truncate text-[15px] font-medium text-slate-100">
                    {fav.productName}
                  </Link>
                  {fav.brand && <p className="truncate text-[12.5px] text-slate-500">{fav.brand}</p>}
                </div>
                <NutriScoreBadge grade={fav.nutriScore} size="sm" />
                <button onClick={() => handleRemove(fav.barcode)} aria-label="Retirer des favoris" className="icon-btn !text-amber-400">
                  <IconStarFilled className="h-5 w-5" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
