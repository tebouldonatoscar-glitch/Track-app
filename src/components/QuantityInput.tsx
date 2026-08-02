"use client";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  servingSize?: string | null;
  onUseServing?: () => void;
}

const PRESETS = [50, 100, 150, 250];

export default function QuantityInput({ value, onChange, servingSize, onUseServing }: QuantityInputProps) {
  return (
    <div className="card space-y-3">
      <label htmlFor="quantity" className="block text-sm font-medium text-slate-300">
        Quantité (grammes)
      </label>
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
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-full px-3 py-1 text-sm ${
              value === preset ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300"
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
