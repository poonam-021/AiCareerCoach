import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  RotateCcw,
  Download,
  Building2,
  Briefcase,
} from "lucide-react";
import PageHeader from "../components/PageHeader";

const API_BASE = import.meta.env.VITE_API_BASE_URL; // e.g. http://localhost:8080/api

// Statuses that mean "still working" — keep polling while status is one of these
const IN_PROGRESS_STATUSES = ["PENDING", "IN_PROGRESS"];
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30; // ~60s ceiling before giving up

function ScoreBar({ label, score, note }) {
  const color = score >= 85 ? "bg-success" : score >= 70 ? "bg-primary" : "bg-orange-500";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-ink-900">{label}</span>
        <span className="font-semibold text-ink-700">{score}/100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      {note && <span className="text-[12px] text-ink-400">{note}</span>}
    </div>
  );
}

export default function ResumeAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [jdRole, setJdRole] = useState("");
  const [jdCompany, setJdCompany] = useState("");
  const [jdText, setJdText] = useState("");

  // idle | uploading | creating-jd | queued | polling | done | error
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [report, setReport] = useState(null); // raw AnalysisReport from backend

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setStatus("idle");
      setReport(null);
      setErrorMsg("");
    }
  };

  const handleReset = () => {
    setFile(null);
    setJdRole("");
    setJdCompany("");
    setJdText("");
    setStatus("idle");
    setErrorMsg("");
    setReport(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pollAnalysis = async (analysisId) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const res = await fetch(`${API_BASE}/analysis/${analysisId}`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error(`Failed to fetch analysis status: ${res.status}`);

      const data = await res.json(); // AnalysisReport entity, serialized

      if (!IN_PROGRESS_STATUSES.includes(data.status)) {
        return data; // COMPLETED, PARTIAL, or FAILED
      }
    }
    throw new Error("Analysis is taking longer than expected. Please check back shortly.");
  };

  const runAnalysis = async () => {
    if (!file || !jdRole.trim() || !jdCompany.trim() || !jdText.trim()) return;
    setStatus("uploading");
    setErrorMsg("");

    try {
      // 1. Upload resume
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API_BASE}/resumes/upload`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error(`Resume upload failed: ${uploadRes.status}`);
      const uploadedResume = await uploadRes.json(); // ResumeResponse

      // 2. Create job description
      setStatus("creating-jd");
      const jdRes = await fetch(`${API_BASE}/job-descriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          company: jdCompany.trim(),
          jobTitle: jdRole.trim(),
          description: jdText.trim(),
          skills: [],
          experienceRequired: null,
        }),
      });
      if (!jdRes.ok) throw new Error(`Job description creation failed: ${jdRes.status}`);
      const createdJd = await jdRes.json(); // JobDescriptionResponse

      // 3. Kick off analysis — note: resumeId/jdId are query params, not a JSON body,
      // since the backend uses @RequestParam here.
      setStatus("queued");
      const startRes = await fetch(
        `${API_BASE}/analysis/complete-analysis?resumeId=${uploadedResume.id}&jdId=${createdJd.id}`,
        {
          method: "POST",
          headers: { ...getAuthHeaders() },
        }
      );
      if (!startRes.ok) throw new Error(`Failed to start analysis: ${startRes.status}`);

      const job = await startRes.json();

      // 4. Poll until done
      setStatus("polling");
      const finalReport = await pollAnalysis(job.analysisReportId);

      setReport(finalReport);
      setStatus(finalReport.status === "FAILED" ? "error" : "done");
      if (finalReport.status === "FAILED") {
        setErrorMsg("Analysis failed on the AI service side. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const lines = [
      `AI Career Coach — Resume Analysis Report`,
      `File: ${file?.name ?? "N/A"}`,
      `Role: ${jdRole} at ${jdCompany}`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `ATS Score: ${report.atsScore ?? "N/A"}/100`,
      `Job Match: ${report.matchPercentage ?? "N/A"}%`,
      `Recruiter Decision: ${report.recruiterDecision ?? "N/A"}`,
      ``,
      `Feedback:`,
      ...(report.feedback ? report.feedback.split("\n") : ["No feedback available"]),
    ];

    if (report.coverLetter) {
      lines.push(``, `Cover Letter:`, report.coverLetter);
    }
    if (report.emailDraft) {
      lines.push(``, `Email Draft:`, report.emailDraft);
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-analysis-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const feedbackLines = report?.feedback ? report.feedback.split("\n").filter(Boolean) : [];

  const isBusy = ["uploading", "creating-jd", "queued", "polling"].includes(status);
  const statusLabel = {
    uploading: "Uploading resume…",
    "creating-jd": "Saving job description…",
    queued: "Queuing analysis…",
    polling: "Running AI analysis…",
  }[status];

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Resume Analysis"
        subtitle="Upload a resume and a job description to get an ATS score, match percentage, and AI feedback."
      />

      <div className="grid grid-cols-12 gap-5">
        {/* Upload zone */}
        <div className="col-span-12 rounded-xl border border-dashed border-border bg-card p-10 text-center shadow-sm animate-fade-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <UploadCloud size={22} />
          </div>
          <div className="mt-4 text-[14px] font-semibold text-ink-900">
            Drag and drop your resume, or browse
          </div>
          <div className="mt-1 text-[12.5px] text-ink-400">
            Supports PDF and DOCX, up to 10MB
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-ink-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <UploadCloud size={14} />
              Choose file
            </button>
          </div>

          {file && (
            <div className="mt-2 text-[12px] text-ink-500 font-medium">Selected File: {file.name}</div>
          )}
        </div>

        {/* JD input — required upfront since the backend needs both resume + JD to run analysis */}
        {file && status !== "done" && (
          <div className="col-span-12 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm animate-slide-up">
            <div className="text-[14.5px] font-semibold text-ink-900 border-b border-border-soft pb-2">
              Job you're applying for
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-ink-600">Role Title</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-3.5 text-ink-400" />
                  <input
                    type="text"
                    value={jdRole}
                    onChange={(e) => setJdRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full rounded-lg border border-border bg-canvas pl-9 pr-3 py-2.5 text-[13px] text-ink-900 outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-ink-600">Company Name</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-3.5 text-ink-400" />
                  <input
                    type="text"
                    value={jdCompany}
                    onChange={(e) => setJdCompany(e.target.value)}
                    placeholder="e.g. TalentFlow AI"
                    className="w-full rounded-lg border border-border bg-canvas pl-9 pr-3 py-2.5 text-[13px] text-ink-900 outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-ink-600">Paste Job Description</label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job requirements here…"
                rows={5}
                className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2.5 text-[13px] text-ink-900 outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={!jdRole.trim() || !jdCompany.trim() || !jdText.trim() || isBusy}
              className="flex w-fit items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {statusLabel}
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Run Analysis
                </>
              )}
            </button>

            {status === "error" && (
              <div className="text-[12.5px] font-medium text-danger">{errorMsg}</div>
            )}
          </div>
        )}

        {/* Results */}
        {status === "done" && report && (
          <>
            <div className="col-span-12 flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm animate-slide-up">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-ink-900 truncate">{file.name}</div>
                <div className="text-[12px] text-ink-400">
                  {jdRole} at {jdCompany}
                </div>
              </div>
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-[11.5px] font-semibold text-success">
                <CheckCircle2 size={13} />
                {report.status === "PARTIAL" ? "Partially complete" : "Analysis complete"}
              </span>

              <button
                onClick={downloadReport}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-2 text-[12.5px] font-semibold text-ink-700 hover:bg-gray-50 transition-colors"
              >
                <Download size={13} />
                Download report
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-2 text-[12.5px] font-semibold text-ink-700 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={13} />
                Start over
              </button>
            </div>

            <div className="col-span-12 md:col-span-6 flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="text-[14.5px] font-semibold text-ink-900 border-b border-border-soft pb-2">
                Scores
              </div>
              {report.atsScore != null && (
                <ScoreBar label="ATS Score" score={Math.round(report.atsScore)} />
              )}
              {report.matchPercentage != null && (
                <ScoreBar label="Job Match" score={Math.round(report.matchPercentage)} />
              )}
              {report.recruiterDecision && (
                <div className="flex items-center justify-between text-[13px] pt-2 border-t border-border-soft">
                  <span className="font-medium text-ink-900">Recruiter Decision</span>
                  <span className="font-semibold text-primary">{report.recruiterDecision}</span>
                </div>
              )}
            </div>

            <div className="col-span-12 md:col-span-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[14.5px] font-semibold text-ink-900 border-b border-border-soft pb-2">
                <AlertTriangle size={16} className="text-orange-500" />
                Feedback
              </div>
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {feedbackLines.length > 0 ? (
                  feedbackLines.map((line, i) => (
                    <div key={i} className="text-[13px] text-ink-700 border-b border-border-soft pb-2">
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="text-[13px] text-ink-400">No feedback returned.</div>
                )}
              </div>
            </div>

            {report.coverLetter && (
              <div className="col-span-12 flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="text-[14.5px] font-semibold text-ink-900 border-b border-border-soft pb-2">
                  Generated Cover Letter
                </div>
                <p className="text-[13px] text-ink-700 whitespace-pre-line">{report.coverLetter}</p>
              </div>
            )}

            {report.emailDraft && (
              <div className="col-span-12 flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="text-[14.5px] font-semibold text-ink-900 border-b border-border-soft pb-2">
                  Draft Outreach Email
                </div>
                <p className="text-[13px] text-ink-700 whitespace-pre-line">{report.emailDraft}</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}