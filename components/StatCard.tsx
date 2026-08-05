interface Props {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  sublabel?: string;
}

const TONE_CLASS: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "text-gray-100",
  positive: "text-rise",
  negative: "text-fall",
};

export default function StatCard({ label, value, tone = "neutral", sublabel }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${TONE_CLASS[tone]}`}>{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-gray-500">{sublabel}</div>}
    </div>
  );
}
