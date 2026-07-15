import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function TrendChart({ data }) {
  const hasData = data.length > 0;

  return (
    <div className="col-span-8 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between p-5 pb-1">
        <div>
          <div className="text-[14.5px] font-semibold">ATS Improvement Trend</div>
          <div className="mt-0.5 text-[12px] text-ink-400">
            Score progression across resume analyses
          </div>
        </div>
      </div>

      <div className="flex gap-4 px-5 pt-2 text-[12px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" /> ATS Score
        </span>
      </div>

      {hasData ? (
        <div className="h-[220px] px-3 pb-4 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="atsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#EEF0F2" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                  boxShadow: "0 1px 3px rgba(16,24,40,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="atsScore"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#atsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[220px] flex-col items-center justify-center gap-1 px-5 text-center">
          <div className="text-[13px] font-medium text-ink-500">No analyses yet</div>
          <div className="text-[12px] text-ink-400">
            Run a resume analysis to start tracking your ATS score over time.
          </div>
        </div>
      )}
    </div>
  );
}