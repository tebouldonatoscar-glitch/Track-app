"use client";

import { Suspense, useEffect, useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types/product";
import { scanNutritionLabelWithGemini } from "@/lib/ai/geminiLabelScan";
import { extractGeminiErrorDetail } from "@/lib/ai/extractErrorDetail";
import { resizeImageFileToBase64 } from "@/lib/ai/resizeImage";
import {
  getStoredGeminiApiKey,
  getStoredGeminiModel,
  setStoredGeminiApiKey,
  setStoredGeminiModel,
} from "@/lib/storage/aiSettings";
import { isValidBarcode } from "@/lib/api/openFoodFacts";
import { saveManualProduct } from "@/lib/storage/db";
import { generateManualProductId } from "@/lib/storage/generateId";
import { parseNumberField } from "@/lib/utils/parseNumberField";
import NumField from "@/components/NumField";
import PhotoCapture from "@/components/PhotoCapture";
import type { GeminiEstimateErrorCode } from "@/lib/ai/types";

const ERROR_MESSAGES: Record<GeminiEstimateErrorCode, string> = {
  missing_api_key: "Renseigne ta clé API Gemini ci-dessus avant de scanner.",
  invalid_key: "Clé API invalide ou refusée. Vérifie-la sur aistudio.google.com.",
  network_error: "Pas de connexion internet, ou service injoignable.",
  rate_limited: "Limite d'utilisation gratuite atteinte pour le moment. Réessaie dans quelques minutes.",
  invalid_response: "Réponse de l'IA illisible. Réessaie avec une photo plus nette de l'étiquette.",
  api_error: "Erreur du service IA. Réessaie plus tard.",
};

interface NutrientFieldsState {
  energy: string;
  proteins: string;
  carbs: string;
  sugars: string;
  fat: string;
  saturatedFat: string;
  fiber: string;
  salt: string;
}

const EMPTY_FIELDS: NutrientFieldsState = {
  energy: "",
  proteins: "",
  carbs: "",
  sugars: "",
  fat: "",
  saturatedFat: "",
  fiber: "",
  salt: "",
};

function AddLabelForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillBarcode = searchParams.get("barcode") ?? "";

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [previewLoadFailed, setPreviewLoadFailed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [confidenceNote, setConfidenceNote] = useState<string | null>(null);

  const [barcode, setBarcode] = useState(prefillBarcode);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<NutrientFieldsState>(EMPTY_FIELDS);
  const [hasScanned, setHasScanned] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const apiKeyId = useId();
  const modelId = useId();
  const barcodeId = useId();
  const nameId = useId();

  useEffect(() => {
    const storedKey = getStoredGeminiApiKey();
    setApiKey(storedKey);
    setModel(getStoredGeminiModel());
    setShowSettings(storedKey === "");
  }, []);

  useEffect(() => {
    setPreviewLoadFailed(false);
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

  const handleScan = async () => {
    if (!photoFile) return;
    setScanning(true);
    setScanError(null);
    try {
      const resized = await resizeImageFileToBase64(photoFile, 1400);
      const result = await scanNutritionLabelWithGemini({
        apiKey,
        model: model || getStoredGeminiModel(),
        imageBase64: resized.base64,
        imageMimeType: resized.mimeType,
      });

      if (result.ok) {
        setName(result.scan.productName ?? "");
        setFields({
          energy: String(result.scan.nutrients.energyKcal ?? ""),
          proteins: String(result.scan.nutrients.proteins ?? ""),
          carbs: String(result.scan.nutrients.carbohydrates ?? ""),
          sugars: String(result.scan.nutrients.sugars ?? ""),
          fat: String(result.scan.nutrients.fat ?? ""),
          saturatedFat: String(result.scan.nutrients.saturatedFat ?? ""),
          fiber: String(result.scan.nutrients.fiber ?? ""),
          salt: String(result.scan.nutrients.salt ?? ""),
        });
        setConfidenceNote(result.scan.confidenceNote);
        setHasScanned(true);
      } else {
        const detail = extractGeminiErrorDetail(result.message);
        setScanError(detail ? `${ERROR_MESSAGES[result.error]} (détail Google : ${detail})` : ERROR_MESSAGES[result.error]);
      }
    } catch {
      setScanError("Impossible de traiter la photo. Réessaie avec une autre image.");
    } finally {
      setScanning(false);
    }
  };

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

    const product: Product = {
      barcode: barcode.trim() || generateManualProductId(name),
      name: name.trim(),
      brand: null,
      imageUrl: null,
      nutriScore: "unknown",
      novaGroup: null,
      ingredientsText: null,
      allergens: [],
      additivesCount: 0,
      nutrients: {
        energyKcal: parseNumberField(fields.energy),
        proteins: parseNumberField(fields.proteins),
        carbohydrates: parseNumberField(fields.carbs),
        sugars: parseNumberField(fields.sugars),
        fat: parseNumberField(fields.fat),
        saturatedFat: parseNumberField(fields.saturatedFat),
        fiber: parseNumberField(fields.fiber),
        salt: parseNumberField(fields.salt),
      },
      servingSize: null,
      source: "manual",
      unitLabel: null,
      unitWeightGrams: null,
    };

    await saveManualProduct(product);
    router.push(`/product?barcode=${encodeURIComponent(product.barcode)}`);
  };

  const canScan = apiKey.trim() !== "" && photoFile !== null && !scanning;

  return (
    <main className="space-y-4 p-4 pb-10">
      <Link href="/add" className="text-slate-400">
        ← Ajouter un produit
      </Link>
      <h1 className="text-xl font-bold text-slate-100">Scanner une étiquette (photo)</h1>
      <p className="text-sm text-slate-400">
        Pour un produit dont le code-barres ne scanne pas : prends en photo le tableau de valeurs
        nutritionnelles imprimé sur l&apos;emballage, l&apos;IA en lit les chiffres. Vérifie-les
        avant d&apos;enregistrer, une lecture peut se tromper. Utilise ta propre clé API Gemini
        gratuite (
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
              <input id={modelId} value={model} onChange={(e) => setModel(e.target.value)} className="input-field" />
            </div>
            <button type="button" onClick={handleSaveSettings} className="btn-secondary w-full">
              Enregistrer
            </button>
          </div>
        )}
      </div>

      <div>
        <p className="mb-1 block text-sm text-slate-300">Photo de l&apos;étiquette</p>
        <PhotoCapture
          onCapture={(file) => {
            setPhotoFile(file);
            setHasScanned(false);
            setScanError(null);
          }}
        />
        {photoPreviewUrl && (
          <div className="mt-2 flex items-center gap-3">
            {previewLoadFailed ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-700 text-2xl">🖼️</div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreviewUrl}
                alt="Aperçu de l'étiquette"
                className="h-20 w-20 rounded-xl object-cover"
                onError={() => setPreviewLoadFailed(true)}
              />
            )}
            <button
              type="button"
              onClick={() => {
                setPhotoFile(null);
                setHasScanned(false);
              }}
              className="text-xs text-slate-500 underline"
            >
              Retirer la photo
            </button>
          </div>
        )}
      </div>

      <button type="button" onClick={handleScan} className="btn-primary w-full" disabled={!canScan}>
        {scanning ? "Lecture en cours…" : "Lire l'étiquette avec l'IA"}
      </button>

      {scanError && <p className="text-sm text-red-400">{scanError}</p>}

      {hasScanned && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {confidenceNote && <p className="text-xs italic text-slate-500">{confidenceNote}</p>}

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
            <input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <fieldset className="card space-y-3">
            <legend className="px-1 text-sm font-medium text-slate-300">Valeurs pour 100g / 100ml</legend>
            <p className="px-1 text-xs text-slate-500">Relis-les avec l&apos;emballage sous les yeux avant d&apos;enregistrer.</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Calories (kcal)" value={fields.energy} onChange={(v) => setFields((f) => ({ ...f, energy: v }))} />
              <NumField label="Protéines (g)" value={fields.proteins} onChange={(v) => setFields((f) => ({ ...f, proteins: v }))} />
              <NumField label="Glucides (g)" value={fields.carbs} onChange={(v) => setFields((f) => ({ ...f, carbs: v }))} />
              <NumField label="dont sucres (g)" value={fields.sugars} onChange={(v) => setFields((f) => ({ ...f, sugars: v }))} />
              <NumField label="Lipides (g)" value={fields.fat} onChange={(v) => setFields((f) => ({ ...f, fat: v }))} />
              <NumField
                label="dont saturés (g)"
                value={fields.saturatedFat}
                onChange={(v) => setFields((f) => ({ ...f, saturatedFat: v }))}
              />
              <NumField label="Fibres (g)" value={fields.fiber} onChange={(v) => setFields((f) => ({ ...f, fiber: v }))} />
              <NumField label="Sel (g)" value={fields.salt} onChange={(v) => setFields((f) => ({ ...f, salt: v }))} />
            </div>
          </fieldset>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button type="submit" className="btn-primary w-full">
            Enregistrer le produit
          </button>
        </form>
      )}
    </main>
  );
}

export default function AddLabelPage() {
  return (
    <Suspense fallback={<main className="p-4"><p className="text-slate-400">Chargement…</p></main>}>
      <AddLabelForm />
    </Suspense>
  );
}
