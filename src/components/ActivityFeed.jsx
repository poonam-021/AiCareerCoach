import { Check, FileText, X, Mail, TrendingUp, MessagesSquare } from "lucide-react";

const ICONS = {
  approved: { icon: Check, className: "bg-success-soft text-success" },
  analysis: { icon: FileText, className: "bg-primary-soft text-primary" },
  rejected: { icon: X, className: "bg-danger-soft text-danger" },
  letter: { icon: Mail, className: "bg-gray-100 text-ink-700" },
  roadmap: { icon: TrendingUp, className: "bg-orange-50 text-orange-700" },
  interview: { icon: MessagesSquare, className: "bg-success-soft text-success" },
};

export default function ActivityFeed({ items }) {
  return (
    <div className="col-span-4 rounded-xl border border-border bg-card shadow-sm">
      <div className="p-5 pb-0 text-[14.5px] font-semibold">Recent Activity</div>
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-[12.5px] text-ink-400">
          No activity yet — run an analysis or a mock interview.
        </div>
      ) : (
        <div className="flex flex-col px-2 pb-3 pt-1.5">
          {items.map((item, i) => {
            const { icon: Icon, className } = ICONS[item.type];
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${className}`}>
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-ink-900">{item.title}</div>
                  <div className="mt-0.5 truncate text-[11.5px] text-ink-400">{item.meta}</div>
                </div>
                <div className="ml-auto whitespace-nowrap pt-px text-[11px] text-ink-400">
                  {item.time}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}