export const SECTORS = {
  "Technology": ["AAPL", "MSFT", "GOOGL", "META", "NVDA", "AMD", "INTC", "ADBE", "CRM", "ORCL"],
  "Financial": ["JPM", "BAC", "WFC", "C", "GS", "MS", "V", "MA", "AXP", "BLK"],
  "Healthcare": ["JNJ", "UNH", "PFE", "ABBV", "TMO", "ABT", "MRK", "LLY", "BMY", "AMGN"],
  "Consumer": ["AMZN", "TSLA", "WMT", "TGT", "COST", "HD", "NKE", "SBUX", "MCD", "CMG"],
  "Energy": ["XOM", "CVX", "COP", "SLB", "EOG", "PSX", "VLO", "MPC", "OXY", "HAL"],
  "Industrials": ["BA", "CAT", "GE", "MMM", "HON", "UPS", "FDX", "LMT", "RTX", "NOC"],
  "Communication": ["DIS", "NFLX", "CMCSA", "T", "VZ", "TMUS", "CHTR", "PARA"],
  "Materials": ["LIN", "APD", "ECL", "SHW", "DD", "NEM", "FCX", "GOLD", "NUE"],
  "Real Estate": ["AMT", "PLD", "CCI", "EQIX", "PSA", "SPG", "O", "WELL", "DLR"],
  "Utilities": ["NEE", "DUK", "SO", "D", "AEP", "EXC", "XEL", "ES", "ED"]
};

export const SECTOR_COLORS = {
  "Technology": "#6366f1",
  "Financial": "#10b981",
  "Healthcare": "#ef4444",
  "Consumer": "#f59e0b",
  "Energy": "#8b5cf6",
  "Industrials": "#06b6d4",
  "Communication": "#ec4899",
  "Materials": "#14b8a6",
  "Real Estate": "#f97316",
  "Utilities": "#84cc16"
};

export function getSectorForSymbol(symbol: string): string {
  for (const [sector, symbols] of Object.entries(SECTORS)) {
    if (symbols.includes(symbol)) {
      return sector;
    }
  }
  return "Other";
}