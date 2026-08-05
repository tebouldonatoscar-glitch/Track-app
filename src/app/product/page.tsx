"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types/product";
import { fetchProductByBarcode, type FetchProductError } from "@/lib/api/openFoodFacts";
import { calculateMacrosForQuantity, hasCompleteNutrientData, isValidQuantity } from "@/lib/macros/calculate";
import { computeHomemadeScore } from "@/lib/scoring/homemadeScore";
import { findBuiltinFood } from "@/lib/data/genericFoods";
import {
  addFavorite,
  addHistoryEntry,
  getManualProduct,
  isFavorite,
  removeFavorite,
} from "@/lib/storage/db";
import ProductHeader from "@/components/ProductHeader";
import QuantityInput from "@/components/QuantityInput";
import MacroBreakdownCard from "@/components/MacroBreakdownCard";
import HomemadeScoreCard from "@/components/HomemadeScoreCard";
import UltraProcessedAlert from "@/components/UltraProcessedAlert";
import PageHeader from "@/components/PageHeader";
import { IconCamera, IconStar, IconStarFilled } from "@/components/icons";

const ERROR_MESSAGES: Record<FetchProductError, string> = {
  not_found: "Produit introuvable dans Open Food Facts.",
  network_error: "Pas de connexion internet. Vérifiez votre réseau et réessayez.",
  invalid_barcode: "Code-barres invalide.",
  unknown_error: "Une erreur inattendue est survenue.",
};

function ProductPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const barcode = searchParams.get("barcode") ?? "";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchProductError | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [favorite, setFavorite] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setProduct(null);

      if (!barcode) {
        setError("invalid_barcode");
        setLoading(false);
        return;
      }

      const builtin = findBuiltinFood(barcode);
      if (builtin) {
        if (!cancelled) {
          setProduct(builtin);
          if (builtin.unitWeightGrams) setQuantity(builtin.unitWeightGrams);
          setLoading(false);
        }
        return;
      }

      const manual = await getManualProduct(barcode);
      if (manual) {
        if (!cancelled) {
          setProduct(manual);
          if (manual.unitWeightGrams) setQuantity(manual.unitWeightGrams);
          setLoading(false);
        }
        return;
      }

      const result = await fetchProductByBarcode(barcode);
      if (cancelled) return;

      if (result.ok) {
        setProduct(result.product);
        if (result.product.unitWeightGrams) setQuantity(result.product.unitWeightGrams);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [barcode]);

  useEffect(() => {
    if (!product) return;
    isFavorite(product.barcode).then(setFavorite);
  }, [product]);

  const toggleFavorite = useCallback(async () => {
    if (!product) return;
    if (favorite) {
      await removeFavorite(product.barcode);
      setFavorite(false);
    } else {
      await addFavorite({
        barcode: product.barcode,
        productName: product.name,
        brand: product.brand,
        imageUrl: product.imageUrl,
        nutriScore: product.nutriScore,
        novaGroup: product.novaGroup,
        addedAt: Date.now(),
      });
      setFavorite(true);
    }
  }, [product, favorite]);

  const handleAddToHistory = useCallback(async () => {
    if (!product || !isValidQuantity(quantity)) return;
    const macros = calculateMacrosForQuantity(product.nutrients, quantity);
    await addHistoryEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      barcode: product.barcode,
      productName: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      quantityGrams: quantity,
      macros,
      nutriScore: product.nutriScore,
      novaGroup: product.novaGroup,
      timestamp: Date.now(),
    });
    setSavedMessage("Ajouté à l'historique !");
    setTimeout(() => setSavedMessage(null), 2500);
  }, [product, quantity]);

  if (loading) {
    return (
      <main className="p-4">
        <p className="text-center text-slate-400">Chargement du produit…</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main>
        <PageHeader backHref="/scan" backLabel="Retour au scan" />
        <div className="space-y-4 px-4 pt-3">
          <div className="card space-y-3 text-center">
            <p className="text-slate-300">{ERROR_MESSAGES[error ?? "unknown_error"]}</p>
            {error === "not_found" && (
              <>
                <Link href={`/add?barcode=${encodeURIComponent(barcode)}`} className="btn-primary block">
                  Ajouter ce produit manuellement
                </Link>
                <Link href={`/add/label?barcode=${encodeURIComponent(barcode)}`} className="btn-secondary block">
                  <IconCamera className="h-[18px] w-[18px]" aria-hidden />
                  Photographier l&apos;étiquette (IA)
                </Link>
              </>
            )}
            {error === "network_error" && (
              <button className="btn-secondary" onClick={() => router.refresh()}>
                Réessayer
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const macros = calculateMacrosForQuantity(product.nutrients, quantity);
  const homemadeScore = computeHomemadeScore(
    product.nutriScore,
    product.novaGroup,
    product.nutrients,
    product.additivesCount
  );
  const dataComplete = hasCompleteNutrientData(product.nutrients);
  const validQuantity = isValidQuantity(quantity);

  return (
    <main className="pb-4">
      <PageHeader
        backHref="/"
        backLabel="Accueil"
        action={
          <button onClick={toggleFavorite} className="icon-btn !text-amber-400" aria-label="Basculer favori">
            {favorite ? <IconStarFilled className="h-6 w-6" aria-hidden /> : <IconStar className="h-6 w-6" aria-hidden />}
          </button>
        }
      />

      <div className="space-y-4 px-4 pt-3">
        <ProductHeader product={product} />

        {product.novaGroup === 4 && <UltraProcessedAlert />}

        {!dataComplete && (
          <div className="rounded-xl border border-amber-700 bg-amber-950/50 p-3 text-sm text-amber-300">
            Certaines valeurs nutritionnelles sont manquantes pour ce produit. Les calculs ci-dessous
            peuvent être incomplets.
          </div>
        )}

        <QuantityInput
          value={quantity}
          onChange={setQuantity}
          servingSize={product.servingSize}
          onUseServing={() => {
            const parsed = parseFloat(product.servingSize ?? "");
            if (Number.isFinite(parsed)) setQuantity(parsed);
          }}
          unitLabel={product.unitLabel}
          unitWeightGrams={product.unitWeightGrams}
        />

        {!validQuantity && (
          <p className="text-sm text-red-400">Veuillez saisir une quantité valide (entre 1 et 5000g).</p>
        )}

        <MacroBreakdownCard macros={macros} />
        <HomemadeScoreCard score={homemadeScore} />

        <button className="btn-primary w-full" onClick={handleAddToHistory} disabled={!validQuantity}>
          Ajouter à l&apos;historique
        </button>
        {savedMessage && <p className="text-center text-sm text-green-400">{savedMessage}</p>}
      </div>
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<main className="p-4"><p className="text-center text-slate-400">Chargement…</p></main>}>
      <ProductPageContent />
    </Suspense>
  );
}
