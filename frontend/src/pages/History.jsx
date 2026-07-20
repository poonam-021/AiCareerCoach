import { useEffect, useState } from "react";
import { FileText, Trash2, ChevronDown, Inbox } from "lucide-react";
import PageHeader from "../components/PageHeader";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function formatDate(iso) {
  if (!iso) return "";
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
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error(`Failed to load history: ${res.status}`);
      const data = await res.json(); // AnalysisReportResponse[]
      setEntries(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Couldn't load history. Please refresh.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteEntry = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      await fetchHistory();
      setExpandedIndex(null);
    } catch (err) {
      console.error(err);
      setErrorMsg("Couldn't delete entry. Please try again.");
    }
  };

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader
        title="History"
        subtitle="Every resume analysis you've run."
      />

      {errorMsg && (
        <div className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-2.5 text-[12.5px] font-medium text-danger">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center text-[13px] text-ink-400 shadow-sm">
          Loading…
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-16 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-ink-400">
            <Inbox size={22} />
          </div>
          <div className="text-[14px] font-semibold text-ink-900">No history yet</div>
          <div className="max-w-sm text-[12.5px] text-ink-500">
            Run a resume analysis, and it'll show up here automatically.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => {
            const isOpen = expandedIndex === i;
            const feedbackLines = entry.feedback ? entry.feedback.split("\n").filter(Boolean) : [];

            return (
              <div key={entry.id} className="rounded-xl border border-border bg-card shadow-sm">
                <button
                  onClick={() => setExpandedIndex(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink-900">
                      Analysis #{entry.id}
                    </div>
                    <div className="text-[12px] text-ink-400">
                      {formatDate(entry.analysisTimestamp)} · {entry.status}
                    </div>
                  </div>
                  <span className="ml-auto text-[13px] font-semibold text-ink-900">
                    {entry.atsScore != null ? `${Math.round(entry.atsScore)}/100` : "—"}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                    className="rounded-md p-1.5 text-ink-400 hover:bg-danger-soft hover:text-danger transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronDown
                    size={16}
                    className={`text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-border-soft px-5 py-4 pl-[62px] flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-ink-700">Job Match</span>
                      <span className="font-semibold text-ink-900">
                        {entry.matchPercentage != null ? `${Math.round(entry.matchPercentage)}%` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-ink-700">Recruiter Decision</span>
                      <span className="font-semibold text-ink-900">{entry.recruiterDecision || "—"}</span>
                    </div>

                    {feedbackLines.length > 0 && (
                      <div>
                        <div className="mb-1.5 text-[12.5px] font-semibold text-ink-700">Feedback</div>
                        <div className="flex flex-col gap-1.5">
                          {feedbackLines.map((line, idx) => (
                            <div key={idx} className="text-[12px] text-ink-600">{line}</div>
                          ))}
                        </div>
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