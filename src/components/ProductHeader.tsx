import type { Product } from "@/lib/types/product";
import NutriScoreBadge from "@/components/NutriScoreBadge";
import NovaBadge from "@/components/NovaBadge";
import { IconMeal } from "@/components/icons";

export default function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="card space-y-3">
      <div className="flex items-start gap-3">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-20 w-20 flex-shrink-0 rounded-xl bg-white object-contain"
          />
        ) : (
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700">
            <IconMeal className="h-8 w-8 text-slate-400" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-slate-100">{product.name}</h2>
          {product.brand && <p className="truncate text-sm text-slate-400">{product.brand}</p>}
          <p className="mt-1 text-xs text-slate-500">Code-barres: {product.barcode}</p>
        </div>
        <NutriScoreBadge grade={product.nutriScore} size="lg" />
      </div>
      <div className="flex flex-wrap gap-2">
        <NovaBadge group={product.novaGroup} />
        {product.allergens.length > 0 && (
          <span className="rounded-full bg-amber-900/60 px-3 py-1 text-xs font-medium text-amber-300">
            Allergènes: {product.allergens.join(", ")}
          </span>
        )}
      </div>
      {product.ingredientsText && (
        <details className="text-sm text-slate-400">
          <summary className="cursor-pointer text-slate-300">Ingrédients</summary>
          <p className="mt-1">{product.ingredientsText}</p>
        </details>
      )}
    </div>
  );
}
