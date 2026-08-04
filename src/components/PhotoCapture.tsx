"use client";

import { useEffect, useId, useRef, useState } from "react";

interface PhotoCaptureProps {
  onCapture: (file: File) => void;
}

/**
 * Takes the photo in-page via getUserMedia (same approach as BarcodeScanner)
 * instead of handing off to the OS camera app through <input capture>. On
 * Android, leaving the page to the native camera app lets the OS kill the
 * (memory-constrained) tab/PWA process while the user is away; on return,
 * Chrome silently reloads the page from scratch and the file selection never
 * reaches the app - the app looks like it "forgot" the photo. Picking an
 * existing photo from the gallery doesn't leave the page the same way, so
 * that path still uses a plain file input.
 */
export default function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputId = useId();

  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (!cancelled) {
          setCameraError("Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.");
          setCameraOpen(false);
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" }));
        setCameraOpen(false);
      },
      "image/jpeg",
      0.9
    );
  };

  if (cameraOpen) {
    return (
      <div className="space-y-2">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="aspect-[4/3] w-full rounded-xl bg-black object-cover"
        />
        <div className="flex gap-2">
          <button type="button" onClick={handleCapture} className="btn-primary flex-1">
            Capturer
          </button>
          <button type="button" onClick={() => setCameraOpen(false)} className="btn-secondary flex-1">
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setCameraError(null);
            setCameraOpen(true);
          }}
          className="btn-secondary flex-1"
        >
          📷 Prendre une photo
        </button>
        <label htmlFor={fileInputId} className="btn-secondary flex-1 cursor-pointer text-center">
          Depuis la galerie
        </label>
        <input
          id={fileInputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onCapture(file);
            e.target.value = "";
          }}
        />
      </div>
      {cameraError && <p className="text-xs text-red-400">{cameraError}</p>}
    </div>
  );
}
