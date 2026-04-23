import { useState } from "react";
import { Sparkles, Search, Filter, Download, AlertTriangle, Clock } from "lucide-react";
import AppLayout from "../../components/AppLayout/AppLayout";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { analysisFindings } from "../../data/mockData";

const severityStyles = {
  CRITICAL: "bg-rose-100 text-rose-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-slate-200 text-slate-700",
  LOW: "bg-emerald-100 text-emerald-700",
};

function PatternGraph() {
  const nodes = [
    { cx: 70, cy: 80, r: 14, color: "#f87171", opacity: 0.9 },
    { cx: 150, cy: 100, r: 10, color: "#2563eb", opacity: 0.9 },
    { cx: 210, cy: 70, r: 14, color: "#b45309", opacity: 0.9 },
    { cx: 110, cy: 140, r: 6, color: "#38bdf8" },
    { cx: 180, cy: 140, r: 6, color: "#38bdf8" },
    { cx: 50, cy: 140, r: 5, color: "#38bdf8" },
    { cx: 240, cy: 130, r: 5, color: "#38bdf8" },
    { cx: 260, cy: 80, r: 4, color: "#38bdf8" },
    { cx: 40, cy: 60, r: 4, color: "#38bdf8" },
  ];
  const edges = [
    [0, 1], [0, 3], [0, 5], [1, 2], [1, 3], [1, 4], [2, 4], [2, 6], [2, 7], [1, 8],
  ];
  return (
    <svg viewBox="0 0 300 200" className="h-[220px] w-full">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fecaca" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fecaca" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="100" r="100" fill="url(#glow)" />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke="#93c5fd"
          strokeWidth="1"
          opacity="0.6"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          fill={n.color}
          opacity={n.opacity ?? 0.5}
        />
      ))}
    </svg>
  );
}

export default function Analysis() {
  const [query, setQuery] = useState("");
  const filtered = analysisFindings.filter((f) =>
    (f.id + f.entity).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
            Analysis Findings
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-blue-600" />
            Live Session
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              data-testid="findings-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search finding ID..."
              className="h-10 w-[280px] rounded-lg border-slate-200 bg-white pl-9 text-sm"
            />
          </div>
          <Button
            data-testid="analysis-export-btn"
            onClick={() => toast.success("Report exported")}
            className="h-10 rounded-lg bg-blue-600 text-[13px] font-semibold hover:bg-blue-700"
          >
            Export Report
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_360px]">
        {/* Pattern Graph */}
        <div
          data-testid="pattern-graph-card"
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">
                Pattern Detection Graph
              </h3>
              <p className="mt-1 max-w-[220px] text-[12.5px] text-slate-500">
                Visualized clusters of regulatory deviations
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                ISO 27001
              </span>
              <span className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                SOC2 Type II
              </span>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-linear-to-br from-rose-50/50 to-slate-50 p-2">
            <PatternGraph />
          </div>
        </div>

        {/* Aggregate Risk + Critical */}
        <div className="flex flex-col gap-6">
          <div
            data-testid="aggregate-risk-card"
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Aggregate Risk Score
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[48px] font-extrabold leading-none text-rose-600">
                78.4
              </span>
              <span className="text-[14px] font-medium text-slate-500">
                / 100
              </span>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[78%] rounded-full bg-rose-500" />
            </div>
            <div className="mt-3 text-[12.5px] text-slate-500">
              12.4% increase since last audit cycle
            </div>
          </div>

          <div
            data-testid="critical-findings-card"
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Critical Findings
                </div>
                <div className="mt-3 text-[40px] font-extrabold leading-none text-slate-900">
                  14
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-md bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-[12.5px] text-slate-500">
              8 pending immediate remediation
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <aside
          data-testid="ai-insights-card"
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="h-[18px] w-[18px]" />
            <span className="text-[17px] font-bold text-slate-900">
              Aegis AI Insights
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Contextual explanation for AF-2024-001
          </p>

          <div className="mt-5 border-t border-slate-100 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Threat Vector Detection
          </div>
          <blockquote className="mt-3 rounded-lg bg-slate-50 p-4 text-[12.5px] italic leading-relaxed text-slate-700">
            “The detected IAM policy allows ‘iam:PassRole’ permissions to an
            EC2 instance profile with administrative access. This creates a
            vertical privilege escalation path from the developer environment
            to production infrastructure.”
          </blockquote>

          <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Risk Decomposition
          </div>
          <div className="mt-3 space-y-3 text-[13px]">
            {[
              ["Exploitability", 4, "bg-rose-500"],
              ["Data Exposure", 4, "bg-orange-500"],
              ["Compliance Impact", 5, "bg-rose-600"],
            ].map(([label, level, color]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-slate-700">{label}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-6 rounded-sm ${
                        i < level ? color : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border-l-[3px] border-blue-600 bg-blue-50/60 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              AI Recommendation
            </div>
            <div className="mt-2 text-[14px] font-bold text-slate-900">
              Implement Least Privilege Access
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
              Restrict the ‘PassRole’ permission to specific resource ARNs and
              use Permission Boundaries to prevent further escalation.
            </p>
          </div>

          <Button
            data-testid="auto-remediation-btn"
            onClick={() => toast.success("Auto-remediation initiated")}
            className="mt-5 h-10 w-full rounded-lg bg-slate-900 text-[13px] font-semibold text-white hover:bg-slate-800"
          >
            Apply Auto-Remediation
          </Button>

          <div className="mt-4 flex items-center gap-2 text-[11.5px] text-slate-400">
            <Clock className="h-3.5 w-3.5" /> Last processed 4 mins ago
          </div>
        </aside>
      </div>

      {/* Detailed Audit Log */}
      <section
        data-testid="detailed-log-card"
        className="mt-6 rounded-2xl border border-slate-200 bg-white"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-[17px] font-bold text-slate-900">
            Detailed Audit Log
          </h3>
          <div className="flex items-center gap-2">
            <button
              data-testid="log-filter-btn"
              onClick={() => toast("Filter panel coming soon")}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              data-testid="log-download-btn"
              onClick={() => toast.success("Log exported")}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[130px_1fr_140px_220px_140px] gap-4 border-y border-slate-100 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <div>Finding ID</div>
          <div>Entity</div>
          <div>Severity</div>
          <div>Control Status</div>
          <div>Detection Date</div>
        </div>
        {filtered.map((f) => (
          <div
            key={f.id}
            data-testid={`finding-${f.id}`}
            className="grid grid-cols-[130px_1fr_140px_220px_140px] items-center gap-4 border-b border-slate-50 px-6 py-4 text-[13px] last:border-0"
          >
            <div className="font-mono text-[12.5px] font-semibold text-blue-600">
              {f.id}
            </div>
            <div className="font-medium text-slate-800">{f.entity}</div>
            <div>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-bold ${severityStyles[f.severity]}`}
              >
                {f.severity}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className={`h-2 w-2 rounded-full ${f.statusTone}`} />
              {f.controlStatus}
            </div>
            <div className="text-slate-500">{f.date}</div>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
