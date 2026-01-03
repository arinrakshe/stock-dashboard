import { useEffect, useMemo, useState } from "react";
import StockTable from "./components/StockTable";
import StockChart from "./components/StockChart";
import { fetchQuotes } from "./lib/finnhub";
import type { StockRow } from "./lib/finnhub";
import { generateFakeHistory, generateDates } from "./lib/fakeHistory";
import Spinner from "./components/Spinner";


const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM"];

type SortKey = "symbol" | "price" | "percentChange";
type SortDir = "asc" | "desc";

export default function App() {
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [selected, setSelected] = useState("AAPL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [history, setHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  // Fetch quotes
  async function loadQuotes() {
  if (loading) return;

  setLoading(true);
  setError(null);

  const start = Date.now();

  try {
    const data = await fetchQuotes(DEFAULT_SYMBOLS);

    // If API returns nothing (rate limited)
    if (!data || data.length === 0) {
      throw new Error("No data returned");
    }

    setStocks(data);
    setLastUpdated(new Date());
  } catch (e) {
    setError(
      "Stock data unavailable (API rate limit or network error). Please wait 30 seconds and try again."
    );
  } finally {
    // Keep spinner visible for at least 400ms (prevents flicker)
    const elapsed = Date.now() - start;
    const delay = Math.max(0, 400 - elapsed);
    setTimeout(() => setLoading(false), delay);
  }
}

    

  // Initial load + auto refresh every 30s
  useEffect(() => {
    loadQuotes();
    const id = setInterval(loadQuotes, 30000);
    return () => clearInterval(id);
  }, []);

  // Update chart when stock or prices change
  useEffect(() => {
    const row = stocks.find(s => s.symbol === selected);
    if (!row) return;
    setHistory(generateFakeHistory(row.price));
    setLabels(generateDates());
  }, [stocks, selected]);

  // Sorting
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedStocks = useMemo(() => {
    return [...stocks].sort((a, b) => {
      const m = sortDir === "asc" ? 1 : -1;
      if (sortKey === "symbol") return m * a.symbol.localeCompare(b.symbol);
      if (sortKey === "price") return m * (a.price - b.price);
      return m * (a.percentChange - b.percentChange);
    });
  }, [stocks, sortKey, sortDir]);

  // Search filter
  const filteredStocks = useMemo(() => {
    return sortedStocks.filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [sortedStocks, search]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Price Dashboard</h1>
            <p className="text-slate-600">Live quotes with a 30-day price chart</p>
            {lastUpdated && (
              <p className="text-sm text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search symbol…"
              className="rounded-xl border px-3 py-2"
            />

            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="rounded-xl border px-3 py-2"
            >
              {DEFAULT_SYMBOLS.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <button
  onClick={loadQuotes}
  disabled={loading}
  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
>
  {loading && <Spinner />}
  {loading ? "Refreshing…" : "Refresh"}
</button>
          </div>
        </div>

        {error && (
  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
    <p className="font-semibold">⚠ API Error</p>
    <p className="text-sm mt-1">{error}</p>
  </div>
)}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart */}
          <div className="rounded-2xl bg-white p-4 shadow">
  <h2 className="mb-2 font-semibold">{selected} (30D)</h2>

  {loading ? (
    <Spinner />
  ) : (
    <div className="h-[300px]">
      <StockChart labels={labels} data={history} />
    </div>
  )}
</div>

           {/* Table */}
          {loading ? (
            <Spinner />
          ) : (
            <StockTable
              stocks={filteredStocks}
              onSort={toggleSort}
              sortKey={sortKey}
              sortDir={sortDir}
            />
          )}

        </div>
      </div>
    </div>
  );
}

