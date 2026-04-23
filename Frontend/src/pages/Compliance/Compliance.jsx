import { ShieldCheck, Scale, Lock, FileCheck, Cpu, ListChecks, Download } from "lucide-react";
import AppLayout from "../../components/AppLayout/AppLayout";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { complianceFrameworks } from "../../data/mockData";

const iconMap = {
  "shield-check": ShieldCheck,
  scale: Scale,
  lock: Lock,
  "file-check": FileCheck,
  cpu: Cpu,
  "list-checks": ListChecks,
};

function scoreTone(score) {
  if (score >= 85) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (score >= 70) return { bar: "bg-blue-600", text: "text-blue-600" };
  return { bar: "bg-orange-500", text: "text-orange-600" };
}

export default function Compliance() {
  return (
    <AppLayout>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
            Compliance Posture
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Framework-by-framework breakdown of current regulatory coverage.
          </p>
        </div>
        <Button
          data-testid="compliance-export-btn"
          onClick={() => toast.success("Compliance report exported")}
          className="h-10 rounded-lg bg-blue-600 text-[13px] font-semibold hover:bg-blue-700"
        >
          <Download className="mr-2 h-4 w-4" /> Export Summary
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {complianceFrameworks.map((f) => {
          const Icon = iconMap[f.icon] ?? ShieldCheck;
          const tone = scoreTone(f.score);
          const pct = Math.round((f.passed / f.controls) * 100);
          return (
            <div
              key={f.id}
              data-testid={`compliance-${f.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span className={`text-[30px] font-extrabold leading-none ${tone.text}`}>
                  {f.score}
                </span>
              </div>
              <div className="mt-5 text-[17px] font-bold text-slate-900">{f.name}</div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${f.score}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-[12.5px] text-slate-500">
                <span>
                  {f.passed} / {f.controls} controls passed
                </span>
                <span className="font-semibold text-slate-700">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-linear-to-br from-slate-900 to-slate-800 p-8 text-white">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-blue-300">
              Audit Readiness
            </div>
            <h3 className="mt-2 text-[28px] font-extrabold">
              Schedule your next external audit
            </h3>
            <p className="mt-2 max-w-[520px] text-[14px] text-slate-300">
              Aegis syncs with your compliance calendar and automatically
              produces pre-audit evidence bundles for external examiners.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <Button
              data-testid="schedule-audit-btn"
              onClick={() => toast.success("Scheduler opened")}
              className="h-11 rounded-lg bg-blue-600 px-6 text-[14px] font-semibold hover:bg-blue-500"
            >
              Schedule Audit
            </Button>
            <Button
              data-testid="evidence-bundle-btn"
              variant="outline"
              onClick={() => toast("Evidence bundle generating")}
              className="h-11 rounded-lg border-white/30 bg-transparent px-6 text-[14px] font-semibold text-white hover:bg-white/10"
            >
              Generate Evidence Bundle
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
