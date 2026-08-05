import type { HomemadeScore } from "@/lib/types/product";
import { SCORE_BAR_COLOR, SCORE_GLOW_COLOR, SCORE_LABEL_COLOR, SCORE_LABEL_TEXT } from "@/lib/scoring/scoreDisplay";
import { hexToRgba } from "@/lib/color";

export default function HomemadeScoreCard({ score }: { score: HomemadeScore }) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Score maison</h3>
        <span className={`text-lg font-bold ${SCORE_LABEL_COLOR[score.label]}`}>
          {score.score}/100 · {SCORE_LABEL_TEXT[score.label]}
        </span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${SCORE_BAR_COLOR[score.label]}`}
          style={{
            width: `${score.score}%`,
            boxShadow: `0 0 8px 0 ${hexToRgba(SCORE_GLOW_COLOR[score.label], 0.6)}`,
          }}
        />
      </div>
      <ul className="mt-2 space-y-1 text-xs text-slate-400">
        {score.reasons.map((reason, idx) => (
          <li key={idx}>• {reason}</li>
        ))}
      </ul>
    </div>
  );
}
