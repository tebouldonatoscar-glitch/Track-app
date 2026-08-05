import type { DayTotal } from "@/lib/macros/trends";

interface TrendsChartProps {
  days: DayTotal[];
  goalKcal: number;
}

const PLOT_HEIGHT = 100;
const CHART_HEIGHT = 140;

export default function TrendsChart({ days, goalKcal }: TrendsChartProps) {
  const dense = days.length > 14;
  const slotWidth = dense ? 12 : 36;
  const gap = dense ? 2 : 6;
  const barWidth = slotWidth - gap;
  const chartWidth = Math.max(days.length * slotWidth, 1);
  const maxValue = Math.max(goalKcal, ...days.map((d) => d.macros.energyKcal), 1) * 1.1;
  const goalY = PLOT_HEIGHT - (goalKcal / maxValue) * PLOT_HEIGHT;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        width={chartWidth}
        height={CHART_HEIGHT}
        className="min-w-full"
        role="img"
        aria-label="Calories consommées par jour"
      >
        {goalKcal > 0 && (
          <line x1={0} x2={chartWidth} y1={goalY} y2={goalY} stroke="#f0b75b" strokeDasharray="4 3" strokeWidth={1} />
        )}
        {days.map((day, i) => {
          const barHeight = (day.macros.energyKcal / maxValue) * PLOT_HEIGHT;
          const over = goalKcal > 0 && day.macros.energyKcal > goalKcal;
          return (
            <g key={day.dateKey}>
              <rect
                x={i * slotWidth + gap / 2}
                y={PLOT_HEIGHT - barHeight}
                width={barWidth}
                height={day.macros.energyKcal > 0 ? Math.max(barHeight, 2) : 0}
                rx={2}
                fill={over ? "#f0b75b" : "#3DB868"}
              />
              <text
                x={i * slotWidth + slotWidth / 2}
                y={PLOT_HEIGHT + 14}
                textAnchor="middle"
                fontSize={dense ? 6 : 9}
                fill="#9A9A9E"
              >
                {dense ? (i % 5 === 0 ? day.label : "") : day.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
