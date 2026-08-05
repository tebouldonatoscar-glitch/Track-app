"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe, RecipeIngredient } from "@/lib/types/product";
import { BUILTIN_FOODS } from "@/lib/data/genericFoods";
import { normalizeSearchText } from "@/lib/utils/normalize";
import { saveRecipe } from "@/lib/storage/db";
import { generateRecipeId } from "@/lib/storage/generateId";
import { computeRecipePerServingMacros, computeRecipeTotalMacros, recipeNutrientsPer100g } from "@/lib/recipes/calculate";
import { computeMacroScore } from "@/lib/scoring/macroScore";
import { SCORE_LABEL_COLOR } from "@/lib/scoring/scoreDisplay";
import MacroBreakdownCard from "@/components/MacroBreakdownCard";
import PageHeader from "@/components/PageHeader";
import { IconX } from "@/components/icons";

export default function NewRecipePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [servings, setServings] = useState(1);
  const [search, setSearch] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  const searchResults = useMemo(() => {
    const query = normalizeSearchText(search.trim());
    if (!query) return [];
    return BUILTIN_FOODS.filter((f) => normalizeSearchText(f.product.name).includes(query)).slice(0, 8);
  }, [search]);

  const addIngredient = (barcode: string, name: string, defaultGrams: number, nutrients: RecipeIngredient["nutrients"]) => {
    setIngredients((prev) => [...prev, { barcode, name, quantityGrams: defaultGrams, nutrients }]);
    setSearch("");
  };

  const updateQuantity = (index: number, quantityGrams: number) => {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, quantityGrams } : ing)));
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const draftRecipe: Recipe = { id: "draft", name, servings, ingredients, createdAt: Date.now() };
  const totalMacros = computeRecipeTotalMacros(draftRecipe);
  const perServingMacros = computeRecipePerServingMacros(draftRecipe);
  const score = computeMacroScore(recipeNutrientsPer100g(draftRecipe));

  const canSave = name.trim().length > 0 && ingredients.length > 0 && servings > 0;

  const handleSave = async () => {
    if (!canSave) return;
    const recipe: Recipe = {
      id: generateRecipeId(name),
      name: name.trim(),
      servings,
      ingredients,
      createdAt: Date.now(),
    };
    await saveRecipe(recipe);
    router.push("/recipes");
  };

  return (
    <main className="pb-4">
      <PageHeader title="Nouvelle recette" backHref="/recipes" backLabel="Mes recettes" />
      <div className="space-y-4 px-4 pt-3">
      <div className="card space-y-3">
        <div>
          <label htmlFor="recipe-name" className="mb-1 block text-sm font-medium text-slate-300">
            Nom de la recette
          </label>
          <input
            id="recipe-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Poulet-riz maison"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="recipe-servings" className="mb-1 block text-sm font-medium text-slate-300">
            Nombre de portions
          </label>
          <input
            id="recipe-servings"
            type="number"
            inputMode="decimal"
            min={1}
            step={0.5}
            value={servings}
            onChange={(e) => setServings(e.target.valueAsNumber)}
            className="input-field"
          />
        </div>
      </div>

      <div className="card space-y-3">
        <label htmlFor="ingredient-search" className="block text-sm font-medium text-slate-300">
          Ajouter un ingrédient (aliments courants)
        </label>
        <input
          id="ingredient-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un aliment…"
          className="input-field"
        />
        {searchResults.length > 0 && (
          <div className="space-y-1">
            {searchResults.map(({ product }) => (
              <button
                key={product.barcode}
                type="button"
                onClick={() =>
                  addIngredient(product.barcode, product.name, product.unitWeightGrams ?? 100, product.nutrients)
                }
                className="block w-full rounded-lg bg-slate-700/60 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
              >
                {product.name}{" "}
                <span className="text-slate-500">· {Math.round(product.nutrients.energyKcal ?? 0)} kcal/100g</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="card space-y-3">
          <h2 className="text-sm font-medium text-slate-400">Ingrédients</h2>
          {ingredients.map((ingredient, index) => (
            <div key={`${ingredient.barcode}-${index}`} className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm text-slate-200">{ingredient.name}</p>
              <input
                type="number"
                inputMode="decimal"
                min={1}
                max={5000}
                value={ingredient.quantityGrams}
                onChange={(e) => updateQuantity(index, e.target.valueAsNumber)}
                className="input-field w-20 py-1 text-center"
              />
              <span className="text-xs text-slate-500">g</span>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                aria-label={`Retirer ${ingredient.name}`}
                className="icon-btn !h-6 !w-6 hover:!text-red-400"
              >
                <IconX className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {ingredients.length > 0 && (
        <>
          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200">Score nutritionnel</h2>
              <span className={`text-lg font-bold ${SCORE_LABEL_COLOR[score.label]}`}>{score.score}/100</span>
            </div>
            <p className="text-xs text-slate-500">
              Par portion : {perServingMacros.energyKcal} kcal · {perServingMacros.proteins}g protéines ·{" "}
              {perServingMacros.carbohydrates}g glucides · {perServingMacros.fat}g lipides
            </p>
          </div>
          <MacroBreakdownCard macros={totalMacros} />
        </>
      )}

      <button className="btn-primary w-full" onClick={handleSave} disabled={!canSave}>
        Enregistrer la recette
      </button>
      </div>
    </main>
  );
}
