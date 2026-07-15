import { useState, useEffect } from "react";
import {
  MessagesSquare,
  ChevronDown,
  RefreshCcw,
  Play,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
  RotateCcw,
} from "lucide-react";
import PageHeader from "../components/PageHeader";

// ---- Question bank: category -> difficulty -> questions ----
const questionBank = {
  Behavioral: {
    easy: [
      "Tell me about a time you helped a teammate who was stuck.",
      "Describe a piece of feedback that changed how you work.",
    ],
    medium: [
      "Tell me about a time you disagreed with a design decision and how you resolved it.",
      "Describe a project where you had to influence without direct authority.",
    ],
    hard: [
      "Tell me about a time you had to deliver a decision that was unpopular with your team.",
      "Describe the biggest failure in your career and what you changed afterward.",
    ],
  },
  Technical: {
    easy: [
      "What's the difference between props and state in React?",
      "How do you decide when to use a REST API vs GraphQL?",
    ],
    medium: [
      "How would you architect a design system that scales across five product teams?",
      "Walk me through how you'd debug a performance regression in a React app.",
    ],
    hard: [
      "How would you design a real-time collaborative editor from scratch?",
      "How would you migrate a monolith to microservices with zero downtime?",
    ],
  },
  "Role-specific": {
    easy: [
      "What excites you most about this role?",
      "How do you stay current with trends in your field?",
    ],
    medium: [
      "This role leans heavily on 0-to-1 work — tell me about a product you built from scratch.",
      "How do you balance shipping speed with design quality under tight deadlines?",
    ],
    hard: [
      "How would you handle a founder who keeps overriding your product decisions?",
      "Walk me through how you'd prioritize a roadmap with conflicting stakeholder demands.",
    ],
  },
};

const CATEGORY_COLOR = {
  Behavioral: "bg-primary-soft text-primary",
  Technical: "bg-success-soft text-success",
  "Role-specific": "bg-orange-50 text-orange-700",
};

const DIFFICULTIES = ["easy", "medium", "hard"];
const QUESTION_COUNTS = [3, 5, 7];
const HISTORY_KEY = "mockInterviewSessions";

// Very simple heuristic "AI feedback" mock — swap for a real backend call later
function getMockFeedback(answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) {
    return { label: "Skipped", tone: "bg-gray-100 text-ink-500", tip: "You left this blank — try answering out loud next time, even briefly." };
  }
  if (words < 20) {
    return { label: "Too brief", tone: "bg-orange-50 text-orange-700", tip: "Add more detail: what was the outcome, and what did you learn?" };
  }
  if (words < 60) {
    return { label: "Good length", tone: "bg-primary-soft text-primary", tip: "Solid answer — try quantifying the impact for extra polish." };
  }
  return { label: "Detailed", tone: "bg-success-soft text-success", tip: "Great depth — aim to keep it under ~90 seconds when speaking aloud." };
}

function scoreFromAnswers(answers) {
  if (answers.length === 0) return 0;
  const total = answers.reduce((sum, a) => {
    const words = a.trim().split(/\s+/).filter(Boolean).length;
    return sum + Math.min(100, Math.round((words / 60) * 100));
  }, 0);
  return Math.round(total / answers.length);
}

export default function InterviewPrep() {
  // ---- existing question browser state ----
  const [openCategory, setOpenCategory] = useState("Behavioral");
  const [browseQuestions, setBrowseQuestions] = useState(() =>
    Object.fromEntries(
      Object.entries(questionBank).map(([cat, byDiff]) => [cat, byDiff.medium])
    )
  );
  const [regenerating, setRegenerating] = useState(false);

  // ---- mock interview flow state ----
  const [view, setView] = useState("browse"); // browse | setup | session | summary
  const [setupCategory, setSetupCategory] = useState("Behavioral");
  const [setupDifficulty, setSetupDifficulty] = useState("medium");
  const [setupCount, setSetupCount] = useState(3);

  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [history, setHistory] = useState([]);
  const [lastSessionScore, setLastSessionScore] = useState(null);
  const [finalScore, setFinalScore] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, []);

  // ---- Regenerate: reshuffle displayed questions in the browser ----
  const regenerate = async () => {
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 700));
    const next = {};
    for (const [cat, byDiff] of Object.entries(questionBank)) {
      const pool = [...byDiff.easy, ...byDiff.medium, ...byDiff.hard];
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      next[cat] = shuffled.slice(0, 2);
    }
    setBrowseQuestions(next);
    setRegenerating(false);
  };

  // ---- "Practice this set" jumps into setup, prefilled with that category ----
  const startSetupFor = (category) => {
    setSetupCategory(category);
    setView("setup");
  };

  const startSession = () => {
    const pool = questionBank[setupCategory][setupDifficulty];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    // repeat/pad the pool if user asks for more questions than we have
    const picked = Array.from({ length: setupCount }, (_, i) => shuffled[i % shuffled.length]);

    setSessionQuestions(picked);
    setCurrentIndex(0);
    setCurrentAnswer("");
    setAnswers([]);
    setFeedbacks([]);
    setFinalScore(null);
    setView("session");
  };

  const submitAnswer = async () => {
    setSubmitting(true);
    // Mock "AI evaluating your answer" delay — replace with a real Gemini/LangChain call later
    await new Promise((r) => setTimeout(r, 900));

    const feedback = getMockFeedback(currentAnswer);
    const nextAnswers = [...answers, currentAnswer];
    const nextFeedbacks = [...feedbacks, feedback];
    setAnswers(nextAnswers);
    setFeedbacks(nextFeedbacks);
    setSubmitting(false);

    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer("");
    } else {
      const score = scoreFromAnswers(nextAnswers);
      setFinalScore(score);

      const previousLast = history.length > 0 ? history[history.length - 1].score : null;
      setLastSessionScore(previousLast);

      const entry = {
        date: new Date().toISOString(),
        category: setupCategory,
        difficulty: setupDifficulty,
        score,
      };
      const updatedHistory = [...history, entry];
      setHistory(updatedHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

      setView("summary");
    }
  };

  const restart = () => {
    setView("setup");
    setCurrentIndex(0);
    setCurrentAnswer("");
    setAnswers([]);
    setFeedbacks([]);
  };

  const backToBrowse = () => setView("browse");

  // ================= SETUP VIEW =================
  if (view === "setup") {
    return (
      <main className="flex flex-col gap-6 p-6">
        <PageHeader title="Start a Mock Interview" subtitle="Set up your practice session." />
        <div className="col-span-12 flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm max-w-xl">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-ink-900">Category</div>
            <div className="flex gap-2">
              {Object.keys(questionBank).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSetupCategory(cat)}
                  className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold ${
                    setupCategory === cat
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border text-ink-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-ink-900">Difficulty</div>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSetupDifficulty(d)}
                  className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold capitalize ${
                    setupDifficulty === d
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border text-ink-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-ink-900">Number of questions</div>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSetupCount(n)}
                  className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold ${
                    setupCount === n
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border text-ink-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={startSession}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm"
            >
              <Play size={14} />
              Start Interview
            </button>
            <button
              onClick={backToBrowse}
              className="rounded-lg border border-border bg-canvas px-4 py-2.5 text-[13px] font-semibold text-ink-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ================= SESSION VIEW =================
  if (view === "session") {
    const question = sessionQuestions[currentIndex];
    const isLast = currentIndex === sessionQuestions.length - 1;

    return (
      <main className="flex flex-col gap-6 p-6">
        <PageHeader
          title="Mock Interview in progress"
          subtitle={`${setupCategory} · ${setupDifficulty} · Question ${currentIndex + 1} of ${sessionQuestions.length}`}
        />

        <div className="h-1.5 w-full max-w-2xl overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((currentIndex) / sessionQuestions.length) * 100}%` }}
          />
        </div>

        <div className="flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${CATEGORY_COLOR[setupCategory]}`}>
              <MessagesSquare size={16} />
            </div>
            <div className="text-[14px] font-semibold text-ink-900">{question}</div>
          </div>

          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here…"
            rows={6}
            className="w-full resize-none rounded-lg border border-border bg-canvas px-3 py-2.5 text-[13px] text-ink-900 outline-none focus:border-primary"
          />

          <button
            onClick={submitAnswer}
            disabled={submitting}
            className="flex w-fit items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Evaluating…
              </>
            ) : (
              <>
                {isLast ? "Finish Interview" : "Next Question"}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </main>
    );
  }

  // ================= SUMMARY VIEW =================
  if (view === "summary") {
    const delta = lastSessionScore !== null ? finalScore - lastSessionScore : null;

    return (
      <main className="flex flex-col gap-6 p-6">
        <PageHeader title="Session Summary" subtitle={`${setupCategory} · ${setupDifficulty}`} />

        <div className="flex max-w-2xl items-center gap-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div>
            <div className="text-[12.5px] text-ink-500">Overall score</div>
            <div className="text-[32px] font-bold tracking-tight">{finalScore}%</div>
          </div>
          {delta !== null && (
            <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${delta >= 0 ? "text-success" : "text-danger"}`}>
              {delta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {delta >= 0 ? "+" : ""}
              {delta}% vs last session ({lastSessionScore}%)
            </div>
          )}
          {delta === null && (
            <div className="text-[13px] text-ink-400">This is your first recorded session.</div>
          )}
        </div>

        <div className="flex max-w-2xl flex-col gap-4">
          {sessionQuestions.map((q, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="text-[13px] font-semibold text-ink-900">Q{i + 1}. {q}</div>
              <div className="mt-2 text-[13px] text-ink-700">
                {answers[i]?.trim() ? answers[i] : <span className="text-ink-400">No answer given</span>}
              </div>
              <div className="mt-3 flex items-start gap-2">
                <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${feedbacks[i]?.tone}`}>
                  {feedbacks[i]?.label}
                </span>
                <span className="text-[12px] text-ink-500">{feedbacks[i]?.tip}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex max-w-2xl gap-3">
          <button
            onClick={restart}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm"
          >
            <RotateCcw size={14} />
            Practice Again
          </button>
          <button
            onClick={backToBrowse}
            className="rounded-lg border border-border bg-canvas px-4 py-2.5 text-[13px] font-semibold text-ink-700"
          >
            Back to Interview Prep
          </button>
        </div>
      </main>
    );
  }

  // ================= BROWSE VIEW (default) =================
  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Interview Prep"
        subtitle="Practice questions generated from your target role: Senior Frontend Engineer at Linear."
        action={
          <div className="flex gap-2">
            <button
              onClick={regenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-ink-700 shadow-sm disabled:opacity-60"
            >
              {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
              Regenerate
            </button>
            <button
              onClick={() => setView("setup")}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm"
            >
              <Play size={14} />
              Start Mock Interview
            </button>
          </div>
        }
      />

      {history.length > 0 && (
        <div className="flex items-center gap-2 text-[12.5px] text-ink-500">
          <CheckCircle2 size={14} className="text-success" />
          Last session: {history[history.length - 1].category} ({history[history.length - 1].difficulty}) —{" "}
          <span className="font-semibold text-ink-900">{history[history.length - 1].score}%</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {Object.entries(browseQuestions).map(([catName, questions]) => {
          const isOpen = openCategory === catName;
          return (
            <div key={catName} className="rounded-xl border border-border bg-card shadow-sm">
              <button
                onClick={() => setOpenCategory(isOpen ? null : catName)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${CATEGORY_COLOR[catName]}`}>
                  <MessagesSquare size={16} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-ink-900">{catName}</div>
                  <div className="text-[12px] text-ink-400">{questions.length} questions</div>
                </div>
                <ChevronDown
                  size={16}
                  className={`ml-auto text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="flex flex-col gap-3 border-t border-border-soft px-5 py-4 pl-[68px]">
                  {questions.map((q, i) => (
                    <div key={i} className="flex gap-3 text-[13.5px] leading-relaxed text-ink-700">
                      <span className="font-semibold text-ink-400">Q{i + 1}</span>
                      {q}
                    </div>
                  ))}
                  <button
                    onClick={() => startSetupFor(catName)}
                    className="mt-1 flex w-fit items-center gap-1.5 text-[12.5px] font-semibold text-primary"
                  >
                    <Sparkles size={13} />
                    Practice this set →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}