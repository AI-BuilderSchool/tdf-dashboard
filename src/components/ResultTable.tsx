import type { ResultRow } from "@/lib/db";

export function ResultTable({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: ResultRow[];
  emptyLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface">
      <div className="border-b border-white/10 px-6 py-5 sm:px-8">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-white/40 sm:px-8">
          {emptyLabel}
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-white/40">
              <th className="w-14 px-6 py-3 font-medium sm:px-8">#</th>
              <th className="px-3 py-3 font-medium">선수</th>
              <th className="px-6 py-3 text-right font-medium sm:px-8">기록</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={`${row.rank}-${row.rider}-${i}`}
                className="border-t border-white/5"
              >
                <td className="px-6 py-3 font-semibold text-accent sm:px-8">
                  {row.rank}
                </td>
                <td className="px-3 py-3 text-white">
                  <p>{row.rider}</p>
                  {row.team && row.team !== row.rider && (
                    <p className="mt-0.5 text-xs text-white/40">{row.team}</p>
                  )}
                </td>
                <td className="px-6 py-3 text-right font-mono whitespace-nowrap text-white/80 sm:px-8">
                  {row.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
