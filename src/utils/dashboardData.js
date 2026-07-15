const RESUME_HISTORY_KEY = "resumeAnalyses";
const INTERVIEW_HISTORY_KEY = "mockInterviewSessions";

function safeParse(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function getResumeAnalyses() {
  return safeParse(RESUME_HISTORY_KEY).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}

export function getInterviewSessions() {
  return safeParse(INTERVIEW_HISTORY_KEY).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Builds everything the Dashboard needs in one pass over real data
export function buildDashboardData() {
  const resumes = getResumeAnalyses();
  const interviews = getInterviewSessions();

  const latestResume = resumes[resumes.length - 1] ?? null;
  const previousResume = resumes[resumes.length - 2] ?? null;

  const avgInterviewScore =
    interviews.length > 0
      ? Math.round(interviews.reduce((sum, s) => sum + s.score, 0) / interviews.length)
      : null;

  const metrics = [
    {
      label: "ATS Score",
      value: latestResume ? String(latestResume.atsScore) : "—",
      unit: latestResume ? "/100" : "",
      note: latestResume
        ? previousResume
          ? `${latestResume.atsScore >= previousResume.atsScore ? "+" : ""}${
              latestResume.atsScore - previousResume.atsScore
            } pts vs last analysis`
          : "First analysis on record"
        : "Run a resume analysis to see this",
      trend:
        latestResume && previousResume
          ? latestResume.atsScore >= previousResume.atsScore
            ? "up"
            : "down"
          : null,
      delta:
        latestResume && previousResume
          ? `${latestResume.atsScore >= previousResume.atsScore ? "+" : ""}${
              latestResume.atsScore - previousResume.atsScore
            }`
          : null,
      accent: "primary",
    },
    {
      label: "Resume Analyses",
      value: String(resumes.length),
      note: resumes.length > 0 ? "Total analyses run" : "None yet",
      accent: "neutral",
    },
    {
      label: "Interview Sessions",
      value: String(interviews.length),
      note: interviews.length > 0 ? "Mock interviews completed" : "None yet",
      accent: "warning",
    },
    {
      label: "Avg Interview Score",
      value: avgInterviewScore !== null ? `${avgInterviewScore}%` : "—",
      note: avgInterviewScore !== null ? "Across all sessions" : "Practice to see this",
      accent: "success",
    },
  ];

  const trendData = resumes.map((r) => ({
    date: formatShortDate(r.date),
    atsScore: r.atsScore,
  }));

  const activity = [...resumes, ...interviews]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((entry) => {
      if (entry.fileName) {
        return {
          type: "analysis",
          title: "Resume analyzed",
          meta: `${entry.fileName} · ATS score ${entry.atsScore}/100`,
          time: formatShortDate(entry.date),
        };
      }
      return {
        type: "interview",
        title: "Mock interview completed",
        meta: `${entry.category} · ${entry.difficulty} · Score ${entry.score}%`,
        time: formatShortDate(entry.date),
      };
    });

  return { resumes, interviews, latestResume, metrics, trendData, activity };
}