"use client";

import { useId } from "react";

interface NumFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function NumField({ label, value, onChange }: NumFieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-slate-400">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  );
}
