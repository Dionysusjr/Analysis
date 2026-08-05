"use client";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

export default function Sparkline({ values, width = 120, height = 32 }: SparklineProps) {
  if (values.length < 2) {
    return <div style={{ width, height }} className="text-xs text-gray-500">collecting…</div>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const firstValue = values[0] ?? 0;
  const lastValue = values[values.length - 1] ?? 0;
  const rising = lastValue >= firstValue;
  const stroke = rising ? "#16a34a" : "#dc2626";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
