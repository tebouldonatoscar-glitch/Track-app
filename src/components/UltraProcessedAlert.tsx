import { IconWarning } from "@/components/icons";

export default function UltraProcessedAlert() {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-xl border border-red-700 bg-red-950/60 p-3 text-sm text-red-200"
    >
      <IconWarning className="h-5 w-5 flex-shrink-0" aria-hidden />
      <p>
        <strong>Produit ultra-transformé (NOVA 4).</strong> Consommation à limiter pour une
        alimentation équilibrée.
      </p>
    </div>
  );
}
