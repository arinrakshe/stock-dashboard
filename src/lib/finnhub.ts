export type StockRow = {
  symbol: string;
  price: number;
  percentChange: number;
};

export type CandlePoint = {
  time: string;   // formatted label
  close: number;  // close price
};

const BASE = "https://finnhub.io/api/v1";

function getKey() {
  const key = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!key) throw new Error("Missing Finnhub API key");
  return key;
}

export async function fetchQuotes(symbols: string[]): Promise<StockRow[]> {
  const key = getKey();

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const res = await fetch(`${BASE}/quote?symbol=${symbol}&token=${key}`);
        if (!res.ok) return null;
        const json = await res.json();

        // Finnhub sometimes returns 0s on invalid/limited responses
        if (typeof json.c !== "number" || json.c <= 0) return null;

        return {
          symbol,
          price: json.c,
          percentChange: json.dp,
        } satisfies StockRow;
      } catch {
        return null;
      }
    })
  );

  // only keep good rows
  return results.filter((x): x is StockRow => x !== null);
}

// Fetch last ~30 days of daily candles for a chart
export async function fetchCandles(symbol: string): Promise<CandlePoint[]> {
  const key = getKey();
  const now = Math.floor(Date.now() / 1000);

  async function call(resolution: string, from: number, to: number) {
    const url = `${BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${key}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    if (json.s !== "ok") return [];

    const closes: number[] = json.c;
    const times: number[] = json.t;

    return times.map((unix, i) => {
      const d = new Date(unix * 1000);
      const label =
        resolution === "D"
          ? `${d.getMonth() + 1}/${d.getDate()}`
          : `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
      return { time: label, close: closes[i] };
    });
  }

  // Most reliable: intraday last 1 day (5-min)
  let data = await call("5", now - 60 * 60 * 24 * 1, now);
  if (data.length >= 5) return data;

  // Fallback: last 2 days (15-min)
  data = await call("15", now - 60 * 60 * 24 * 2, now);
  if (data.length >= 5) return data;

  // Fallback: last ~30 days daily
  data = await call("D", now - 60 * 60 * 24 * 35, now);
  return data;
}