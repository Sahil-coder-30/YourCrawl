import { NavLink, Link } from "react-router-dom";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { Input } from "../../components/ui/input";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Audits", to: "/audits" },
  { label: "Analysis", to: "/analysis" },
  { label: "Roadmap", to: "/roadmap" },
  { label: "Compliance", to: "/compliance" },
];

export default function TopNav({ showSearch = true, variant = "app" }) {
  return (
    <header
      data-testid="top-nav"
      className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-8">
        <div className="flex items-center gap-12">
          <Link
            to="/"
            data-testid="brand-link"
            className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-slate-900"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-white">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </span>
            Aegis Auditor
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `relative text-[14px] font-medium transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] rounded-full bg-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                data-testid="top-search"
                placeholder="Search audits..."
                className="h-9 w-[260px] rounded-lg border-slate-200 bg-white pl-9 text-sm"
              />
            </div>
          )}
          <button
            data-testid="notifications-btn"
            className="relative grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full bg-rose-500" />
          </button>
          <div
            data-testid="user-avatar"
            className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-linear-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white ring-2 ring-white"
          >
            AC
          </div>
        </div>
      </div>
    </header>
  );
}
