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
  ClipboardPaste,
  Building2,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import PageHeader from "../components/PageHeader";

const SEVERITY_STYLE = {
  high: "bg-danger-soft text-danger",
  medium: "bg-orange-50 text-orange-700",
  low: "bg-gray-100 text-ink-500",
};

const RESUME_HISTORY_KEY = "resumeAnalyses";
const JOBS_STORAGE_KEY = "user_job_descriptions";
const ROADMAP_SKILLS_KEY = "roadmapSkills";

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
      <span className="text-[12px] text-ink-400">{note}</span>
    </div>
  );
}

export default function ResumeAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | analyzing | done | error
  const [result, setResult] = useState(null);

  // JD matcher states
  const [jdRole, setJdRole] = useState("");
  const [jdCompany, setJdCompany] = useState("");
  const [jdText, setJdText] = useState("");
  const [matchStatus, setMatchStatus] = useState("idle"); // idle | matching | done
  const [matchResult, setMatchResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setStatus("idle");
      setResult(null);
    }
  };

  // Save this analysis into localStorage history
  const saveAnalysisToHistory = (fileName, data) => {
    try {
      const existing = JSON.parse(localStorage.getItem(RESUME_HISTORY_KEY) || "[]");
      const entry = {
        id: "analysis-" + Date.now(),
        type: "resume",
        date: new Date().toISOString(),
        fileName,
        atsScore: data.atsScore,
        scoreBreakdown: data.scoreBreakdown,
        skillGaps: data.skillGaps,
      };
      localStorage.setItem(RESUME_HISTORY_KEY, JSON.stringify([entry, ...existing]));
    } catch (err) {
      console.error("Failed to save analysis history", err);
    }
  };

  const analyzeResume = async () => {
    if (!file) return;
    setStatus("analyzing");

    try {
      // simulated AI analysis latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const data = {
        atsScore: 87,
        scoreBreakdown: [
          { label: "Formatting & structure", score: 92, note: "Clean sections, ATS-parseable" },
          { label: "Keyword relevance", score: 78, note: "Missing 4 high-priority terms" },
          { label: "Quantified impact", score: 65, note: "6 of 11 bullets lack metrics" },
          { label: "Length & readability", score: 95, note: "Well within 2-page guideline" },
        ],
        skillGaps: [
          { skill: "Design Systems", severity: "high" },
          { skill: "GraphQL", severity: "medium" },
          { skill: "A/B Testing", severity: "medium" },
          { skill: "Figma Variables", severity: "low" },
        ],
      };

      setResult(data);
      setStatus("done");
      saveAnalysisToHistory(file.name, data);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setJdRole("");
    setJdCompany("");
    setJdText("");
    setMatchStatus("idle");
    setMatchResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Save matched job dynamically into user_job_descriptions
  const matchAgainstJD = async () => {
    if (!jdText.trim() || !jdRole.trim() || !jdCompany.trim()) return;
    setMatchStatus("matching");

    try {
      // Simulated AI Matching evaluation
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const matchScore = Math.min(98, Math.max(40, Math.floor(Math.random() * 40) + 55)); // 55% - 95%
      
      const data = {
        matchPercent: matchScore,
        matchedKeywords: ["React", "TypeScript", "Tailwind CSS", "Vite"],
        missingKeywords: result?.skillGaps.map(g => g.skill) || ["GraphQL", "Design Systems"],
      };

      const matchedStatus = matchScore >= 75 ? "Approved" : matchScore >= 50 ? "Pending" : "Rejected";

      // Write straight to job descriptions database key
      const newlyMatchedJob = {
        id: "job-" + Date.now(),
        role: jdRole.trim(),
        company: jdCompany.trim(),
        match: matchScore,
        status: matchedStatus,
        description: jdText.trim(),
        added: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };

      const existingJobs = JSON.parse(localStorage.getItem(JOBS_STORAGE_KEY) || "[]");
      // Prevent legacy mock elements from creeping back in during array transformations
      const cleanedExisting = existingJobs.filter(
        (job) => !["Linear", "Notion", "Vercel", "Stripe", "Figma", "Airbnb"].includes(job.company)
      );

      const updatedJobs = [newlyMatchedJob, ...cleanedExisting];
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
      
      // Dispatch storage update so sidebar dynamic counts synchronize instantly
      window.dispatchEvent(new Event("storage"));

      setMatchResult(data);
      setMatchStatus("done");
    } catch (err) {
      console.error(err);
      setMatchStatus("idle");
    }
  };

  // Generates learning milestones on Roadmap page using the parsed skill gaps
  const handleGenerateRoadmap = () => {
    if (!result) return;
    const roadmapData = {
      source: file ? file.name : "Resume Analysis",
      skills: result.skillGaps.map(g => ({
        skill: g.skill,
        severity: g.severity
      }))
    };
    localStorage.setItem(ROADMAP_SKILLS_KEY, JSON.stringify(roadmapData));
    navigate("/roadmap");
  };

  const downloadReport = () => {
    if (!result) return;

    const lines = [
      `AI Career Coach — Resume Analysis Report`,
      `File: ${file?.name ?? "N/A"}`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `ATS Score: ${result.atsScore}/100`,
      ``,
      `Score Breakdown:`,
      ...result.scoreBreakdown.map((s) => `- ${s.label}: ${s.score}/100 (${s.note})`),
      ``,
      `Skill Gaps:`,
      ...result.skillGaps.map((g) => `- ${g.skill} [${g.severity}]`),
    ];

    if (matchResult) {
      lines.push(
        ``,
        `Matched Job: ${jdRole} at ${jdCompany}`,
        `Job Description Match: ${matchResult.matchPercent}%`,
        `Matched keywords: ${matchResult.matchedKeywords.join(", ")}`,
        `Missing keywords: ${matchResult.missingKeywords.join(", ")}`
      );
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-analysis-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Resume Analysis"
        subtitle="Upload a resume to get an ATS score, keyword match, and improvement suggestions."
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

            {file && status !== "done" && (
              <button
                onClick={analyzeResume}
                disabled={status === "analyzing"}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {status === "analyzing" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Analyze Resume
                  </>
                )}
              </button>
            )}
          </div>

          {file && (
            <div className="mt-2 text-[12px] text-ink-500 font-medium">Selected File: {file.name}</div>
          )}
          {status === "error" && (
            <div className="mt-2 text-[12px] font-medium text-danger">
              Something went wrong during parsing. Please try again.
            </div>
          )}
        </div>

        {/* Currently analyzed file banner */}
        {status === "done" && result && (
          <div className="col-span-12 flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm animate-slide-up">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-ink-900 truncate">{file.name}</div>
              <div className="text-[12px] text-ink-400">Analyzed just now</div>
            </div>
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-[11.5px] font-semibold text-success">
              <CheckCircle2 size={13} />
              ATS Score {result.atsScore}/100
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
              Replace file
            </button>
          </div>
        )}

        {/* Score breakdown */}
        {status === "done" && result && (
          <div className="col-span-12 md:col-span-7 flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="text-[14.5px] font-semibold text-ink-900 border-b border-border-soft pb-2">Score breakdown</div>
            {result.scoreBreakdown.map((s) => (
              <ScoreBar key={s.label} {...s} />
            ))}
          </div>
        )}

        {/* Skill gaps & Roadmap redirect */}
        {status === "done" && result && (
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[14.5px] font-semibold text-ink-900 border-b border-border-soft pb-2">
              <AlertTriangle size={16} className="text-orange-500" />
              Skill gaps identified
            </div>
            <div className="flex flex-col gap-2.5 max-h-[190px] overflow-y-auto pr-1">
              {result.skillGaps.map((g) => (
                <div key={g.skill} className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2">
                  <span className="text-[13px] font-medium text-ink-900">{g.skill}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${SEVERITY_STYLE[g.severity]}`}>
                    {g.severity}
                  </span>
                </div>
              ))}
            </div>
            <button 
              onClick={handleGenerateRoadmap}
              className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary-soft py-2.5 text-[12.5px] font-semibold text-primary hover:bg-primary hover:text-white transition-all duration-200"
            >
              <Sparkles size={14} />
              Generate learning roadmap
            </button>
          </div>
        )}

        {/* Connected JD Matcher Panel */}
        {status === "done" && result && (
          <div className="col-span-12 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[14.5px] font-semibold text-ink-900 border-b border-border-soft pb-2">
              <ClipboardPaste size={16} className="text-primary" />
              Match against a job description
            </div>
            
            {/* Job Meta Input Rows */}
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

            {/* Description Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-ink-600">Paste Job Requirements / JD Text</label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the target job description requirements here to run comparative parsing..."
                rows={5}
                className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2.5 text-[13px] text-ink-900 outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={matchAgainstJD}
              disabled={!jdText.trim() || !jdRole.trim() || !jdCompany.trim() || matchStatus === "matching"}
              className="flex w-fit items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {matchStatus === "matching" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Running AI Evaluation…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Match Against JD
                </>
              )}
            </button>

            {/* Match output view */}
            {matchStatus === "done" && matchResult && (
              <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border-soft bg-canvas p-5 animate-slide-up">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink-900">Calculated Match Score</span>
                  <span className="text-[16px] font-bold text-primary">
                    {matchResult.matchPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${matchResult.matchPercent}%` }}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="text-[12px] font-medium text-ink-500 mb-1">Keywords Map</div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchedKeywords.map((k) => (
                      <span key={k} className="rounded-md bg-success-soft px-2 py-1 text-[10.5px] font-semibold text-success">
                        ✓ {k}
                      </span>
                    ))}
                    {matchResult.missingKeywords.map((k) => (
                      <span key={k} className="rounded-md bg-danger-soft px-2 py-1 text-[10.5px] font-semibold text-danger">
                        ✗ {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Redirect Prompt to the JDs page */}
                <div className="mt-2 pt-4 border-t border-border-soft flex items-center justify-between">
                  <div className="text-[12px] text-ink-500">
                    This role has been parsed and saved to your <strong>Job Descriptions</strong> tab!
                  </div>
                  <button 
                    onClick={() => navigate("/job-descriptions")}
                    className="flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline"
                  >
                    View in Job Board
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}