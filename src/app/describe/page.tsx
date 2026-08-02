"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AiMealEstimate, GeminiEstimateErrorCode } from "@/lib/ai/types";
import { estimateMealWithGemini } from "@/lib/ai/geminiEstimate";
import { resizeImageFileToBase64 } from "@/lib/ai/resizeImage";
import {
  getStoredGeminiApiKey,
  getStoredGeminiModel,
  setStoredGeminiApiKey,
  setStoredGeminiModel,
} from "@/lib/storage/aiSettings";
import { generateManualProductId } from "@/lib/storage/generateId";
import { addHistoryEntry } from "@/lib/storage/db";
import MacroBreakdownCard from "@/components/MacroBreakdownCard";

const ERROR_MESSAGES: Record<GeminiEstimateErrorCode, string> = {
  missing_api_key: "Renseigne ta clé API Gemini ci-dessus avant d'estimer.",
  invalid_key: "Clé API invalide ou refusée. Vérifie-la sur aistudio.google.com.",
  network_error: "Pas de connexion internet, ou service injoignable.",
  rate_limited: "Limite d'utilisation gratuite atteinte pour le moment. Réessaie dans quelques minutes.",
  invalid_response: "Réponse de l'IA illisible. Réessaie, ou reformule ta description.",
  api_error: "Erreur du service IA. Réessaie plus tard.",
};

export default function DescribePage() {
  const router = useRouter();

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<AiMealEstimate | null>(null);
  const [dishName, setDishName] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const apiKeyId = useId();
  const modelId = useId();
  const descriptionId = useId();
  const photoId = useId();
  const dishNameId = useId();

  useEffect(() => {
    const storedKey = getStoredGeminiApiKey();
    setApiKey(storedKey);
    setModel(getStoredGeminiModel());
    setShowSettings(storedKey === "");
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const handleSaveSettings = () => {
    setStoredGeminiApiKey(apiKey);
    setStoredGeminiModel(model);
    setShowSettings(false);
  };

  const handleEstimate = async () => {
    setError(null);
    setEstimate(null);
    setLoading(true);

    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      if (photoFile) {
        const resized = await resizeImageFileToBase64(photoFile);
        imageBase64 = resized.base64;
        imageMimeType = resized.mimeType;
      }

      const result = await estimateMealWithGemini({
        apiKey,
        model: model || getStoredGeminiModel(),
        description,
        imageBase64,
        imageMimeType,
      });

      if (result.ok) {
        setEstimate(result.estimate);
        setDishName(result.estimate.dishName);
      } else {
        setError(ERROR_MESSAGES[result.error]);
      }
    } catch {
      setError("Impossible de traiter la photo. Réessaie avec une autre image.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToHistory = async () => {
    if (!estimate) return;
    await addHistoryEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      barcode: generateManualProductId(dishName),
      productName: dishName.trim() || estimate.dishName,
      brand: "Estimation IA",
      imageUrl: null,
      quantityGrams: estimate.estimatedTotalWeightGrams ?? 0,
      macros: estimate.macros,
      nutriScore: "unknown",
      novaGroup: null,
      timestamp: Date.now(),
    });
    setSavedMessage("Ajouté à l'historique !");
    setTimeout(() => {
      setSavedMessage(null);
      router.push("/history");
    }, 1200);
  };

  const canEstimate = apiKey.trim() !== "" && (description.trim() !== "" || photoFile !== null) && !loading;

  return (
    <main className="space-y-4 p-4 pb-10">
      <Link href="/" className="text-slate-400">
        ← Accueil
      </Link>
      <h1 className="text-xl font-bold text-slate-100">Décrire un plat (IA)</h1>
      <p className="text-sm text-slate-400">
        Décris ton plat et/ou ajoute une photo, l&apos;IA estime les valeurs nutritionnelles. Utilise
        ta propre clé API Gemini gratuite (
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          aistudio.google.com
        </a>
        ), stockée uniquement dans ton navigateur.
      </p>

      <div className="card space-y-3">
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          className="flex w-full items-center justify-between text-sm text-slate-300"
        >
          <span>Clé API Gemini {apiKey ? "(enregistrée)" : "(non configurée)"}</span>
          <span className="text-slate-500">{showSettings ? "▲" : "▼"}</span>
        </button>
        {showSettings && (
          <div className="space-y-3 pt-1">
            <div>
              <label htmlFor={apiKeyId} className="mb-1 block text-xs text-slate-400">
                Clé API Gemini
              </label>
              <input
                id={apiKeyId}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-field"
                placeholder="AIza…"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor={modelId} className="mb-1 block text-xs text-slate-400">
                Modèle
              </label>
              <input
                id={modelId}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="button" onClick={handleSaveSettings} className="btn-secondary w-full">
              Enregistrer
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor={descriptionId} className="mb-1 block text-sm text-slate-300">
          Description du plat
        </label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input-field"
          placeholder="ex: Un bol de riz avec du poulet grillé et des légumes sautés, environ 350g"
        />
      </div>

      <div>
        <label htmlFor={photoId} className="mb-1 block text-sm text-slate-300">
          Photo (optionnelle)
        </label>
        <input
          id={photoId}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          className="input-field"
        />
        {photoPreviewUrl && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreviewUrl} alt="Aperçu du plat" className="h-20 w-20 rounded-xl object-cover" />
            <button type="button" onClick={() => setPhotoFile(null)} className="text-xs text-slate-500 underline">
              Retirer la photo
            </button>
          </div>
        )}
      </div>

      <button type="button" onClick={handleEstimate} className="btn-primary w-full" disabled={!canEstimate}>
        {loading ? "Estimation en cours…" : "Estimer avec l'IA"}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {estimate && (
        <div className="space-y-4">
          <div className="card space-y-2">
            <label htmlFor={dishNameId} className="mb-1 block text-sm text-slate-300">
              Nom du plat
            </label>
            <input
              id={dishNameId}
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="input-field"
            />
            {estimate.estimatedTotalWeightGrams && (
              <p className="text-xs text-slate-500">Poids total estimé : ≈ {Math.round(estimate.estimatedTotalWeightGrams)} g</p>
            )}
            {estimate.confidenceNote && (
              <p className="text-xs italic text-slate-500">{estimate.confidenceNote}</p>
            )}
          </div>

          <MacroBreakdownCard macros={estimate.macros} />

          <p className="text-center text-xs text-slate-500">
            Estimation par IA, à prendre avec précaution — pas aussi fiable qu&apos;un scan de code-barres.
          </p>

          <button type="button" onClick={handleAddToHistory} className="btn-primary w-full">
            Ajouter à l&apos;historique
          </button>
          {savedMessage && <p className="text-center text-sm text-green-400">{savedMessage}</p>}
        </div>
      )}
    </main>
  );
}
