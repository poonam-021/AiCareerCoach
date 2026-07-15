import { useState, useEffect } from "react";
import { FileText, MessagesSquare, Trash2, ChevronDown, Inbox } from "lucide-react";
import PageHeader from "../components/PageHeader";

const RESUME_HISTORY_KEY = "resumeAnalyses";
const INTERVIEW_HISTORY_KEY = "mockInterviewSessions";

const FILTERS = ["All", "Resume Analyses", "Interview Sessions"];

function loadHistory() {
  let resumeEntries = [];
  let interviewEntries = [];

  try {
    resumeEntries = JSON.parse(localStorage.getItem(RESUME_HISTORY_KEY) || "[]");
  } catch {
    resumeEntries = [];
  }

  try {
    const rawInterviews = JSON.parse(localStorage.getItem(INTERVIEW_HISTORY_KEY) || "[]");
    interviewEntries = rawInterviews.map((s) => ({ ...s, type: "interview" }));
  } catch {
    interviewEntries = [];
  }

  return [...resumeEntries, ...interviewEntries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function History() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("All");
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(RESUME_HISTORY_KEY);
    localStorage.removeItem(INTERVIEW_HISTORY_KEY);
    setEntries([]);
    setExpandedIndex(null);
  };

  const filtered = entries.filter((e) => {
    if (filter === "All") return true;
    if (filter === "Resume Analyses") return e.type === "resume";
    if (filter === "Interview Sessions") return e.type === "interview";
    return true;
  });

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader
        title="History"
        subtitle="Every resume analysis and mock interview session you've run."
        action={
          entries.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-danger shadow-sm"
            >
              <Trash2 size={14} />
              Clear history
            </button>
          )
        }
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold ${
              filter === f ? "border-primary bg-primary-soft text-primary" : "border-border text-ink-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-16 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-ink-400">
            <Inbox size={22} />
          </div>
          <div className="text-[14px] font-semibold text-ink-900">No history yet</div>
          <div className="max-w-sm text-[12.5px] text-ink-500">
            Run a resume analysis or a mock interview session, and it'll show up here automatically.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((entry, i) => {
            const isOpen = expandedIndex === i;
            const isResume = entry.type === "resume";

            return (
              <div key={i} className="rounded-xl border border-border bg-card shadow-sm">
                <button
                  onClick={() => setExpandedIndex(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isResume ? "bg-primary-soft text-primary" : "bg-success-soft text-success"
                    }`}
                  >
                    {isResume ? <FileText size={16} /> : <MessagesSquare size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink-900">
                      {isResume ? entry.fileName : `${entry.category} Mock Interview`}
                    </div>
                    <div className="text-[12px] text-ink-400">
                      {formatDate(entry.date)}
                      {!isResume && ` · ${entry.difficulty}`}
                    </div>
                  </div>
                  <span className="ml-auto text-[13px] font-semibold text-ink-900">
                    {isResume ? `${entry.atsScore}/100` : `${entry.score}%`}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-border-soft px-5 py-4 pl-[62px]">
                    {isResume ? (
                      <div className="flex flex-col gap-2">
                        <div className="text-[12.5px] font-semibold text-ink-700">Score breakdown</div>
                        {entry.scoreBreakdown.map((s) => (
                          <div key={s.label} className="flex items-center justify-between text-[12.5px]">
                            <span className="text-ink-700">{s.label}</span>
                            <span className="font-semibold text-ink-900">{s.score}/100</span>
                          </div>
                        ))}
                        <div className="mt-2 text-[12.5px] font-semibold text-ink-700">Skill gaps</div>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.skillGaps.map((g) => (
                            <span
                              key={g.skill}
                              className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-ink-500"
                            >
                              {g.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[12.5px] text-ink-700">
                        Completed a {entry.category.toLowerCase()} mock interview at{" "}
                        {entry.difficulty} difficulty with a final score of{" "}
                        <span className="font-semibold text-ink-900">{entry.score}%</span>.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}