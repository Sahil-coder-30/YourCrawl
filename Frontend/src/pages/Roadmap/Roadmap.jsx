import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Plus,
  Ban,
  EyeOff,
  AlertCircle,
  Timer,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import AppLayout from "../../components/AppLayout/AppLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { remediationTasks, remediationTimeline } from "../../data/mockData";

const iconMap = {
  ban: Ban,
  "eye-off": EyeOff,
  alert: AlertCircle,
  timer: Timer,
};

const priorityStyles = {
  CRITICAL: "bg-rose-100 text-rose-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  LOW: "bg-slate-100 text-slate-600",
};

function HealthFooter() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Health Score
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[26px] font-extrabold text-slate-900">74%</span>
        <span className="text-[12px] font-semibold text-rose-500">+4.2%</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[74%] rounded-full bg-blue-600" />
      </div>
    </div>
  );
}

export default function Roadmap() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [resolved, setResolved] = useState(new Set());

  const filters = [
    { id: "all", label: "All Tasks" },
    { id: "high", label: "High Priority" },
    { id: "penalty", label: "Risk Penalty" },
    { id: "assigned", label: "Assigned" },
  ];

  const visible = remediationTasks.filter((t) => {
    if (resolved.has(t.id)) return false;
    if (filter === "high" && !["CRITICAL", "HIGH"].includes(t.priority)) return false;
    if (filter === "assigned" && t.assignee.name === "Unassigned") return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const maxVal = Math.max(
    ...remediationTimeline.map((m) => Math.max(m.resolved, m.projected))
  );

  return (
    <AppLayout sidebarFooter={<HealthFooter />}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
            Remediation Roadmap
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Surgical corrections for identified dark patterns and deceptive UI
            elements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            data-testid="roadmap-export-btn"
            variant="outline"
            className="h-10 rounded-lg border-slate-200 bg-white text-[13px] font-semibold text-slate-700"
            onClick={() => toast.success("Report export queued")}
          >
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
          <Button
            data-testid="create-audit-task-btn"
            onClick={() => navigate("/config")}
            className="h-10 rounded-lg bg-blue-600 text-[13px] font-semibold hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Audit Task
          </Button>
        </div>
      </div>

      {/* Stat Row */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active Risks
          </div>
          <div className="mt-3 text-[40px] font-extrabold leading-none text-slate-900">
            {remediationTasks.length - resolved.size}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-600">
            <span>⚠</span> 3 Critical Fixes Required
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Risk Penalty
          </div>
          <div className="mt-3 text-[40px] font-extrabold leading-none text-rose-600">
            $1.2M
          </div>
          <div className="mt-3 text-[12.5px] text-slate-500">
            Estimated Regulatory Exposure
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Completion
          </div>
          <div className="mt-3 text-[40px] font-extrabold leading-none text-slate-900">
            {Math.min(62 + resolved.size * 4, 100)}%
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${Math.min(62 + resolved.size * 4, 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Avg. Time to Fix
          </div>
          <div className="mt-3 text-[40px] font-extrabold leading-none text-slate-900">
            4.5d
          </div>
          <div className="mt-3 text-[12.5px] text-slate-500">
            Per task remediation average
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2 pl-3 pr-1 text-[13px] text-slate-500">
          <SlidersHorizontal className="h-[16px] w-[16px]" /> Filter By:
        </div>
        <div className="h-6 w-px bg-slate-200" />
        {filters.map((f) => (
          <button
            key={f.id}
            data-testid={`filter-${f.id}`}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
              filter === f.id
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              data-testid="tasks-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="h-9 w-[260px] rounded-lg border-slate-200 bg-white pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Task Table */}
      <section
        data-testid="tasks-card"
        className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"
      >
        <div className="grid grid-cols-[1.6fr_120px_140px_160px_140px] gap-4 bg-slate-50 px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <div>Task / Dark Pattern Fix</div>
          <div>Priority</div>
          <div>Risk Penalty</div>
          <div>Assigned To</div>
          <div className="text-right">Actions</div>
        </div>

        {visible.length === 0 && (
          <div className="p-10 text-center text-[14px] text-slate-500">
            All clear. No matching remediation tasks.
          </div>
        )}

        {visible.map((t) => {
          const Icon = iconMap[t.icon] ?? AlertCircle;
          return (
            <div
              key={t.id}
              data-testid={`task-row-${t.id}`}
              className="grid grid-cols-[1.6fr_120px_140px_160px_140px] items-center gap-4 border-t border-slate-100 px-6 py-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${t.iconBg}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <div className="text-[14.5px] font-bold text-slate-900">
                    {t.title}
                  </div>
                  <p className="mt-1 max-w-[440px] text-[12.5px] leading-relaxed text-slate-500">
                    {t.description}
                  </p>
                </div>
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ${priorityStyles[t.priority]}`}
                >
                  {t.priority}
                </span>
              </div>
              <div className="font-mono text-[13px] font-semibold text-rose-600">
                {t.penalty}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-white ${t.assignee.color}`}
                >
                  {t.assignee.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="text-[13px] text-slate-700">
                  {t.assignee.name}
                </span>
              </div>
              <div className="flex justify-end">
                <Button
                  data-testid={`resolve-${t.id}`}
                  onClick={() => {
                    setResolved((prev) => new Set(prev).add(t.id));
                    toast.success(`Marked "${t.title}" as resolved`);
                  }}
                  className="h-9 rounded-lg bg-blue-600 px-4 text-[12px] font-semibold hover:bg-blue-700"
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3 text-[13px] text-slate-500">
          <span>
            Showing {visible.length} of {remediationTasks.length} items
          </span>
          <div className="flex items-center gap-1.5">
            <button className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-white">
              ‹
            </button>
            <button className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-white">
              ›
            </button>
          </div>
        </div>
      </section>

      {/* Timeline + Risk Reduction */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div
          data-testid="timeline-card"
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-bold text-slate-900">
              Remediation Timeline
            </h3>
            <div className="flex items-center gap-4 text-[12px] text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Resolved
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />{" "}
                Projected
              </span>
            </div>
          </div>
          <div className="mt-8 flex h-[200px] items-end gap-6 px-2">
            {remediationTimeline.map((m) => {
              const val = m.resolved || m.projected;
              const h = (val / maxVal) * 100;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      style={{ height: `${h}%` }}
                      className={`w-full max-w-[52px] rounded-t-md transition-all ${
                        m.resolved > 0 ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-400">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-2 text-[13px] text-blue-100">
            <TrendingUp className="h-4 w-4" /> Risk Reduction
          </div>
          <p className="mt-3 text-[14px] leading-relaxed">
            Completing the 3 critical tasks will reduce your total regulatory
            risk exposure by <span className="font-bold underline">64%</span>.
          </p>
          <div className="mt-6 rounded-xl bg-blue-800/40 p-4 ring-1 ring-white/20">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">
              GDPR Score Projection
            </div>
            <div className="mt-1 text-[26px] font-extrabold">88 / 100</div>
          </div>
          <Button
            data-testid="impact-analysis-btn"
            onClick={() => toast("Opening impact analysis...")}
            className="mt-5 h-10 w-full rounded-lg bg-white text-[13px] font-semibold text-blue-700 hover:bg-slate-100"
          >
            View Impact Analysis
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
