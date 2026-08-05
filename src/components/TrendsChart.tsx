import type { DayTotal } from "@/lib/macros/trends";

interface TrendsChartProps {
  days: DayTotal[];
  goal: number;
  getValue: (day: DayTotal) => number;
  /** "ceiling": exceeding the goal is the bad state (calories). "floor": falling short of the goal is the bad state (protein). */
  mode: "ceiling" | "floor";
  ariaLabel: string;
}

const PLOT_HEIGHT = 100;
const CHART_HEIGHT = 140;
const GOOD_COLOR = "#30D158";
const CEILING_BAD_COLOR = "#FF453A";
const FLOOR_BAD_COLOR = "#FF9F0A";
const GOAL_LINE_COLOR = "#8E8E93";

export default function TrendsChart({ days, goal, getValue, mode, ariaLabel }: TrendsChartProps) {
  const dense = days.length > 14;
  const slotWidth = dense ? 12 : 36;
  const gap = dense ? 2 : 6;
  const barWidth = slotWidth - gap;
  const chartWidth = Math.max(days.length * slotWidth, 1);
  const maxValue = Math.max(goal, ...days.map(getValue), 1) * 1.1;
  const goalY = PLOT_HEIGHT - (goal / maxValue) * PLOT_HEIGHT;
  const badColor = mode === "ceiling" ? CEILING_BAD_COLOR : FLOOR_BAD_COLOR;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        width={chartWidth}
        height={CHART_HEIGHT}
        className="min-w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {goal > 0 && (
          <line x1={0} x2={chartWidth} y1={goalY} y2={goalY} stroke={GOAL_LINE_COLOR} strokeDasharray="4 3" strokeWidth={1} />
        )}
        {days.map((day, i) => {
          const value = getValue(day);
          const barHeight = (value / maxValue) * PLOT_HEIGHT;
          const bad = goal > 0 && (mode === "ceiling" ? value > goal : value < goal && value > 0);
          return (
            <g key={day.dateKey}>
              <rect
                x={i * slotWidth + gap / 2}
                y={PLOT_HEIGHT - barHeight}
                width={barWidth}
                height={value > 0 ? Math.max(barHeight, 2) : 0}
                rx={2}
                fill={bad ? badColor : GOOD_COLOR}
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
