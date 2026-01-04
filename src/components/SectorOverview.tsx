import { useMemo } from 'react';
import type { StockRow } from '../lib/finnhub';
import { SECTORS, SECTOR_COLORS, getSectorForSymbol } from '../lib/sectors';

interface SectorOverviewProps {
  stocks: StockRow[];
  isDarkMode: boolean;
}

export default function SectorOverview({ stocks, isDarkMode }: SectorOverviewProps) {
  const sectorStats = useMemo(() => {
    const stats: Record<string, { count: number; avgChange: number; totalValue: number }> = {};

    stocks.forEach(stock => {
      const sector = getSectorForSymbol(stock.symbol);
      if (!stats[sector]) {
        stats[sector] = { count: 0, avgChange: 0, totalValue: 0 };
      }
      stats[sector].count++;
      stats[sector].avgChange += stock.percentChange;
      stats[sector].totalValue += stock.price;
    });

    // Calculate averages
    Object.keys(stats).forEach(sector => {
      if (stats[sector].count > 0) {
        stats[sector].avgChange /= stats[sector].count;
      }
    });

    return stats;
  }, [stocks]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Object.entries(sectorStats).map(([sector, stats]) => {
        const color = SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS] || '#64748b';
        const isPositive = stats.avgChange >= 0;

        return (
          <div
            key={sector}
            className={`rounded-xl ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            } border p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {sector}
              </span>
            </div>
            
            <div className={`text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? '↗' : '↘'} {Math.abs(stats.avgChange).toFixed(2)}%
            </div>
            
            <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              {stats.count} stocks
            </div>
          </div>
        );
      })}
    </div>
  );
}