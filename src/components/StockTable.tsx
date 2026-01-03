import type { StockRow } from "../lib/finnhub";

type SortKey = "symbol" | "price" | "percentChange";
type SortDir = "asc" | "desc";

function formatMoney(x: number) {
  return x.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function formatPct(x: number) {
  const sign = x > 0 ? "+" : "";
  return `${sign}${x.toFixed(2)}%`;
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-slate-300">↕</span>;
  return <span className="ml-1 text-slate-500">{dir === "asc" ? "↑" : "↓"}</span>;
}

export default function StockTable({
  stocks,
  onSort,
  sortKey,
  sortDir,
}: {
  stocks: StockRow[];
  onSort: (k: SortKey) => void;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold">
              <button className="inline-flex items-center" onClick={() => onSort("symbol")}>
                Stock symbol <SortArrow active={sortKey === "symbol"} dir={sortDir} />
              </button>
            </th>
            <th className="px-4 py-3 text-sm font-semibold">
              <button className="inline-flex items-center" onClick={() => onSort("price")}>
                Price <SortArrow active={sortKey === "price"} dir={sortDir} />
              </button>
            </th>
            <th className="px-4 py-3 text-sm font-semibold">
              <button className="inline-flex items-center" onClick={() => onSort("percentChange")}>
                % change <SortArrow active={sortKey === "percentChange"} dir={sortDir} />
              </button>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {stocks.map((s) => {
            const up = s.percentChange >= 0;
            return (
              <tr key={s.symbol} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-semibold">{s.symbol}</td>
                <td className="px-4 py-3">{formatMoney(s.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-1 text-sm font-medium",
                      up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                    ].join(" ")}
                  >
                    {formatPct(s.percentChange)}
                  </span>
                </td>
              </tr>
            );
          })}

          {stocks.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-slate-500">
                Loading…
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
