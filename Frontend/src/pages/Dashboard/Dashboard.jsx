import { useNavigate } from "react-router-dom";
import { Download, Plus } from "lucide-react";
import AppLayout from "../../components/AppLayout/AppLayout";
import StatCard from "../../components/StatCard/StatCard";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { recentAuditTrail, systemIntegrity } from "../../data/mockData";

const statusStyles = {
  PASS: "bg-emerald-100 text-emerald-700",
  REVIEW: "bg-amber-100 text-amber-700",
  FAIL: "bg-rose-100 text-rose-700",
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
            Security Overview
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Real-time compliance posture across all digital assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            data-testid="export-report-btn"
            variant="outline"
            onClick={() => toast.success("Report export queued")}
            className="h-10 rounded-lg border-slate-200 bg-white text-[13px] font-semibold text-slate-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button
            data-testid="start-new-audit-btn"
            onClick={() => navigate("/config")}
            className="h-10 rounded-lg bg-blue-600 text-[13px] font-semibold hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Start New Audit
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          testId="stat-risk-score"
          label="RISK SCORE"
          value="84"
          delta="↑ +2.4%"
          accent="text-blue-600"
          footer={
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[82%] rounded-full bg-blue-600" />
            </div>
          }
        />
        <StatCard
          testId="stat-open-controls"
          label="OPEN CONTROLS"
          value="12"
          suffix="Critical"
          footer={<span>24% reduction since May</span>}
        />
        <StatCard
          testId="stat-sla"
          label="SLA UPTIME"
          value="99.9%"
          footer={
            <div className="flex items-end gap-0.5">
              {[0.4, 0.6, 0.5, 0.8, 0.65, 0.9].map((v, i) => (
                <div
                  key={i}
                  style={{ height: `${v * 18}px` }}
                  className="w-[3px] rounded-sm bg-emerald-500"
                />
              ))}
            </div>
          }
        />
        <StatCard
          testId="stat-next-audit"
          label="NEXT AUDIT"
          value="14d"
          footer={<span className="text-rose-500">SOC2 Type II Annual</span>}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div
          data-testid="audit-trail-card"
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-slate-900">
              Recent Audit Trail
            </h2>
            <button
              data-testid="view-all-logs-btn"
              className="text-[13px] font-semibold text-blue-600 hover:underline"
              onClick={() => toast("Full audit log coming soon")}
            >
              View All Logs
            </button>
          </div>

          <div className="mt-5 overflow-hidden">
            <div className="grid grid-cols-[120px_1.4fr_1fr_90px_90px] gap-4 border-b border-slate-100 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <div>Control ID</div>
              <div>Action</div>
              <div>Assessor</div>
              <div>Status</div>
              <div className="text-right">Date</div>
            </div>
            {recentAuditTrail.map((row) => (
              <div
                key={row.id}
                data-testid={`audit-row-${row.id}`}
                className="grid grid-cols-[120px_1.4fr_1fr_90px_90px] items-center gap-4 border-b border-slate-50 py-4 text-[13px] text-slate-700 last:border-0"
              >
                <div className="font-mono text-[12px] text-slate-500">
                  {row.id}
                </div>
                <div className="font-medium text-slate-900">{row.action}</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold ${row.assessor.color}`}
                  >
                    {row.assessor.initials}
                  </span>
                  <span className="text-slate-700">{row.assessor.name}</span>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusStyles[row.status]}`}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="text-right text-slate-500">{row.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div
            data-testid="system-integrity-card"
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h3 className="text-[17px] font-bold text-slate-900">
              System Integrity
            </h3>
            <div className="mt-4 space-y-3">
              {systemIntegrity.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between text-[13px]"
                >
                  <span className="text-slate-700">{s.name}</span>
                  <span
                    className={`flex items-center gap-2 font-semibold ${
                      s.tone === "ok" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        s.tone === "ok" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 p-6 text-white">
            <h3 className="text-[18px] font-bold">Premium Support</h3>
            <p className="mt-2 max-w-[220px] text-[13px] text-blue-100">
              Access 24/7 specialist advisory for complex regulatory
              transitions.
            </p>
            <Button
              data-testid="premium-support-btn"
              onClick={() => toast.success("Our expert will reach out shortly")}
              className="mt-5 h-9 rounded-lg text-[13px] font-semibold text-blue-700 hover:bg-slate-100"
              variant="secondary"
            >
              Talk to Expert
            </Button>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
