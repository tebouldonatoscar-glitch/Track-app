"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types/product";
import { saveManualProduct } from "@/lib/storage/db";
import { generateManualProductId } from "@/lib/storage/generateId";
import { convertPerUnitToPer100g } from "@/lib/macros/calculate";
import { parseNumberField } from "@/lib/utils/parseNumberField";
import PageHeader from "@/components/PageHeader";

const VOLUME_PRESETS = [
  { label: "Canette (33cl)", ml: 330 },
  { label: "Bouteille (50cl)", ml: 500 },
  { label: "Bouteille (1L)", ml: 1000 },
];

export default function AddDrinkPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [volumeMl, setVolumeMl] = useState(330);
  const [calories, setCalories] = useState("");
  const [sugars, setSugars] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const nameId = useId();
  const volumeId = useId();
  const caloriesId = useId();
  const sugarsId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (name.trim() === "") {
      setFormError("Le nom de la boisson est requis.");
      return;
    }
    if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
      setFormError("Indiquez un volume valide (en ml).");
      return;
    }
    const parsedCalories = parseNumberField(calories);
    if (parsedCalories === null || parsedCalories < 0) {
      setFormError("Indiquez les calories inscrites sur l'étiquette pour ce volume.");
      return;
    }

    const parsedSugars = parseNumberField(sugars);

    const product: Product = {
      barcode: generateManualProductId(name),
      name: name.trim(),
      brand: null,
      imageUrl: null,
      nutriScore: "unknown",
      novaGroup: null,
      ingredientsText: null,
      allergens: [],
      additivesCount: 0,
      nutrients: {
        energyKcal: convertPerUnitToPer100g(parsedCalories, volumeMl),
        proteins: null,
        // Sugars are a subset of carbs; without a separate carbs figure on the label,
        // using the sugar value as a floor avoids showing "0g glucides / 35g dont sucres".
        carbohydrates: convertPerUnitToPer100g(parsedSugars, volumeMl),
        sugars: convertPerUnitToPer100g(parsedSugars, volumeMl),
        fat: null,
        saturatedFat: null,
        fiber: null,
        salt: null,
      },
      servingSize: null,
      source: "manual",
      unitLabel: "bouteille",
      unitWeightGrams: volumeMl,
    };

    await saveManualProduct(product);
    router.push(`/product?barcode=${encodeURIComponent(product.barcode)}`);
  };

  return (
    <main className="pb-4">
      <PageHeader title="Ajouter une boisson" backHref="/foods" backLabel="Aliments courants" />
      <div className="space-y-4 px-4 pt-3">
        <p className="text-sm text-slate-400">
          Pour un soda, jus ou autre boisson dont les calories sur l&apos;étiquette diffèrent des
          valeurs moyennes : indiquez juste le volume et les calories inscrites, sans avoir besoin du
          détail des protéines/glucides/lipides.
        </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={nameId} className="mb-1 block text-sm text-slate-300">
            Nom de la boisson *
          </label>
          <input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="ex: Coca-Cola canette"
            required
          />
        </div>

        <div>
          <label htmlFor={volumeId} className="mb-1 block text-sm text-slate-300">
            Volume (ml)
          </label>
          <input
            id={volumeId}
            type="number"
            inputMode="decimal"
            min={1}
            value={volumeMl}
            onChange={(e) => setVolumeMl(e.target.valueAsNumber)}
            className="input-field"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {VOLUME_PRESETS.map((preset) => (
              <button
                key={preset.ml}
                type="button"
                onClick={() => setVolumeMl(preset.ml)}
                className={`rounded-full px-3 py-1 text-sm ${
                  volumeMl === preset.ml ? "bg-green-600 text-black" : "bg-slate-700 text-slate-300"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor={caloriesId} className="mb-1 block text-sm text-slate-300">
            Calories inscrites sur l&apos;étiquette (pour ce volume) *
          </label>
          <input
            id={caloriesId}
            type="number"
            inputMode="decimal"
            min={0}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="input-field"
            placeholder="ex: 139"
            required
          />
        </div>

        <div>
          <label htmlFor={sugarsId} className="mb-1 block text-sm text-slate-300">
            Sucres inscrits sur l&apos;étiquette (g, optionnel)
          </label>
          <input
            id={sugarsId}
            type="number"
            inputMode="decimal"
            min={0}
            value={sugars}
            onChange={(e) => setSugars(e.target.value)}
            className="input-field"
            placeholder="ex: 35"
          />
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button type="submit" className="btn-primary w-full">
          Enregistrer la boisson
        </button>
      </form>
      </div>
    </main>
  );
}
