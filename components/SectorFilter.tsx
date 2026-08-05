"use client";

interface Props {
  sectors: string[];
  active: string | null;
  onChange: (sector: string | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function SectorFilter({ sectors, active, onChange, search, onSearchChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search symbol or company…"
        className="w-56 min-w-[180px] rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-100 placeholder:text-gray-500 focus:border-white/30 focus:outline-none"
      />
      <button
        onClick={() => onChange(null)}
        className={`rounded-full border px-3 py-1 text-xs ${
          active === null ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-gray-400 hover:text-gray-200"
        }`}
      >
        All sectors
      </button>
      {sectors.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`rounded-full border px-3 py-1 text-xs ${
            active === s ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-gray-400 hover:text-gray-200"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
