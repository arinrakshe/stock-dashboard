import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const API_KEY = process.env.FINNHUB_KEY;
const BASE = "https://finnhub.io/api/v1";

const SYMBOLS = [
  "AAPL","MSFT","GOOGL","META","NVDA","AMD","INTC","ADBE","CRM","ORCL",
  "JPM","BAC","WFC","C","GS","MS","V","MA","AXP","BLK",
  "JNJ","UNH","PFE","ABBV","TMO","ABT","MRK","LLY","BMY","AMGN",
  "AMZN","TSLA","WMT","TGT","COST","HD","NKE","SBUX","MCD","CMG"
];

let cache = [];
let lastFetch = 0;

async function fetchAll() {
  const data = [];

  for (const sym of SYMBOLS) {
    const r = await fetch(`${BASE}/quote?symbol=${sym}&token=${API_KEY}`);
    const j = await r.json();
    if (j.c) {
      data.push({ symbol: sym, price: j.c, percentChange: j.dp });
    }
    await new Promise(r => setTimeout(r, 1100)); // Finnhub rate-limit
  }

  cache = data;
  lastFetch = Date.now();
}

app.get("/stocks", async (req, res) => {
  if (Date.now() - lastFetch > 60000 || cache.length === 0) {
    await fetchAll();
  }
  res.json(cache);
});

app.listen(3001, () => console.log("Finnhub proxy running on http://localhost:3001"));
