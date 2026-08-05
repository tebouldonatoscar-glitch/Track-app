interface CalorieRingProps {
  value: number;
  goal: number;
  size?: number;
}

export default function CalorieRing({ value, goal, size = 104 }: CalorieRingProps) {
  const strokeWidth = 9;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const percent = goal > 0 ? Math.min(1, value / goal) : 0;
  const offset = circumference * (1 - percent);
  const over = goal > 0 && value > goal;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2C2C2E" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={over ? "#F0B75B" : "#3DB868"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold tabular-nums text-slate-100">{Math.round(value)}</span>
        <span className="text-[10px] font-semibold tabular-nums text-slate-500">/ {Math.round(goal)} kcal</span>
      </div>
    </div>
  );
}
