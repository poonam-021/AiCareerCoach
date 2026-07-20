import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, Trash2, X, AlertCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const ROADMAP_SKILLS_KEY = "roadmapSkills"; // left as-is — Roadmap page not in scope for this pass

// TODO: confirm actual recruiterDecision enum values returned by the AI service.
// Assumed SHORTLIST / REJECT / MAYBE based on AnalysisReport entity comment.
const DECISION_STYLE = {
  SHORTLIST: "bg-success-soft text-success border-success/20",
  REJECT: "bg-danger-soft text-danger border-danger/20",
  MAYBE: "bg-gray-100 text-ink-500 border-gray-200",
};

export default function JobDescriptions() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [newRole, setNewRole] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchJobs = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/job-descriptions`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error(`Failed to load job descriptions: ${res.status}`);
      const data = await res.json(); // JobDescriptionResponse[]
      setJobs(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Couldn't load job descriptions. Please refresh.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  async function handleAddJob(e) {
    e.preventDefault();
    if (!newRole.trim() || !newCompany.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/job-descriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          company: newCompany.trim(),
          jobTitle: newRole.trim(),
          description: newDescription.trim(),
          skills: [],
          experienceRequired: null,
        }),
      });
      if (!res.ok) throw new Error(`Failed to create job description: ${res.status}`);

      await fetchJobs();

      setNewRole("");
      setNewCompany("");
      setNewDescription("");
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Couldn't create job description. Please try again.");
    }
  }

  async function handleDeleteJob(jobId, event) {
    if (event) event.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/job-descriptions/${jobId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      await fetchJobs();
      if (selectedJob?.id === jobId) setIsDetailDrawerOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Couldn't delete job description. Please try again.");
    }
  }

  function matchColor(match) {
    if (match == null) return "bg-gray-200";
    if (match >= 75) return "bg-success";
    if (match >= 50) return "bg-orange-500";
    return "bg-danger";
  }

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    return (
      job.jobTitle?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Job Descriptions"
        subtitle="Every role you've saved to match your resume against."
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
          >
            <Plus size={14} strokeWidth={2.2} />
            Add Job Description
          </button>
        }
      />

      {errorMsg && (
        <div className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-2.5 text-[12.5px] font-medium text-danger">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Filter by role or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center text-[13px] text-ink-400 shadow-sm">
          Loading…
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-16 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-ink-400">
            <AlertCircle size={22} />
          </div>
          <div className="text-[14px] font-semibold text-ink-900">No job descriptions found</div>
          <div className="max-w-sm text-[12.5px] text-ink-500">
            {searchQuery
              ? "No jobs match your current search query."
              : "Click 'Add Job Description' to save a role, then run analysis against it from the Resume Analysis page."}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-fade-in">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-[11.5px] font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Match Score</th>
                <th className="px-5 py-3">Recruiter Decision</th>
                <th className="px-5 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => {
                    setSelectedJob(job);
                    setIsDetailDrawerOpen(true);
                  }}
                  className="border-b border-border-soft last:border-b-0 hover:bg-gray-50/60 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-ink-500">
                        <Building2 size={15} />
                      </div>
                      <div>
                        <div className="text-[13.5px] font-semibold text-ink-900">{job.jobTitle}</div>
                        <div className="text-[12px] text-ink-400">{job.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {job.matchPercentage != null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${matchColor(job.matchPercentage)}`}
                            style={{ width: `${job.matchPercentage}%` }}
                          />
                        </div>
                        <span className="text-[12.5px] font-semibold text-ink-700">
                          {Math.round(job.matchPercentage)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[12px] text-ink-400">Not analyzed yet</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {job.recruiterDecision ? (
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold ${
                          DECISION_STYLE[job.recruiterDecision] || DECISION_STYLE.MAYBE
                        }`}
                      >
                        {job.recruiterDecision}
                      </span>
                    ) : (
                      <span className="text-[12px] text-ink-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => handleDeleteJob(job.id, e)}
                      className="rounded-md p-1.5 text-ink-400 hover:bg-danger-soft hover:text-danger transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[15px] font-semibold text-ink-900">Add New Job Description</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-md p-1 hover:bg-gray-100 text-ink-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddJob} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-ink-600">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="rounded-lg border border-border bg-canvas px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-ink-600">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TalentFlow AI"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="rounded-lg border border-border bg-canvas px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-ink-600">Job Description Requirements</label>
                <textarea
                  placeholder="Paste the full job responsibilities/requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={4}
                  className="resize-none rounded-lg border border-border bg-canvas px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-primary"
                />
              </div>
              <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-[12.5px] font-semibold text-ink-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-[12.5px] font-semibold text-white hover:opacity-90"
                >
                  Add Job Description
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailDrawerOpen && selectedJob && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-card shadow-2xl p-6 flex flex-col animate-slide-left">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-[15px] font-bold text-ink-900">{selectedJob.jobTitle}</h3>
              <p className="text-[12px] text-ink-500">{selectedJob.company}</p>
            </div>
            <button onClick={() => setIsDetailDrawerOpen(false)} className="rounded-md p-1 hover:bg-gray-100 text-ink-400">
              <X size={16} />
            </button>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
            <div className="flex items-center gap-4 rounded-xl border border-border-soft bg-canvas/40 p-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-card font-bold text-[14px] text-primary">
                {selectedJob.matchPercentage != null ? `${Math.round(selectedJob.matchPercentage)}%` : "—"}
              </div>
              <div>
                <div className="text-[13px] font-bold text-ink-900">Comparative Match Score</div>
                <div className="text-[12px] text-ink-500">
                  {selectedJob.recruiterDecision
                    ? <>Recruiter decision: <strong>{selectedJob.recruiterDecision}</strong></>
                    : "Not analyzed yet — run analysis from the Resume Analysis page."}
                </div>
              </div>
            </div>

            {selectedJob.description && (
              <div className="flex flex-col gap-2">
                <div className="text-[12.5px] font-bold text-ink-800">Job Description Text</div>
                <div className="rounded-lg border border-border-soft bg-canvas p-3 text-[12px] text-ink-600 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                  {selectedJob.description}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-border pt-4 flex gap-2">
            <button
              onClick={() => navigate("/resume-analysis")}
              className="flex-1 rounded-lg border border-primary bg-primary-soft py-2.5 text-[12.5px] font-semibold text-primary hover:bg-primary hover:text-white transition-all text-center"
            >
              Run Analysis
            </button>
            <button
              onClick={() => handleDeleteJob(selectedJob.id)}
              className="rounded-lg border border-danger bg-danger-soft px-4 py-2.5 text-[12.5px] font-semibold text-danger hover:bg-danger hover:text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </main>
  );
}