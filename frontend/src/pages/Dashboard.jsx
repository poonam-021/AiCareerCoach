import { Plus } from "lucide-react";
import MetricCard from "./MetricCard";
import TrendChart from "./TrendChart";
import ActivityFeed from "./ActivityFeed";
import InsightCard from "./InsightCard";
import OptimizationAccordion from "./OptimizationAccordion";
import { metrics, trendData, activity, insights, suggestions } from "../data/mockData";
export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[22px] font-bold tracking-tight">Welcome back, Jordan</div>
          <div className="mt-0.5 text-[13px] text-ink-500">
            Here's how your applications are performing this week.
          </div>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm">
          <Plus size={14} strokeWidth={2.2} />
          New Analysis
        </button>
      </div>
      <div className="grid grid-cols-12 gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
        <TrendChart data={trendData} />
        <ActivityFeed items={activity} />
        <div className="col-span-12 mt-1 flex items-baseline justify-between">
          <div className="text-[16px] font-bold tracking-tight">AI Insights</div>
          <a href="#" className="text-[12.5px] font-semibold text-primary">
            View all analyses →
          </a>
        </div>
        {insights.map((insight) => (
          <InsightCard key={insight.role} {...insight} />
        ))}
        <div className="col-span-12 mt-1 flex items-baseline justify-between">
          <div className="text-[16px] font-bold tracking-tight">Optimization Suggestions</div>
          <a href="#" className="text-[12.5px] font-semibold text-primary">
            Product Designer · Notion
          </a>
        </div>
        <OptimizationAccordion suggestions={suggestions} />
      </div>
    </main>
  );
}
