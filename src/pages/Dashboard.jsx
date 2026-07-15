import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertTriangle, Sparkles } from "lucide-react";
import MetricCard from "../components/MetricCard";
import TrendChart from "../components/TrendChart";
import ActivityFeed from "../components/ActivityFeed";
import ProgressRing from "../components/ProgressRing";
import PageHeader from "../components/PageHeader";
import { buildDashboardData } from "../utils/dashboardData";

const ROADMAP_SKILLS_KEY = "roadmapSkills";

const SEVERITY_STYLE = {
  high: "bg-danger-soft text-danger",
  medium: "bg-orange-50 text-orange-700",
  low: "bg-gray-100 text-ink-500",
};

const SEVERITY_IMPACT = { high: "+9 pts", medium: "+6 pts", low: "+3 pts" };

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    resumes: [],
    interviews: [],
    latestResume: null,
    metrics: [],
    trendData: [],
    activity: [],
  });

  useEffect(() => {
    setData(buildDashboardData());
  }, []);

  const { resumes, latestResume, metrics, trendData, activity } = data;
  const recentResumes = [...resumes].reverse().slice(0, 3);
  const hasAnyHistory = resumes.length > 0 || data.interviews.length > 0;

  const goToNewAnalysis = () => navigate("/resume-analysis");

  const generateRoadmap = () => {
    if (!latestResume) return;
    localStorage.setItem(
      ROADMAP_SKILLS_KEY,
      JSON.stringify({
        source: latestResume.fileName,
        generatedAt: new Date().toISOString(),
        skills: latestResume.skillGaps,
      })
    );
    navigate("/roadmap");
  };

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Welcome back, Jordan"
        subtitle="Here's what your resume analyses and mock interviews show so far."
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
          <div className="text-[13.5px] font-semibold text-ink-900">
            Your dashboard is empty for now
          </div>
          <div className="mt-1 text-[12.5px] text-ink-500">
            Run a resume analysis or a mock interview session, and your real stats will appear here.
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
          <div className="text-[16px] font-bold tracking-tight">Recent Resume Analyses</div>
        </div>

        {recentResumes.length === 0 ? (
          <div className="col-span-12 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="text-[13px] text-ink-500">
              No resume analyses yet — run one from the Resume Analysis page.
            </div>
          </div>
        ) : (
          recentResumes.map((r, i) => (
            <div
              key={i}
              className="col-span-4 flex flex-col gap-3.5 rounded-xl border border-border bg-card p-[18px] shadow-sm"
            >
              <div>
                <div className="text-[13.5px] font-semibold">{r.fileName}</div>
                <div className="mt-0.5 text-[12px] text-ink-500">
                  Analyzed {new Date(r.date).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-4.5">
                <ProgressRing
                  percent={r.atsScore}
                  color={r.atsScore >= 75 ? "#059669" : r.atsScore >= 50 ? "#D97706" : "#DC2626"}
                />
                <div>
                  <div className="text-[12.5px] font-semibold text-ink-900">ATS Score</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-400">
                    {r.skillGaps.length} skill gap{r.skillGaps.length !== 1 ? "s" : ""} found
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {r.skillGaps.map((g) => (
                  <span
                    key={g.skill}
                    className={`rounded-md px-2 py-1 text-[10.5px] font-semibold ${SEVERITY_STYLE[g.severity]}`}
                  >
                    {g.skill}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="col-span-12 mt-1 flex items-baseline justify-between">
          <div className="text-[16px] font-bold tracking-tight">Optimization Suggestions</div>
          {latestResume && (
            <span className="text-[12.5px] font-semibold text-ink-400">
              Based on: {latestResume.fileName}
            </span>
          )}
        </div>

        {!latestResume ? (
          <div className="col-span-12 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="text-[13px] text-ink-500">
              Run a resume analysis to get personalized optimization suggestions here.
            </div>
          </div>
        ) : (
          <div className="col-span-12 rounded-xl border border-border bg-card shadow-sm">
            {latestResume.skillGaps.map((g, i) => (
              <div
                key={g.skill}
                className={`flex items-center gap-3 px-5 py-4 ${
                  i < latestResume.skillGaps.length - 1 ? "border-b border-border-soft" : ""
                }`}
              >
                <span className="w-[18px] text-[11px] font-bold text-ink-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-ink-900">
                    Add missing skill: "{g.skill}"
                  </div>
                  <div className="mt-px text-[12px] text-ink-400 capitalize">
                    {g.severity} priority gap
                  </div>
                </div>
                <span className="ml-auto rounded-md bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                  {SEVERITY_IMPACT[g.severity]}
                </span>
              </div>
            ))}
            <div className="px-5 py-4">
              <button
                onClick={generateRoadmap}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-primary"
              >
                <Sparkles size={14} />
                Generate full roadmap for these gaps
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}