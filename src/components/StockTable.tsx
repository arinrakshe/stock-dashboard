import { useEffect, useMemo, useRef, useState } from "react";
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
  selectedSymbol,
  onSelect,
}: {
  stocks: StockRow[];
  onSort: (k: SortKey) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}) {
  // Remember previous prices to detect updates
  const prevPricesRef = useRef<Record<string, number>>({});
  const [flash, setFlash] = useState<Record<string, "up" | "down" | null>>({});

  useEffect(() => {
    const prev = prevPricesRef.current;
    const nextPrev: Record<string, number> = { ...prev };
    const nextFlash: Record<string, "up" | "down" | null> = {};

    for (const s of stocks) {
      const old = prev[s.symbol];
      if (old != null && old !== s.price) {
        nextFlash[s.symbol] = s.price > old ? "up" : "down";
      }
      nextPrev[s.symbol] = s.price;
    }

    if (Object.keys(nextFlash).length) {
      setFlash((cur) => ({ ...cur, ...nextFlash }));
      // clear flash after 400ms
      setTimeout(() => {
        setFlash((cur) => {
          const copy = { ...cur };
          for (const k of Object.keys(nextFlash)) copy[k] = null;
          return copy;
        });
      }, 400);
    }

    prevPricesRef.current = nextPrev;
  }, [stocks]);

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
            const selected = s.symbol === selectedSymbol;
            const flashState = flash[s.symbol]; // "up" | "down" | null

            return (
              <tr
                key={s.symbol}
                onClick={() => onSelect(s.symbol)}
                className={[
                  "cursor-pointer transition",
                  "hover:bg-slate-50",
                  selected ? "bg-slate-50" : "",
                  flashState === "up" ? "bg-emerald-50" : "",
                  flashState === "down" ? "bg-rose-50" : "",
                ].join(" ")}
              >
                <td className="px-4 py-3 font-mono font-semibold">
                  <span
                    className={[
                      "inline-flex items-center gap-2",
                      selected ? "text-slate-900" : "text-slate-800",
                    ].join(" ")}
                  >
                    {s.symbol}
                    {selected && <span className="text-xs text-slate-400">●</span>}
                  </span>
                </td>

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
