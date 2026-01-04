import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { CandlePoint } from "../lib/finnhub";

function formatMoney(x: number) {
  return x.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function formatPct(x: number) {
  const sign = x > 0 ? "+" : "";
  return `${sign}${x.toFixed(2)}%`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{formatMoney(v)}</div>
    </div>
  );
}

export default function PriceChart({
  symbol,
  data,
}: {
  symbol: string;
  data: CandlePoint[];
}) {
  const first = data[0]?.close ?? null;
  const last = data[data.length - 1]?.close ?? null;

  const delta = first != null && last != null ? last - first : null;
  const pct = first && delta != null ? (delta / first) * 100 : null;
  const up = delta != null ? delta >= 0 : true;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{symbol} (30D)</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">Close</span>

            {last != null && (
              <span className="text-sm font-semibold text-slate-900">
                {formatMoney(last)}
              </span>
            )}

            {delta != null && pct != null && (
              <span
                className={[
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                  up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                ].join(" ")}
              >
                {up ? "▲" : "▼"} {formatMoney(Math.abs(delta))} ({formatPct(pct)})
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Last updated</div>
          <div className="text-xs font-medium text-slate-700">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              width={48}
            />

            {last != null && (
              <ReferenceLine
                y={last}
                stroke={up ? "#10b981" : "#ef4444"}
                strokeDasharray="4 4"
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* Glow underlay */}
            <Line
              type="monotone"
              dataKey="close"
              dot={false}
              strokeWidth={6}
              stroke={up ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)"}
              isAnimationActive
            />

            {/* Main line */}
            <Line
              type="monotone"
              dataKey="close"
              dot={false}
              strokeWidth={2.5}
              stroke={up ? "#10b981" : "#ef4444"}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">No chart data available.</p>
      )}
    </div>
  );
}
