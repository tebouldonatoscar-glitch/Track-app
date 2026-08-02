"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { isValidBarcode } from "@/lib/api/openFoodFacts";

const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), { ssr: false });

export default function ScanPage() {
  const router = useRouter();
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleDetected = useCallback(
    (barcode: string) => {
      router.push(`/product?barcode=${encodeURIComponent(barcode)}`);
    },
    [router]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidBarcode(manualBarcode)) {
      router.push(`/product?barcode=${encodeURIComponent(manualBarcode.trim())}`);
    }
  };

  return (
    <main className="space-y-4 p-4">
      <div className="flex items-center gap-2 pt-2">
        <Link href="/" className="text-slate-400">
          ← Retour
        </Link>
      </div>
      <h1 className="text-xl font-bold text-slate-100">Scanner un produit</h1>

      <BarcodeScanner onDetected={handleDetected} onError={setCameraError} />

      {cameraError && (
        <div className="card space-y-2 text-sm text-slate-300">
          <p>Vous pouvez aussi saisir le code-barres manuellement :</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="ex: 3017620422003"
              className="input-field"
            />
            <button type="submit" className="btn-primary" disabled={!isValidBarcode(manualBarcode)}>
              OK
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
