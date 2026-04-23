import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import AppLayout from "../../components/AppLayout/AppLayout";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { auditsList } from "../../data/mockData";

const statusStyles = {
  Completed: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Draft: "bg-slate-200 text-slate-600",
};

export default function Audits() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const rows = auditsList.filter((a) =>
    (a.id + a.target + a.framework).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
            All Audits
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Complete history of audit runs across all targets.
          </p>
        </div>
        <Button
          data-testid="audits-new-btn"
          onClick={() => navigate("/config")}
          className="h-10 rounded-lg bg-blue-600 text-[13px] font-semibold hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> New Audit
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            data-testid="audits-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID, target, or framework..."
            className="h-10 w-full border-0 pl-9 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[180px_1.6fr_1.2fr_140px_110px_110px_120px] gap-4 bg-slate-50 px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <div>Audit ID</div>
          <div>Target</div>
          <div>Framework</div>
          <div>Status</div>
          <div>Findings</div>
          <div>Risk</div>
          <div className="text-right">Date</div>
        </div>
        {rows.map((a) => (
          <div
            key={a.id}
            data-testid={`audit-${a.id}`}
            className="grid grid-cols-[180px_1.6fr_1.2fr_140px_110px_110px_120px] items-center gap-4 border-t border-slate-100 px-6 py-4 text-[13px]"
          >
            <div className="font-mono text-[12px] text-blue-600">{a.id}</div>
            <div className="font-medium text-slate-900">{a.target}</div>
            <div className="text-slate-600">{a.framework}</div>
            <div>
              <span
                className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[a.status]}`}
              >
                {a.status}
              </span>
            </div>
            <div className="text-slate-700">{a.findings}</div>
            <div
              className={`font-mono font-bold ${
                a.risk > 60
                  ? "text-rose-600"
                  : a.risk > 30
                    ? "text-orange-600"
                    : "text-emerald-600"
              }`}
            >
              {a.risk || "—"}
            </div>
            <div className="text-right text-slate-500">{a.date}</div>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
