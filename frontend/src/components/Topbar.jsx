import { Search, Bell, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  const namePart = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const parts = namePart.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Topbar({ onMenuClick }) {
  const { currentUser } = useAuth();
  const initials = getInitials(currentUser?.displayName || currentUser?.email);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-canvas/85 px-4 backdrop-blur-sm sm:gap-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="flex max-w-[420px] flex-1 items-center gap-2 rounded-[9px] border border-border bg-card px-3 py-2 text-ink-400">
        <Search size={15} className="shrink-0" />
        <input
          type="text"
          placeholder="Search…"
          className="w-full min-w-0 border-none bg-transparent font-sans text-[13px] text-ink-900 outline-none placeholder:text-ink-400"
        />
        <span className="ml-auto hidden rounded-[5px] border border-border px-1.5 py-0.5 text-[10.5px] text-ink-400 sm:inline">
          ⌘K
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2.5 sm:gap-3.5">
        <button className="relative flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-card text-ink-500">
          <Bell size={16} />
          <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full border-[1.5px] border-card bg-primary" />
        </button>
        {currentUser?.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={initials}
            className="h-[34px] w-[34px] shrink-0 cursor-pointer rounded-full object-cover"
          />
        ) : (
          <div className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 text-[12.5px] font-semibold text-white">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
