import type { HomemadeScore } from "@/lib/types/product";

const LABEL_TEXT: Record<HomemadeScore["label"], string> = {
  excellent: "Excellent",
  bon: "Bon",
  moyen: "Moyen",
  mediocre: "Médiocre",
  mauvais: "Mauvais",
};

const LABEL_COLOR: Record<HomemadeScore["label"], string> = {
  excellent: "text-green-400",
  bon: "text-lime-400",
  moyen: "text-yellow-400",
  mediocre: "text-orange-400",
  mauvais: "text-red-400",
};

const BAR_COLOR: Record<HomemadeScore["label"], string> = {
  excellent: "bg-green-500",
  bon: "bg-lime-500",
  moyen: "bg-yellow-500",
  mediocre: "bg-orange-500",
  mauvais: "bg-red-500",
};

export default function HomemadeScoreCard({ score }: { score: HomemadeScore }) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Score maison</h3>
        <span className={`text-lg font-bold ${LABEL_COLOR[score.label]}`}>
          {score.score}/100 · {LABEL_TEXT[score.label]}
        </span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${BAR_COLOR[score.label]}`}
          style={{ width: `${score.score}%` }}
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
