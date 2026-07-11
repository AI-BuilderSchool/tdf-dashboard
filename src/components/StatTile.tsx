export function StatTile({
  value,
  unit,
  label,
}: {
  value: string;
  unit?: string;
  label: string;
}) {
  const isLong = value.length > 8;

  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface px-8 py-10 text-center">
      <div
        className={`font-semibold tracking-tight text-white ${isLong ? "text-2xl sm:text-3xl" : "text-5xl sm:text-6xl"}`}
      >
        {value}
        {unit && <span className="ml-1 text-2xl text-white/50">{unit}</span>}
      </div>
      <div className="text-sm text-white/50">{label}</div>
    </div>
  );
}
