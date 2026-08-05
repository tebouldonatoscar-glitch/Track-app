"use client";

import { useState } from "react";
import { roundTo } from "@/lib/utils/round";

interface QuantityInputProps {
  value: number; // always the resolved quantity in grams
  onChange: (value: number) => void;
  servingSize?: string | null;
  onUseServing?: () => void;
  unitLabel?: string | null;
  unitWeightGrams?: number | null;
}

const GRAM_PRESETS = [50, 100, 150, 250];
const UNIT_PRESETS = [1, 2, 3, 6, 12];

export default function QuantityInput({
  value,
  onChange,
  servingSize,
  onUseServing,
  unitLabel,
  unitWeightGrams,
}: QuantityInputProps) {
  const hasUnitInfo = Boolean(unitLabel) && Boolean(unitWeightGrams) && (unitWeightGrams as number) > 0;
  const [mode, setMode] = useState<"grams" | "units">(hasUnitInfo ? "units" : "grams");
  const [unitCount, setUnitCount] = useState<number>(() =>
    hasUnitInfo ? roundTo(value / (unitWeightGrams as number), 1) : 1
  );

  const handleUnitCountChange = (count: number) => {
    setUnitCount(count);
    if (unitWeightGrams) onChange(count * unitWeightGrams);
  };

  if (hasUnitInfo && mode === "units") {
    const gramsEquivalent = Number.isFinite(unitCount) ? Math.round(unitCount * (unitWeightGrams as number)) : 0;

    return (
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="quantity-units" className="block text-sm font-medium text-slate-300">
            Quantité ({unitLabel}s)
          </label>
          <button type="button" onClick={() => setMode("grams")} className="text-xs text-slate-500 underline">
            Saisir en grammes
          </button>
        </div>
        <input
          id="quantity-units"
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          value={Number.isFinite(unitCount) ? unitCount : ""}
          onChange={(e) => handleUnitCountChange(e.target.valueAsNumber)}
          className="input-field"
          placeholder="ex: 2"
        />
        <p className="text-xs text-slate-500">≈ {gramsEquivalent} g</p>
        <div className="flex flex-wrap gap-2">
          {UNIT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleUnitCountChange(preset)}
              className={`rounded-full px-3 py-1 text-sm ${
                unitCount === preset ? "bg-green-600 text-black" : "bg-slate-700 text-slate-300"
              }`}
            >
              {preset} {unitLabel}
              {preset > 1 ? "s" : ""}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="quantity" className="block text-sm font-medium text-slate-300">
          Quantité (grammes)
        </label>
        {hasUnitInfo && (
          <button type="button" onClick={() => setMode("units")} className="text-xs text-slate-500 underline">
            Saisir en {unitLabel}s
          </button>
        )}
      </div>
      <input
        id="quantity"
        type="number"
        inputMode="decimal"
        min={0}
        max={5000}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="input-field"
        placeholder="ex: 100"
      />
      <div className="flex flex-wrap gap-2">
        {GRAM_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-full px-3 py-1 text-sm ${
              value === preset ? "bg-green-600 text-black" : "bg-slate-700 text-slate-300"
            }`}
          >
            {preset}g
          </button>
        ))}
        {servingSize && onUseServing && (
          <button
            type="button"
            onClick={onUseServing}
            className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300"
          >
            1 portion ({servingSize})
          </button>
        )}
      </div>
    </div>
  );
}
