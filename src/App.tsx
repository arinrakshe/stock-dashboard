import { useEffect, useMemo, useState } from "react";
import StockTable from "./components/StockTable";
import StockChart from "./components/StockChart";
import { fetchQuotes } from "./lib/finnhub";
import type { StockRow } from "./lib/finnhub";
import { generateFakeHistory, generateDates } from "./lib/fakeHistory";
import Spinner from "./components/Spinner";
import SectorOverview from './components/SectorOverview';
import AdvancedStockTable from './components/AdvancedStockTable';

const DEFAULT_SYMBOLS = [
  // Tech Giants (FAANG+)
  "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "NFLX",
  
  // Major Tech
  "AMD", "INTC", "ADBE", "CRM", "ORCL", "CSCO", "AVGO", "QCOM", "TXN", "IBM",
  "SHOP", "SQ", "PYPL", "UBER", "LYFT", "SNAP", "TWTR", "ZM", "DOCU", "OKTA",
  
  // Semiconductors
  "TSM", "ASML", "MU", "LRCX", "KLAC", "AMAT", "MRVL", "MPWR", "ON", "SWKS",
  
  // Cloud/SaaS
  "NOW", "SNOW", "WDAY", "TEAM", "DDOG", "NET", "CRWD", "ZS", "PANW", "FTNT",
  
  // E-commerce & Retail
  "WMT", "TGT", "COST", "HD", "LOW", "NKE", "LULU", "ETSY", "CHWY", "RVLV",
  
  // Financial Services
  "JPM", "BAC", "WFC", "C", "GS", "MS", "V", "MA", "AXP", "BLK",
  "COF", "SCHW", "USB", "PNC", "TFC", "BK", "STT", "NTRS", "TROW", "BEN",
  
  // Banks
  "JPM", "BAC", "WFC", "C", "USB", "PNC", "TFC", "KEY", "FITB", "RF",
  
  // Pharma & Healthcare
  "JNJ", "UNH", "PFE", "ABBV", "TMO", "ABT", "MRK", "LLY", "BMY", "AMGN",
  "GILD", "VRTX", "REGN", "BIIB", "ILMN", "MRNA", "BNTX", "ZTS", "CVS", "CI",
  
  // Energy
  "XOM", "CVX", "COP", "SLB", "EOG", "PSX", "VLO", "MPC", "OXY", "HAL",
  
  // Consumer Goods
  "PG", "KO", "PEP", "MDLZ", "PM", "MO", "CL", "KMB", "GIS", "K",
  
  // Auto & Transportation
  "F", "GM", "RIVN", "LCID", "NIO", "XPEV", "LI", "DAL", "UAL", "AAL",
  
  // Entertainment & Media
  "DIS", "CMCSA", "PARA", "WBD", "SPOT", "RBLX", "EA", "ATVI", "TTWO", "U",
  
  // Industrials
  "BA", "CAT", "GE", "MMM", "HON", "UPS", "FDX", "LMT", "RTX", "NOC",
  
  // Real Estate
  "AMT", "PLD", "CCI", "EQIX", "PSA", "SPG", "O", "WELL", "DLR", "AVB",
  
  // Telecom
  "T", "VZ", "TMUS", "CHTR", "DISH",
  
  // Materials
  "LIN", "APD", "ECL", "SHW", "DD", "NEM", "FCX", "GOLD", "NUE", "STLD",
  
  // Utilities
  "NEE", "DUK", "SO", "D", "AEP", "EXC", "XEL", "ES", "ED", "PEG",
  
  // China ADRs
  "BABA", "JD", "PDD", "BIDU", "NIO", "XPEV", "LI", "BILI", "TME", "IQ",
  
  // Crypto-related
  "COIN", "MARA", "RIOT", "MSTR", "SI",
  
  // Emerging Tech
  "PLTR", "AI", "PATH", "UPST", "AFRM", "HOOD", "SOFI", "NU"
];

type SortKey = "symbol" | "price" | "percentChange";
type SortDir = "asc" | "desc";

export default function App() {
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [selected, setSelected] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Calculate market stats
  const marketStats = useMemo(() => {
    if (stocks.length === 0) return { gainers: 0, losers: 0, avgChange: 0 };
    
    const gainers = stocks.filter(s => s.percentChange > 0).length;
    const losers = stocks.filter(s => s.percentChange < 0).length;
    const avgChange = stocks.reduce((sum, s) => sum + s.percentChange, 0) / stocks.length;
    
    return { gainers, losers, avgChange };
  }, [stocks]);

  const topGainer = useMemo(() => {
    return [...stocks].sort((a, b) => b.percentChange - a.percentChange)[0];
  }, [stocks]);

  const topLoser = useMemo(() => {
    return [...stocks].sort((a, b) => a.percentChange - b.percentChange)[0];
  }, [stocks]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'} transition-colors duration-300`}>
      {/* Enhanced Header */}
      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/80 border-slate-200'} backdrop-blur-xl border-b sticky top-0 z-50 transition-colors duration-300`}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl shadow-lg">
                📈
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
                  StockView Pro
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Real-time market intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`rounded-xl p-2.5 ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-600'} transition-all hover:scale-110`}
                title="Toggle theme"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              <button
                onClick={loadQuotes}
                disabled={loading}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${
                  isDarkMode 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading && <Spinner />}
                <span className={loading ? 'animate-pulse' : ''}>
                  {loading ? "Refreshing…" : "🔄 Refresh"}
                </span>
              </button>
            </div>
          </div>

          {lastUpdated && (
            <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Market Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border p-4 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1`}>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Market Status</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
              <span className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Live</span>
            </div>
          </div>

          <div className={`rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border p-4 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1`}>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Avg. Change</div>
            <div className={`mt-2 text-2xl font-bold ${marketStats.avgChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {marketStats.avgChange >= 0 ? '↗' : '↘'} {marketStats.avgChange.toFixed(2)}%
            </div>
          </div>

          <div className={`rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border p-4 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1`}>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Top Gainer</div>
            <div className="mt-2">
              {topGainer ? (
                <>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{topGainer.symbol}</div>
                  <div className="text-sm font-semibold text-emerald-600">
                    +{topGainer.percentChange.toFixed(2)}%
                  </div>
                </>
              ) : (
                <div className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>—</div>
              )}
            </div>
          </div>

          <div className={`rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border p-4 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1`}>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Top Loser</div>
            <div className="mt-2">
              {topLoser ? (
                <>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{topLoser.symbol}</div>
                  <div className="text-sm font-semibold text-rose-600">
                    {topLoser.percentChange.toFixed(2)}%
                  </div>
                </>
              ) : (
                <div className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>—</div>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className={`mb-6 rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border p-4 shadow-sm`}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stocks..."
                className={`w-full rounded-xl ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'} border px-10 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
              />
            </div>

            <select
  value={selected}
  onChange={e => setSelected(e.target.value)}
  className={`rounded-xl ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border px-4 py-2.5 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
>
  <option value="">--- Select Stock ---</option>
  {stocks.map(s => (
    <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
  ))}
</select>
          </div>
        </div>

        

        {/* Sector Overview */}
        <div className="mb-6">
          <h2 className={`mb-4 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Sector Performance
          </h2>
          <SectorOverview stocks={stocks} isDarkMode={isDarkMode} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Chart - Takes 1 column */}
          <div className={`xl:col-span-1 rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border p-5 shadow-lg transition-all hover:shadow-xl`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {selected} <span className={`text-sm font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>(30D)</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="h-[300px]">
                <StockChart labels={labels} data={history} />
              </div>
            )}
          </div>

          {/* Advanced Table - Takes 2 columns */}
          <div className="xl:col-span-2">
            {loading ? (
              <div className="flex h-[350px] items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <AdvancedStockTable
                stocks={filteredStocks}
                onSelect={setSelected}
                selectedSymbol={selected}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}