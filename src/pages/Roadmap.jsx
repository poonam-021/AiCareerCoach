import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ExternalLink, Compass } from "lucide-react";
import PageHeader from "../components/PageHeader";

const ROADMAP_SKILLS_KEY = "roadmapSkills";

// Curated high-quality, targeted documentation & videos
const RESOURCE_LIBRARY = {
  "Design Systems": [
    {
      title: "Design Systems 101 - Nielsen Norman Group Comprehensive Guide",
      url: "https://www.nngroup.com/articles/design-systems-101/"
    },
    {
      title: "Atomic Design Methodology by Brad Frost",
      url: "https://atomicdesign.bradfrost.com/chapter-1/"
    }
  ],
  GraphQL: [
    {
      title: "Odyssey: Schema Design Fundamentals by Apollo",
      url: "https://www.apollographql.com/tutorials/schema-design"
    },
    {
      title: "Advanced Caching Strategies - Apollo Client Documentation",
      url: "https://www.apollographql.com/docs/apollo-client/caching/overview"
    }
  ],
  "A/B Testing": [
    {
      title: "A Refresher on Statistical Significance in A/B Testing (HBR)",
      url: "https://hbr.org/2016/03/a-refresher-on-statistical-significance"
    },
    {
      title: "Feature Flags & Progressive Rollouts Strategy - Optimizely Hub",
      url: "https://www.optimizely.com/optimization-glossary/feature-flags/"
    }
  ],
  "Figma Variables": [
    {
      title: "Deep Dive Video Tutorial: Designing with Variables in Figma",
      url: "https://www.youtube.com/watch?v=DofX3N0A8_0"
    },
    {
      title: "Figma Help: Comprehensive Guide to Variables & Token Library Sets",
      url: "https://help.figma.com/hc/en-us/articles/14506821864087-Guide-to-variables-in-Figma"
    }
  ],
  SQL: [
    {
      title: "SQL Window Functions & Analytic Queries - Mode Analytics Course",
      url: "https://mode.com/sql-tutorial/sql-window-functions"
    },
    {
      title: "Query Optimization Best Practices - Google Cloud BigQuery Documentation",
      url: "https://cloud.google.com/bigquery/docs/best-practices-performance-compute"
    }
  ],
  Python: [
    {
      title: "Data Wrangling with Pandas & DataFrames - Real Python Tutorial",
      url: "https://realpython.com/pandas-dataframe/"
    },
    {
      title: "NumPy Fundamentals for Data Science - freeCodeCamp Full Course",
      url: "https://www.youtube.com/watch?v=QUT1VHiLgKQ"
    }
  ],
  Tableau: [
    {
      title: "Visualizing High-Impact Business Dashboards - Tableau On-Demand Training",
      url: "https://www.tableau.com/learn/tutorials/on-demand/dashboard-layouts-and-formatting"
    }
  ],
  Looker: [
    {
      title: "LookML Modeling & Data Governance Fundamentals - Google Cloud Boost",
      url: "https://www.cloudskillsboost.google/course_templates/629"
    }
  ],
  dbt: [
    {
      title: "Data Build Tool (dbt) Setup & Modeling Fundamentals - dbt Developer Hub",
      url: "https://docs.getdbt.com/docs/core/pip-install"
    }
  ],
  Git: [
    {
      title: "Comparing Git Version Control Workflows & Branching (Atlassian Git Guide)",
      url: "https://www.atlassian.com/git/tutorials/comparing-workflows"
    }
  ]
};

function resourcesFor(skill) {
  if (!skill) return [];
  
  // If we have an exact pre-configured resource match, use it
  if (RESOURCE_LIBRARY[skill]) {
    return RESOURCE_LIBRARY[skill];
  }
  
  // Clean string for URL safe fallback queries
  const cleanQuery = encodeURIComponent(skill);

  // Dynamic high-quality fallbacks that target specific tutorials/roadmaps rather than blank searches
  return [
    {
      title: `Curated learning path for ${skill} - Roadmap.sh Guide`,
      url: `https://www.google.com/search?q=${cleanQuery}+site:roadmap.sh`
    },
    {
      title: `Comprehensive video tutorial: Intro to ${skill} - freeCodeCamp YouTube`,
      url: `https://www.youtube.com/results?search_query=freecodecamp+${cleanQuery}`
    }
  ];
}

export default function Roadmap() {
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Fail-safe if used outside of <Router> context
    navigate = function (path) {
      window.location.pathname = path;
    };
  }

  const [roadmapSource, setRoadmapSource] = useState(null);
  const [roadmap, setRoadmap] = useState([]);

  useEffect(function () {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(ROADMAP_SKILLS_KEY) || "null");
    } catch (e) {
      saved = null;
    }

    if (saved && saved.skills && Array.isArray(saved.skills) && saved.skills.length > 0) {
      setRoadmapSource(saved);

      const built = [];
      for (let i = 0; i < saved.skills.length; i++) {
        const s = saved.skills[i];
        
        // Fail-safe handling for mixed object or string arrays in older schemas
        const skillName = typeof s === "string" ? s : (s?.skill || "Unknown Skill");
        const severityVal = typeof s === "object" && s !== null ? s.severity : "medium";

        built.push({
          skill: skillName,
          severity: severityVal,
          done: false,
          resources: resourcesFor(skillName),
        });
      }
      setRoadmap(built);
    }
  }, []);

  function toggleDone(index) {
    const updated = roadmap.map(function (item, i) {
      if (i === index) {
        return { ...item, done: !item.done };
      }
      return item;
    });
    setRoadmap(updated);
  }

  const completed = roadmap.filter(function (r) {
    return r.done;
  }).length;

  if (roadmap.length === 0) {
    return (
      <main className="flex flex-col gap-6 p-6">
        <PageHeader title="Roadmap" subtitle="A learning path generated from your skill gaps." />
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-16 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-ink-400">
            <Compass size={22} />
          </div>
          <div className="text-[14px] font-semibold text-ink-900">No roadmap yet</div>
          <div className="max-w-sm text-[12.5px] text-ink-500">
            Run a resume analysis, then click the button on the Dashboard to build a learning path here.
          </div>
          <button
            onClick={function () { navigate("/resume-analysis"); }}
            className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            Go to Resume Analysis
          </button>
        </div>
      </main>
    );
  }

  const progressPercent = (completed / roadmap.length) * 100;
  const headerSubtitle = roadmapSource
    ? "Generated from: " + (roadmapSource.source || "Recent Analysis")
    : "A learning path generated from your skill gaps.";

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader title="Roadmap" subtitle={headerSubtitle} />

      {/* Progress Bar Header Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-medium text-ink-900">Overall progress</span>
          <span className="font-semibold text-ink-700">
            {completed} of {roadmap.length} skills
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-primary" style={{ width: progressPercent + "%" }} />
        </div>
      </div>

      {/* Roadmap List Nodes */}
      <div className="flex flex-col gap-4">
        {roadmap.map(function (item, i) {
          const skillKey = item.skill || `skill-${i}`;
          const titleClass = item.done
            ? "text-[14.5px] font-semibold text-ink-500 line-through"
            : "text-[14.5px] font-semibold text-ink-900";

          // Safely extract resource arrays to avoid map errors
          const resources = Array.isArray(item.resources) ? item.resources : [];

          return (
            <div key={skillKey} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              {/* Stepper Toggle Button */}
              <button onClick={function () { toggleDone(i); }} className="flex flex-col items-center focus:outline-none">
                {item.done ? <CheckCircle2 size={22} className="text-success" /> : <Circle size={22} className="text-ink-400 hover:text-primary transition-colors" />}
                {i < roadmap.length - 1 ? <div className="mt-1 h-full w-px bg-border min-h-[24px]" /> : null}
              </button>

              {/* Skill Details & Redirect Link Node */}
              <div className="flex-1 pb-2">
                <div className={titleClass}>{item.skill}</div>
                <div className="mt-2 flex flex-col gap-1.5">
                  {resources.map(function (r, rIndex) {
                    // Safe guard title and url fallback to avoid crashes on raw strings
                    const resourceTitle = typeof r === "object" && r !== null ? r.title : String(r);
                    const resourceUrl = typeof r === "object" && r !== null ? r.url : "#";
                    const resourceKey = typeof r === "object" && r !== null ? (r.title || rIndex) : `${r}-${rIndex}`;

                    return (
                      <a 
                        key={resourceKey} 
                        href={resourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex w-fit items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-primary transition-colors duration-150"
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {resourceTitle}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}