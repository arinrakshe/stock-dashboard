import { useState, useMemo } from 'react';
import type { StockRow } from '../lib/finnhub';
import { getSectorForSymbol, SECTOR_COLORS } from '../lib/sectors';

interface AdvancedStockTableProps {
  stocks: StockRow[];
  onSelect: (symbol: string) => void;
  selectedSymbol: string;
  isDarkMode: boolean;
}

export default function AdvancedStockTable({
  stocks,
  onSelect,
  selectedSymbol,
  isDarkMode
}: AdvancedStockTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 20;

  // Get unique sectors
  const sectors = useMemo(() => {
    const sectorSet = new Set(stocks.map(s => getSectorForSymbol(s.symbol)));
    return ['All', ...Array.from(sectorSet).sort()];
  }, [stocks]);

  // Filter by sector
  const filteredStocks = useMemo(() => {
    if (sectorFilter === 'All') return stocks;
    return stocks.filter(s => getSectorForSymbol(s.symbol) === sectorFilter);
  }, [stocks, sectorFilter]);

  // Sort stocks
  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      const multiplier = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'symbol') return multiplier * a.symbol.localeCompare(b.symbol);
      if (sortBy === 'price') return multiplier * (a.price - b.price);
      return multiplier * (a.percentChange - b.percentChange);
    });
  }, [filteredStocks, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = sortedStocks.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: 'symbol' | 'price' | 'change') => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  return (
    <div className={`rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-lg`}>
      {/* Header with filters */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            All Stocks ({sortedStocks.length})
          </h3>
          
          <div className="flex gap-2">
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-lg ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
              } border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>
                  {sector === 'All' ? 'All Sectors' : sector}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}>
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('symbol')}
                  className={`flex items-center gap-1 text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  } hover:text-indigo-500`}
                >
                  Symbol {sortBy === 'symbol' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-300">
                Sector
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort('price')}
                  className={`flex items-center gap-1 ml-auto text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  } hover:text-indigo-500`}
                >
                  Price {sortBy === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort('change')}
                  className={`flex items-center gap-1 ml-auto text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  } hover:text-indigo-500`}
                >
                  Change {sortBy === 'change' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {paginatedStocks.map(stock => {
              const sector = getSectorForSymbol(stock.symbol);
              const sectorColor = SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS] || '#64748b';
              const isSelected = stock.symbol === selectedSymbol;

              return (
                <tr
                  key={stock.symbol}
                  className={`transition-colors ${
                    isSelected
                      ? isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'
                      : isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {stock.symbol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${sectorColor}20`,
                        color: sectorColor
                      }}
                    >
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: sectorColor }}
                      />
                      {sector}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold ${
                        stock.percentChange >= 0
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {stock.percentChange >= 0 ? '↗' : '↘'}
                      {Math.abs(stock.percentChange).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelect(stock.symbol)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={`flex items-center justify-between border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} px-4 py-3`}>
        <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedStocks.length)} of{' '}
          {sortedStocks.length} stocks
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-50'
            }`}
          >
            Previous
          </button>
          
          <span className={`flex items-center px-3 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}