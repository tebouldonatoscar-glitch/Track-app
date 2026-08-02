"use client";

import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onError?: (message: string) => void;
}

const SCANNER_ELEMENT_ID = "barcode-scanner-viewport";

export default function BarcodeScanner({ onDetected, onError }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "running" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    hasDetectedRef.current = false;

    async function start() {
      setStatus("starting");
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

        if (cancelled) return;

        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decodedText: string) => {
            if (hasDetectedRef.current) return;
            hasDetectedRef.current = true;
            onDetected(decodedText);
          },
          () => {
            // ignore per-frame decode failures, expected while aiming
          }
        );

        if (!cancelled) setStatus("running");
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.";
        setErrorMessage(message);
        setStatus("error");
        onError?.(message);
      }
    }

    start();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {
            /* scanner may already be stopped */
          });
      }
    };
  }, [onDetected, onError]);

  return (
    <div className="space-y-3">
      <div
        id={SCANNER_ELEMENT_ID}
        className="mx-auto aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black"
      />
      {status === "starting" && (
        <p className="text-center text-sm text-slate-400">Démarrage de la caméra…</p>
      )}
      {status === "running" && (
        <p className="text-center text-sm text-slate-400">
          Visez le code-barres du produit (EAN/UPC)
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-sm text-red-400">
          {errorMessage ?? "Erreur d'accès à la caméra."}
        </p>
      )}
    </div>
  );
}
