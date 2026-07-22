import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessagesSquare,
  TrendingUp,
  History,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Resume Analysis", to: "/resume-analysis", icon: FileText },
  { label: "Job Descriptions", to: "/job-descriptions", icon: Briefcase },
  { label: "Interview Prep", to: "/interview-prep", icon: MessagesSquare },
  { label: "Roadmap", to: "/roadmap", icon: TrendingUp },
  { label: "History", to: "/history", icon: History },
];

const ACCOUNT_ITEMS = [{ label: "Profile", to: "/profile", icon: User }];

function NavItem({ to, icon: Icon, label, count, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
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

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  const namePart = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const parts = namePart.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const displayName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";
  const initials = getInitials(currentUser?.displayName || currentUser?.email);

  const content = (
    <>
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-700 text-[13px] font-bold text-white">
          AC
        </div>
        <div className="flex-1">
          <div className="text-[14.5px] font-bold tracking-tight text-ink-900">
            AI Career Coach
          </div>
          <div className="-mt-0.5 text-[10.5px] font-medium text-ink-400">Workspace</div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-ink-500 hover:bg-gray-100 lg:hidden">
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} onClick={onClose} />
        ))}
        <div className="mb-1.5 mt-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Account
        </div>
        {ACCOUNT_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} onClick={onClose} />
        ))}
      </nav>

      <NavLink
        to="/profile"
        onClick={onClose}
        className="mt-auto flex items-center gap-2.5 border-t border-border pt-3.5 pl-2"
      >
        {currentUser?.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={displayName}
            className="h-[30px] w-[30px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-ink-900 text-[12px] font-semibold text-white">
            {initials}
          </div>
        )}
        <div>
          <div className="text-[12.5px] font-semibold text-ink-900">{displayName}</div>
          <div className="text-[11px] text-ink-400">Free plan</div>
        </div>
      </NavLink>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="sticky top-0 hidden h-screen w-[260px] flex-col gap-7 border-r border-border bg-card p-4 lg:flex">
        {content}
      </aside>

      {/* Mobile/tablet drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 flex h-screen w-[260px] max-w-[80vw] flex-col gap-7 border-r border-border bg-card p-4 shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
