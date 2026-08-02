"use client";

import { useEffect, useState } from "react";

export default function OnlineStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white">
      Hors ligne — le scan de nouveaux produits nécessite une connexion internet.
    </div>
  );
}
