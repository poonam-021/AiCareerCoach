import { ArrowUp, ArrowDown, ShieldCheck, BarChart3, MessagesSquare, TrendingUp } from "lucide-react";

const ICONS = {
  "ATS Score": ShieldCheck,
  "Resume Analyses": BarChart3,
  "Interview Sessions": MessagesSquare,
  "Avg Interview Score": TrendingUp,
};

const ACCENTS = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  neutral: "bg-gray-100 text-ink-700",
  warning: "bg-orange-50 text-orange-700",
};

export default function MetricCard({ label, value, unit, delta, trend, note, accent }) {
  const Icon = ICONS[label] ?? BarChart3;

  return (
    <div className="col-span-3 flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-ink-500">{label}</span>
        <div className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${ACCENTS[accent]}`}>
          <Icon size={15} />
        </div>
      </div>

      <div className="text-[26px] font-bold tracking-tight tabular-nums">
        {value}
        {unit && <span className="text-[15px] font-semibold text-ink-400">{unit}</span>}
      </div>

      <div className="flex items-center gap-1.5 text-[12px] font-semibold">
        {trend === "up" && (
          <span className="flex items-center gap-1 text-success">
            <ArrowUp size={12} strokeWidth={2.5} />
            {delta}
          </span>
        )}
        {trend === "down" && (
          <span className="flex items-center gap-1 text-danger">
            <ArrowDown size={12} strokeWidth={2.5} />
            {delta}
          </span>
        )}
        <span className="font-medium text-ink-400">{note}</span>
      </div>
    </div>
  );
}