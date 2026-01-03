export type CandlePoint = { time: string; close: number };

export async function fetchAVIntraday(symbol: string): Promise<CandlePoint[]> {
  const key = import.meta.env.VITE_ALPHAVANTAGE_API_KEY;
  if (!key) throw new Error("Missing Alpha Vantage API key");

  const url =
    `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}` +
    `&interval=5min&apikey=${key}&outputsize=compact`;

  const res = await fetch(url);
  const json = await res.json();
  console.log("AV JSON:", json);


  const series = json["Time Series (5min)"];
  if (!series) return [];

  // newest -> oldest; convert to oldest -> newest and keep last ~60 points
  const points = Object.entries(series)
    .map(([ts, v]: any) => ({ time: ts.slice(11, 16), close: Number(v["4. close"]) }))
    .reverse()
    .slice(-60);

  return points;
}
