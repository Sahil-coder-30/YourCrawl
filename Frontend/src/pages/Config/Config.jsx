import { useState } from "react";
import { ChevronRight, Info, Plus, ShieldCheck, Scale, ListChecks, Shield } from "lucide-react";
import AppLayout from "../../components/AppLayout/AppLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { frameworks } from "../../data/mockData";

const iconMap = {
  shield: Shield,
  scale: Scale,
  "shield-check": ShieldCheck,
  "list-checks": ListChecks,
};

function CapacityFooter() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Audit Capacity
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[75%] rounded-full bg-blue-600" />
      </div>
      <div className="mt-2 text-[12px] text-slate-500">18/24 Active Threads</div>
    </div>
  );
}

export default function Config() {
  const [selected, setSelected] = useState(
    new Set(frameworks.filter((f) => f.defaultSelected).map((f) => f.id))
  );
  const [depth, setDepth] = useState("surface");
  const [env, setEnv] = useState("production");
  const [includeRem, setIncludeRem] = useState(true);
  const [source, setSource] = useState("url");
  const [url, setUrl] = useState("");

  const toggleFw = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startAudit = () => {
    if (source === "url" && !url.trim()) {
      toast.error("Please provide a target URL");
      return;
    }
    if (selected.size === 0) {
      toast.error("Select at least one regulatory framework");
      return;
    }
    toast.success(
      `Audit queued · ${selected.size} framework${selected.size > 1 ? "s" : ""}`
    );
  };

  return (
    <AppLayout sidebarFooter={<CapacityFooter />}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Audits <ChevronRight className="h-3 w-3" />
            <span className="text-blue-600">Start New Audit</span>
          </div>
          <h1 className="mt-2 text-[32px] font-extrabold tracking-tight text-slate-900">
            New Configuration
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Establish the scope, source data, and regulatory frameworks for your
            next compliance audit.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Data Source */}
          <section
            data-testid="data-source-card"
            className="rounded-2xl border border-slate-200 bg-white p-7"
          >
            <h2 className="text-[20px] font-bold text-slate-900">
              1. Data Source
            </h2>

            <Tabs value={source} onValueChange={setSource} className="mt-5">
              <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-slate-200 bg-transparent p-0">
                <TabsTrigger
                  data-testid="tab-target-url"
                  value="url"
                  className="relative rounded-none border-0 bg-transparent pb-3 text-[14px] font-semibold text-slate-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                >
                  Target URL
                  {source === "url" && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-blue-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  data-testid="tab-file-upload"
                  value="file"
                  className="relative rounded-none border-0 bg-transparent pb-3 text-[14px] font-semibold text-slate-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                >
                  Direct File Upload
                  {source === "file" && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-blue-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  data-testid="tab-api"
                  value="api"
                  className="relative rounded-none border-0 bg-transparent pb-3 text-[14px] font-semibold text-slate-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                >
                  API Integration
                  {source === "api" && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-blue-600" />
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-6">
              <label className="text-[13px] font-semibold text-slate-700">
                Application Root URL
              </label>
              <div className="mt-2 flex h-11 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <span className="grid w-24 place-items-center bg-slate-50 text-[13px] font-mono text-slate-500">
                  https://
                </span>
                <input
                  data-testid="url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example-api.aegis.com"
                  className="flex-1 bg-white px-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-[13px] text-blue-700">
                <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-blue-600" />
                <p className="leading-relaxed">
                  Providing a direct URL allows Aegis to perform live schema
                  discovery and endpoint mapping. Ensure CORS headers are
                  configured for audit traffic.
                </p>
              </div>
            </div>
          </section>

          {/* Parameters */}
          <section
            data-testid="audit-parameters-card"
            className="rounded-2xl border border-slate-200 bg-white p-7"
          >
            <h2 className="text-[20px] font-bold text-slate-900">
              2. Audit Parameters
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-[13px] font-semibold text-slate-700">
                  Depth Analysis
                </label>
                <Select value={depth} onValueChange={setDepth}>
                  <SelectTrigger
                    data-testid="depth-select"
                    className="mt-2 h-11 rounded-lg border-slate-200"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surface">Surface Discovery (Standard)</SelectItem>
                    <SelectItem value="deep">Deep Crawl (Aggressive)</SelectItem>
                    <SelectItem value="full">Full Recursive Scan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-slate-700">
                  Environment
                </label>
                <Select value={env} onValueChange={setEnv}>
                  <SelectTrigger
                    data-testid="env-select"
                    className="mt-2 h-11 rounded-lg border-slate-200"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production (Read-Only)</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Checkbox
                id="rem"
                data-testid="include-remediation-checkbox"
                checked={includeRem}
                onCheckedChange={(v) => setIncludeRem(Boolean(v))}
                className="h-5 w-5 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label
                htmlFor="rem"
                className="text-[14px] font-medium text-slate-700"
              >
                Include Automated Remediation Suggestions
              </label>
            </div>

            <div className="mt-7 flex justify-end">
              <Button
                data-testid="run-audit-btn"
                onClick={startAudit}
                className="h-11 rounded-lg bg-blue-600 px-6 text-[14px] font-semibold hover:bg-blue-700"
              >
                Run Audit
              </Button>
            </div>
          </section>
        </div>

        {/* Frameworks */}
        <section
          data-testid="frameworks-card"
          className="rounded-2xl border border-slate-200 bg-white p-7"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-slate-900">
              3. Frameworks
            </h2>
            <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              {selected.size} Selected
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {frameworks.map((fw) => {
              const Icon = iconMap[fw.icon] ?? Shield;
              const active = selected.has(fw.id);
              return (
                <button
                  key={fw.id}
                  data-testid={`fw-${fw.id}`}
                  onClick={() => toggleFw(fw.id)}
                  className={`flex items-start justify-between gap-3 rounded-xl border p-5 text-left transition ${
                    active
                      ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                        active ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-slate-900">
                        {fw.name}
                      </div>
                      <p className="mt-1 max-w-[260px] text-[12.5px] leading-relaxed text-slate-500">
                        {fw.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {active && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white" strokeWidth="2">
                        <path d="M2 6.5 L5 9 L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            data-testid="add-rubric-btn"
            onClick={() => toast("Custom rubric builder coming soon")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-[12px] font-semibold uppercase tracking-wider text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
          >
            <Plus className="h-[14px] w-[14px]" /> Add Custom Rubric
          </button>
        </section>
      </div>
    </AppLayout>
  );
}
