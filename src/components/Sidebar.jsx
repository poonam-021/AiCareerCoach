import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessagesSquare,
  TrendingUp,
  History,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Resume Analysis", to: "/resume-analysis", icon: FileText },
  { label: "Job Descriptions", to: "/job-descriptions", icon: Briefcase, count: 6 },
  { label: "Interview Prep", to: "/interview-prep", icon: MessagesSquare },
  { label: "Roadmap", to: "/roadmap", icon: TrendingUp },
  { label: "History", to: "/history", icon: History },
];

const ACCOUNT_ITEMS = [{ label: "Profile", to: "/profile", icon: User }];

function NavItem({ to, icon: Icon, label, count }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
          isActive ? "bg-primary-soft text-primary" : "text-ink-700 hover:bg-gray-100"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? "text-primary" : "text-ink-400"} />
          {label}
          {count && (
            <span className="ml-auto rounded-full bg-border-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-500">
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[260px] flex-col gap-7 border-r border-border bg-card p-4">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-700 text-[13px] font-bold text-white">
          AC
        </div>
        <div>
          <div className="text-[14.5px] font-bold tracking-tight text-ink-900">
            AI Career Coach
          </div>
          <div className="-mt-0.5 text-[10.5px] font-medium text-ink-400">Workspace</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}

        <div className="mb-1.5 mt-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Account
        </div>
        {ACCOUNT_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      <NavLink to="/profile" className="mt-auto flex items-center gap-2.5 border-t border-border pt-3.5 pl-2">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-ink-900 text-[12px] font-semibold text-white">
          JS
        </div>
        <div>
          <div className="text-[12.5px] font-semibold text-ink-900">Jordan Silva</div>
          <div className="text-[11px] text-ink-400">Pro plan</div>
        </div>
      </NavLink>
    </aside>
  );
}
