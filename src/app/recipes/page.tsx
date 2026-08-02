"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Recipe } from "@/lib/types/product";
import { addHistoryEntry, deleteRecipe, getAllRecipes } from "@/lib/storage/db";
import {
  computeRecipeMacrosForServings,
  computeRecipePerServingMacros,
  recipeNutrientsPer100g,
  recipeTotalWeightGrams,
} from "@/lib/recipes/calculate";
import { computeMacroScore } from "@/lib/scoring/macroScore";
import { SCORE_LABEL_COLOR } from "@/lib/scoring/scoreDisplay";

function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete: (id: string) => void }) {
  const [servingsToLog, setServingsToLog] = useState(1);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const perServing = useMemo(() => computeRecipePerServingMacros(recipe), [recipe]);
  const score = useMemo(() => computeMacroScore(recipeNutrientsPer100g(recipe)), [recipe]);

  const handleLog = async () => {
    if (!Number.isFinite(servingsToLog) || servingsToLog <= 0) return;
    const macros = computeRecipeMacrosForServings(recipe, servingsToLog);
    const totalWeight = recipeTotalWeightGrams(recipe);
    const quantityGrams = recipe.servings > 0 ? Math.round((totalWeight * servingsToLog) / recipe.servings) : 0;
    await addHistoryEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      barcode: recipe.id,
      productName: `${recipe.name}${servingsToLog !== 1 ? ` (${servingsToLog} portions)` : ""}`,
      brand: null,
      imageUrl: null,
      quantityGrams,
      macros,
      nutriScore: "unknown",
      novaGroup: null,
      timestamp: Date.now(),
    });
    setSavedMessage("Ajouté à l'historique !");
    setTimeout(() => setSavedMessage(null), 2500);
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-200">{recipe.name}</p>
          <p className="text-xs text-slate-500">
            {recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? "s" : ""} ·{" "}
            {recipe.servings} portion{recipe.servings > 1 ? "s" : ""} · {perServing.energyKcal} kcal/portion
          </p>
        </div>
        <span className={`shrink-0 text-sm font-bold ${SCORE_LABEL_COLOR[score.label]}`}>{score.score}/100</span>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={`servings-${recipe.id}`} className="text-sm text-slate-400">
          Portions consommées
        </label>
        <input
          id={`servings-${recipe.id}`}
          type="number"
          inputMode="decimal"
          min={0.5}
          step={0.5}
          value={servingsToLog}
          onChange={(e) => setServingsToLog(e.target.valueAsNumber)}
          className="input-field w-20 py-1 text-center"
        />
      </div>

      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={handleLog}>
          Ajouter à l&apos;historique
        </button>
        <button
          onClick={() => onDelete(recipe.id)}
          aria-label="Supprimer la recette"
          className="rounded-xl bg-slate-700 px-3 text-slate-400 hover:text-red-400"
        >
          ✕
        </button>
      </div>
      {savedMessage && <p className="text-center text-sm text-green-400">{savedMessage}</p>}
    </div>
  );
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRecipes()
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await deleteRecipe(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <main className="space-y-4 p-4">
      <div className="flex items-center justify-between pt-2">
        <Link href="/" className="text-slate-400">
          ← Accueil
        </Link>
        <Link href="/recipes/new" className="text-sm text-green-400 underline">
          + Créer une recette
        </Link>
      </div>
      <h1 className="text-xl font-bold text-slate-100">Mes recettes</h1>
      <p className="text-sm text-slate-400">
        Combinez plusieurs aliments en un plat, avec un score et des macros calculés sur l&apos;ensemble.
      </p>

      {loading && <p className="text-slate-400">Chargement…</p>}

      {!loading && recipes.length === 0 && (
        <div className="card text-center text-slate-400">
          Aucune recette pour le moment.
          <div className="mt-3">
            <Link href="/recipes/new" className="btn-primary">
              Créer ma première recette
            </Link>
          </div>
        </div>
      )}

      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
      ))}
    </main>
  );
}
