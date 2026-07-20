import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import MetricCard from "../components/MetricCard";
import TrendChart from "../components/TrendChart";
import ActivityFeed from "../components/ActivityFeed";
import PageHeader from "../components/PageHeader";
import * as api from "../utils/apiClients";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/dashboard/trend"),
      api.get("/dashboard/activity"),
      api.get("/history"),
    ]).then(([statsRes, trendRes, activityRes, historyRes]) => {
      setStats(statsRes);
      setTrendData(trendRes);
      setActivity(activityRes);
      setRecentReports(historyRes.slice(0, 3));
    });
  }, []);

  const hasAnyHistory = stats && stats.totalAnalyses > 0;
  const goToNewAnalysis = () => navigate("/resume-analysis");

  // Shaped to whatever prop array MetricCard previously expected from mockData —
  // confirm this matches MetricCard's actual prop names, I don't have that file
  const metrics = stats
    ? [
        { label: "Latest ATS Score", value: stats.atsScore === "" ? "—" : stats.atsScore },
        { label: "Total Analyses", value: stats.totalAnalyses },
      ]
    : [];

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader
        title={`Welcome back, ${currentUser?.name || "there"}`}
        subtitle="Here's how your applications are performing this week."
        action={
          <button
            onClick={goToNewAnalysis}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm"
          >
            <Plus size={14} strokeWidth={2.2} />
            New Analysis
          </button>
        }
      />

      {!hasAnyHistory && (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center shadow-sm">
          <div className="text-[13.5px] font-semibold text-ink-900">Your dashboard is empty for now</div>
          <div className="mt-1 text-[12.5px] text-ink-500">
            Run a resume analysis, and your real stats will appear here.
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}

        <TrendChart data={trendData} />
        <ActivityFeed items={activity} />

        <div className="col-span-12 mt-1 flex items-baseline justify-between">
          <div className="text-[16px] font-bold tracking-tight">Recent Analyses</div>
        </div>

        {recentReports.length === 0 ? (
          <div className="col-span-12 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="text-[13px] text-ink-500">
              No analyses yet — run one from the Resume Analysis page.
            </div>
          </div>
        ) : (
          recentReports.map((r) => (
            <div
              key={r.id}
              onClick={() => navigate(`/roadmap/${r.id}`)}
              className="col-span-4 flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-[18px] shadow-sm hover:border-primary"
            >
              <div className="text-[12px] text-ink-500">
                {new Date(r.analysisTimestamp).toLocaleDateString()}
              </div>
              <div className="text-[13.5px] font-semibold">
                ATS Score: {r.atsScore ?? "—"} · Match: {r.matchPercentage ?? "—"}%
              </div>
              <div className="text-[12px] text-ink-400 capitalize">{r.status?.toLowerCase()}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}