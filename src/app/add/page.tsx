"use client";

import { Suspense, useId, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { NovaGroup, NutriScoreGrade, Product } from "@/lib/types/product";
import { saveManualProduct } from "@/lib/storage/db";
import { generateManualProductId } from "@/lib/storage/generateId";
import { isValidBarcode } from "@/lib/api/openFoodFacts";
import { convertPerUnitToPer100g } from "@/lib/macros/calculate";
import { parseNumberField } from "@/lib/utils/parseNumberField";
import NumField from "@/components/NumField";
import PageHeader from "@/components/PageHeader";
import { IconCamera } from "@/components/icons";

function AddProductForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefillBarcode = searchParams.get("barcode") ?? "";

  const [barcode, setBarcode] = useState(prefillBarcode);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [nutriScore, setNutriScore] = useState<NutriScoreGrade>("unknown");
  const [novaGroup, setNovaGroup] = useState<string>("");
  const [countedInUnits, setCountedInUnits] = useState(false);
  const [unitLabel, setUnitLabel] = useState("");
  const [unitWeightGrams, setUnitWeightGrams] = useState("");
  const [nutritionPerUnit, setNutritionPerUnit] = useState(false);
  const [energy, setEnergy] = useState("");
  const [proteins, setProteins] = useState("");
  const [carbs, setCarbs] = useState("");
  const [sugars, setSugars] = useState("");
  const [fat, setFat] = useState("");
  const [saturatedFat, setSaturatedFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [salt, setSalt] = useState("");
  const [allergens, setAllergens] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const barcodeId = useId();
  const nameId = useId();
  const brandId = useId();
  const nutriScoreId = useId();
  const novaGroupId = useId();
  const countedInUnitsId = useId();
  const unitLabelId = useId();
  const unitWeightId = useId();
  const nutritionPerUnitId = useId();
  const allergensId = useId();
  const ingredientsId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (barcode.trim() !== "" && !isValidBarcode(barcode)) {
      setFormError("Code-barres invalide (8 à 14 chiffres), ou laissez le champ vide.");
      return;
    }
    if (name.trim() === "") {
      setFormError("Le nom du produit est requis.");
      return;
    }

    let parsedUnitWeight: number | null = null;
    if (countedInUnits) {
      parsedUnitWeight = parseNumberField(unitWeightGrams);
      if (parsedUnitWeight === null || parsedUnitWeight <= 0) {
        setFormError("Indiquez le poids moyen d'une unité (en grammes).");
        return;
      }
      if (unitLabel.trim() === "") {
        setFormError("Indiquez un nom pour l'unité (ex: œuf, tranche).");
        return;
      }
    }

    const useUnitEntry = countedInUnits && nutritionPerUnit && parsedUnitWeight !== null;

    const nutrients = useUnitEntry
      ? {
          energyKcal: convertPerUnitToPer100g(parseNumberField(energy), parsedUnitWeight!),
          proteins: convertPerUnitToPer100g(parseNumberField(proteins), parsedUnitWeight!),
          carbohydrates: convertPerUnitToPer100g(parseNumberField(carbs), parsedUnitWeight!),
          sugars: convertPerUnitToPer100g(parseNumberField(sugars), parsedUnitWeight!),
          fat: convertPerUnitToPer100g(parseNumberField(fat), parsedUnitWeight!),
          saturatedFat: convertPerUnitToPer100g(parseNumberField(saturatedFat), parsedUnitWeight!),
          fiber: convertPerUnitToPer100g(parseNumberField(fiber), parsedUnitWeight!),
          salt: convertPerUnitToPer100g(parseNumberField(salt), parsedUnitWeight!),
        }
      : {
          energyKcal: parseNumberField(energy),
          proteins: parseNumberField(proteins),
          carbohydrates: parseNumberField(carbs),
          sugars: parseNumberField(sugars),
          fat: parseNumberField(fat),
          saturatedFat: parseNumberField(saturatedFat),
          fiber: parseNumberField(fiber),
          salt: parseNumberField(salt),
        };

    const product: Product = {
      barcode: barcode.trim() || generateManualProductId(name),
      name: name.trim(),
      brand: brand.trim() || null,
      imageUrl: null,
      nutriScore,
      novaGroup: (novaGroup ? (Number(novaGroup) as NovaGroup) : null),
      ingredientsText: ingredients.trim() || null,
      allergens: allergens
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      additivesCount: 0,
      nutrients,
      servingSize: null,
      source: "manual",
      unitLabel: countedInUnits ? unitLabel.trim() : null,
      unitWeightGrams: countedInUnits ? parsedUnitWeight : null,
    };

    await saveManualProduct(product);
    router.push(`/product?barcode=${encodeURIComponent(product.barcode)}`);
  };

  return (
    <main className="pb-10">
      <PageHeader title="Ajouter un produit" backHref="/" backLabel="Accueil" />
      <div className="space-y-4 px-4 pt-3">
        <p className="text-sm text-slate-400">
          Pour un produit sans code-barres (œufs, farine, fruits en vrac…), laissez le champ
          code-barres vide.
        </p>
        <Link href="/add/label" className="flex items-center gap-1.5 text-sm text-green-400">
          <IconCamera className="h-4 w-4 flex-shrink-0" aria-hidden />
          Ou prenez en photo l&apos;étiquette nutritionnelle, l&apos;IA lit les chiffres →
        </Link>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={barcodeId} className="mb-1 block text-sm text-slate-300">
            Code-barres (optionnel)
          </label>
          <input
            id={barcodeId}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="input-field"
            inputMode="numeric"
            placeholder="Laissez vide si vous n'en avez pas"
          />
        </div>
        <div>
          <label htmlFor={nameId} className="mb-1 block text-sm text-slate-300">
            Nom du produit *
          </label>
          <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label htmlFor={brandId} className="mb-1 block text-sm text-slate-300">
            Marque
          </label>
          <input id={brandId} value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={nutriScoreId} className="mb-1 block text-sm text-slate-300">
              Nutri-Score
            </label>
            <select
              id={nutriScoreId}
              value={nutriScore}
              onChange={(e) => setNutriScore(e.target.value as NutriScoreGrade)}
              className="input-field"
            >
              <option value="unknown">Inconnu</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
              <option value="e">E</option>
            </select>
          </div>
          <div>
            <label htmlFor={novaGroupId} className="mb-1 block text-sm text-slate-300">
              NOVA
            </label>
            <select id={novaGroupId} value={novaGroup} onChange={(e) => setNovaGroup(e.target.value)} className="input-field">
              <option value="">Inconnu</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>

        <div className="card space-y-3">
          <label htmlFor={countedInUnitsId} className="flex items-center gap-2 text-sm text-slate-300">
            <input
              id={countedInUnitsId}
              type="checkbox"
              checked={countedInUnits}
              onChange={(e) => setCountedInUnits(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800"
            />
            Cet aliment se compte à l&apos;unité (œuf, tranche, gousse…)
          </label>

          {countedInUnits && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label htmlFor={unitLabelId} className="mb-1 block text-xs text-slate-400">
                  Nom de l&apos;unité
                </label>
                <input
                  id={unitLabelId}
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="ex: œuf"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor={unitWeightId} className="mb-1 block text-xs text-slate-400">
                  Poids moyen d&apos;une unité (g)
                </label>
                <input
                  id={unitWeightId}
                  type="number"
                  inputMode="decimal"
                  value={unitWeightGrams}
                  onChange={(e) => setUnitWeightGrams(e.target.value)}
                  placeholder="ex: 53"
                  className="input-field"
                />
              </div>
            </div>
          )}
        </div>

        <fieldset className="card space-y-3">
          <div className="flex items-center justify-between px-1">
            <legend className="text-sm font-medium text-slate-300">
              Valeurs nutritionnelles
            </legend>
            {countedInUnits && (
              <label htmlFor={nutritionPerUnitId} className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  id={nutritionPerUnitId}
                  type="checkbox"
                  checked={nutritionPerUnit}
                  onChange={(e) => setNutritionPerUnit(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800"
                />
                Saisir par unité plutôt que pour 100g
              </label>
            )}
          </div>
          <p className="px-1 text-xs text-slate-500">
            {countedInUnits && nutritionPerUnit
              ? `Valeurs pour 1 ${unitLabel.trim() || "unité"}`
              : "Valeurs pour 100g"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Calories (kcal)" value={energy} onChange={setEnergy} />
            <NumField label="Protéines (g)" value={proteins} onChange={setProteins} />
            <NumField label="Glucides (g)" value={carbs} onChange={setCarbs} />
            <NumField label="dont sucres (g)" value={sugars} onChange={setSugars} />
            <NumField label="Lipides (g)" value={fat} onChange={setFat} />
            <NumField label="dont saturés (g)" value={saturatedFat} onChange={setSaturatedFat} />
            <NumField label="Fibres (g)" value={fiber} onChange={setFiber} />
            <NumField label="Sel (g)" value={salt} onChange={setSalt} />
          </div>
        </fieldset>

        <div>
          <label htmlFor={allergensId} className="mb-1 block text-sm text-slate-300">
            Allergènes (séparés par des virgules)
          </label>
          <input id={allergensId} value={allergens} onChange={(e) => setAllergens(e.target.value)} className="input-field" />
        </div>
        <div>
          <label htmlFor={ingredientsId} className="mb-1 block text-sm text-slate-300">
            Ingrédients
          </label>
          <textarea
            id={ingredientsId}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="input-field"
            rows={3}
          />
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button type="submit" className="btn-primary w-full">
          Enregistrer le produit
        </button>
      </form>
      </div>
    </main>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<main className="p-4"><p className="text-slate-400">Chargement…</p></main>}>
      <AddProductForm />
    </Suspense>
  );
}
