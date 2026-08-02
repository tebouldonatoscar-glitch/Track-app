"use client";

import { Suspense, useId, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { NovaGroup, NutriScoreGrade, Product } from "@/lib/types/product";
import { saveManualProduct } from "@/lib/storage/db";
import { isValidBarcode } from "@/lib/api/openFoodFacts";

function parseNumberField(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function AddProductForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefillBarcode = searchParams.get("barcode") ?? "";

  const [barcode, setBarcode] = useState(prefillBarcode);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [nutriScore, setNutriScore] = useState<NutriScoreGrade>("unknown");
  const [novaGroup, setNovaGroup] = useState<string>("");
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
  const allergensId = useId();
  const ingredientsId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValidBarcode(barcode)) {
      setFormError("Code-barres invalide (8 à 14 chiffres).");
      return;
    }
    if (name.trim() === "") {
      setFormError("Le nom du produit est requis.");
      return;
    }

    const product: Product = {
      barcode: barcode.trim(),
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
      nutrients: {
        energyKcal: parseNumberField(energy),
        proteins: parseNumberField(proteins),
        carbohydrates: parseNumberField(carbs),
        sugars: parseNumberField(sugars),
        fat: parseNumberField(fat),
        saturatedFat: parseNumberField(saturatedFat),
        fiber: parseNumberField(fiber),
        salt: parseNumberField(salt),
      },
      servingSize: null,
      source: "manual",
    };

    await saveManualProduct(product);
    router.push(`/product?barcode=${encodeURIComponent(product.barcode)}`);
  };

  return (
    <main className="space-y-4 p-4 pb-10">
      <Link href="/" className="text-slate-400">
        ← Accueil
      </Link>
      <h1 className="text-xl font-bold text-slate-100">Ajouter un produit manuellement</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={barcodeId} className="mb-1 block text-sm text-slate-300">
            Code-barres *
          </label>
          <input
            id={barcodeId}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="input-field"
            inputMode="numeric"
            required
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

        <fieldset className="card space-y-3">
          <legend className="px-1 text-sm font-medium text-slate-300">Valeurs pour 100g</legend>
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
    </main>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-slate-400">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<main className="p-4"><p className="text-slate-400">Chargement…</p></main>}>
      <AddProductForm />
    </Suspense>
  );
}
