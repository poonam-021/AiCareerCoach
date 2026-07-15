import { Check, X } from "lucide-react";
import ProgressRing from "./ProgressRing";

export default function InsightCard({
  role,
  company,
  appliedDate,
  status,
  matchPercent,
  keywordsMatched,
  keywordsTotal,
  keywords,
}) {
  const isApproved = status === "approved";

  return (
    <div className="col-span-4 flex flex-col gap-3.5 rounded-xl border border-border bg-card p-[18px] shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13.5px] font-semibold">{role}</div>
          <div className="mt-0.5 text-[12px] text-ink-500">
            {company} · Applied {appliedDate}
          </div>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            isApproved ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          }`}
        >
          {isApproved ? <Check size={11} strokeWidth={2.5} /> : <X size={11} strokeWidth={2.5} />}
          {isApproved ? "Approved" : "Rejected"}
        </span>
      </div>

      <div className="flex items-center gap-4.5 gap-x-[18px]">
        <ProgressRing percent={matchPercent} color={isApproved ? "#059669" : "#DC2626"} />
        <div>
          <div className="text-[12.5px] font-semibold text-ink-900">Keyword match</div>
          <div className="mt-0.5 text-[11.5px] text-ink-400">
            {keywordsMatched} of {keywordsTotal} keywords matched
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {keywords.map((k) => (
          <span
            key={k.label}
            className={`rounded-md px-2 py-1 text-[10.5px] font-semibold ${
              k.matched ? "bg-success-soft text-success" : "bg-gray-100 text-ink-400"
            }`}
          >
            {k.label}
          </span>
        ))}
      </div>
    </div>
  );
}
