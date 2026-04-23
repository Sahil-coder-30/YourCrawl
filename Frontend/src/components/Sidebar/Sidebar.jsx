import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Settings,
  BarChart3,
  LineChart,
  ShieldCheck,
} from "lucide-react";

const links = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutGrid, id: "dashboard" },
  { label: "Config", to: "/config", icon: Settings, id: "config" },
  { label: "Analysis", to: "/analysis", icon: BarChart3, id: "analysis" },
  { label: "Roadmap", to: "/roadmap", icon: LineChart, id: "roadmap" },
  { label: "Compliance", to: "/compliance", icon: ShieldCheck, id: "compliance" },
];

export default function Sidebar({ footer }) {
  return (
    <aside
      data-testid="sidebar"
      className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[260px] shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-5 pb-6 pt-8 lg:flex"
    >
      <div>
        <div className="mb-8 flex items-start gap-3 px-2">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-[17px] font-extrabold text-slate-900">
              Aegis Auditor
            </div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Institutional Compliance
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map(({ label, to, icon: Icon, id }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`sidebar-${id}`}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {footer && <div className="px-2">{footer}</div>}
    </aside>
  );
}
