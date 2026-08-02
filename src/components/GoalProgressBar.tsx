interface GoalProgressBarProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
}

export default function GoalProgressBar({ label, value, goal, unit, color }: GoalProgressBarProps) {
  const percent = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  const overGoal = goal > 0 && value > goal;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className={overGoal ? "font-medium text-amber-400" : "text-slate-400"}>
          {Math.round(value)} / {goal} {unit}
        </span>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${overGoal ? "bg-amber-500" : color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
