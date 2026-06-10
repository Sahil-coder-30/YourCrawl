import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Info, Plus, ShieldCheck, Scale, ListChecks,
  Shield, Loader2, Globe, Search, RotateCcw, MapPin,
  AlertCircle, CheckCircle2, ArrowRight, Layers,
} from "lucide-react";
import AppLayout from "../../../components/layout/AppLayout/AppLayout";
import { toast } from "sonner";
import {
  runAudit, clearDiscovery, clearAudit,
  selectAuditStatus, selectDiscoveredRoutes,
  selectAuditData, selectCurrentReportId,
} from "../../audit/state/audit.slice";
import "./Config.css";

// ─── Static data ──────────────────────────────────────────────────────────────

const FRAMEWORKS = [
  { id: "eu-ai-act", name: "EU AI Act",    desc: "High-risk system categorization & transparency.",         Icon: Shield      },
  { id: "dpdp",     name: "DPDP (India)", desc: "Digital Personal Data Protection for data principals.",    Icon: Scale       },
  { id: "gdpr",     name: "GDPR",         desc: "European data privacy and security law.",                  Icon: ShieldCheck },
  { id: "nist",     name: "NIST AI RMF",  desc: "Risk management framework for trustworthy AI.",            Icon: ListChecks  },
];

// ─── Small atoms ─────────────────────────────────────────────────────────────

function Tick() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6.5L5 9L10 3.5" />
    </svg>
  );
}

function CheckBox({ checked }) {
  return (
    <span className="cfg__route-check">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M1.5 5.5L4 8L8.5 2" />
      </svg>
    </span>
  );
}

function StepPill({ num, label, state }) {
  return (
    <span className={`cfg__step cfg__step--${state}`}>
      {state === "done"
        ? <CheckCircle2 size={13} />
        : <span className="cfg__step-num">{num}</span>
      }
      {label}
    </span>
  );
}

// ─── Sidebar footer ───────────────────────────────────────────────────────────

function CapacityFooter() {
  return (
    <div style={{
      borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff",
      padding: "1rem 1.125rem",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8" }}>
        Audit Capacity
      </div>
      <div style={{ marginTop: 10, height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg,#2563eb,#6366f1)", borderRadius: 99 }} />
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>18 / 24 Active Threads</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Config() {
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const auditStatus    = useSelector(selectAuditStatus);
  const routes         = useSelector(selectDiscoveredRoutes);
  const auditData      = useSelector(selectAuditData);
  const currentReportId = useSelector(selectCurrentReportId);
  const inputRef       = useRef(null);

  const isAuditing    = auditStatus === "loading";
  const step          = auditData ? 2 : 1;
  const hasRoutes     = routes.length > 0;

  const [url,            setUrl]            = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());
  const [isPhase2,       setIsPhase2]       = useState(false);

  // Pre-select all routes when discovered
  useEffect(() => {
    if (hasRoutes) setSelectedRoutes(new Set(routes.map(r => r.fullUrl)));
  }, [routes, hasRoutes]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const normalizeUrl = raw => {
    const t = raw.trim();
    return t.startsWith("http") ? t : `https://${t}`;
  };

  const handleStartBaseAudit = async () => {
    if (!url.trim()) { toast.error("Enter a target URL first"); return; }
    const full = normalizeUrl(url.trim());
    setIsPhase2(false);
    toast.loading("Analyzing base URL & discovering routes…", { id: "audit" });
    const res = await dispatch(runAudit({ url: full }));
    if (runAudit.fulfilled.match(res)) {
      const discovered = res.payload.routes || [];
      if (discovered.length > 0) {
        toast.success(`Base URL analyzed. Discovered ${discovered.length} additional routes.`, { id: "audit" });
      } else {
        toast.success("Base URL analyzed. No additional routes found.", { id: "audit" });
      }
    } else {
      const msg = res.payload?.message || "Base URL analysis failed";
      toast.error(msg, { id: "audit" });
    }
  };

  const handleScanSelected = async () => {
    if (!url.trim()) { toast.error("Enter a target URL first"); return; }
    const full = normalizeUrl(url.trim());
    const extra = [...selectedRoutes];
    setIsPhase2(true);
    toast.loading(`Crawling & scanning ${extra.length} selected pages…`, { id: "audit" });
    try {
      const res = await dispatch(runAudit({ url: full, routes: extra, reportId: currentReportId }));
      if (runAudit.fulfilled.match(res)) {
        toast.success("Merged audit complete!", { id: "audit" });
        dispatch(clearDiscovery());
        navigate("/dashboard");
      } else {
        const msg = res.payload?.message || "Merged audit failed";
        toast.error(msg, { id: "audit" });
      }
    } catch {
      toast.error("Unexpected error", { id: "audit" });
    }
  };

  const handleFinishOnly = () => {
    toast.success("Opening dashboard report...", { duration: 1500 });
    dispatch(clearDiscovery());
    navigate("/dashboard");
  };

  const handleReset = () => {
    dispatch(clearAudit());
    dispatch(clearDiscovery());
    setSelectedRoutes(new Set());
    setUrl("");
    setIsPhase2(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const toggleRoute = fullUrl =>
    setSelectedRoutes(prev => {
      const n = new Set(prev);
      n.has(fullUrl) ? n.delete(fullUrl) : n.add(fullUrl);
      return n;
    });

  const toggleAll = () =>
    setSelectedRoutes(
      selectedRoutes.size === routes.length
        ? new Set()
        : new Set(routes.map(r => r.fullUrl))
    );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppLayout sidebarFooter={<CapacityFooter />}>
      <div className="cfg">

        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <div className="cfg__hero">
          <div className="cfg__hero-inner">
            <div className="cfg__hero-left">
              <div className="cfg__breadcrumb">
                Audits
                <ChevronRight size={10} />
                <span>New Configuration</span>
              </div>
              <h1 className="cfg__title">Configure Your Audit</h1>
              <p className="cfg__subtitle">
                First analyze the base URL to scan initial findings and extract related routes, then select pages to scan and merge into a single final audit report.
              </p>
            </div>

            {/* Step progress */}
            <div className="cfg__steps">
              <StepPill num="1" label="Base URL" state={step > 1 ? "done" : "active"} />
              <span className="cfg__step-connector" />
              <StepPill num="2" label="Select Routes" state={step === 2 && !isPhase2 ? "active" : (step > 2 || (step === 2 && isPhase2) ? "done" : "idle")} />
              <span className="cfg__step-connector" />
              <StepPill num="3" label="Final Audit" state={isAuditing && isPhase2 ? "active" : "idle"} />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            BODY GRID
        ════════════════════════════════════════ */}
        <div className="cfg__body">

          {/* ── LEFT COLUMN ──────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* ── Card 1: Base URL ── */}
            <div className={`cfg__card ${step === 2 ? "cfg__card--done" : ""}`}>
              <div className="cfg__card-header">
                <div className={`cfg__card-icon ${step === 2 ? "cfg__card-icon--green" : "cfg__card-icon--blue"}`}>
                  <Globe size={17} />
                </div>
                <div>
                  <div className="cfg__card-title">Base URL</div>
                  <div className="cfg__card-subtitle">Root of the application to audit</div>
                </div>
                {step === 2 && (
                  <button className="cfg__card-action" onClick={handleReset} title="Change URL">
                    <RotateCcw size={13} /> Change
                  </button>
                )}
              </div>

              <div className="cfg__card-body">
                {/* URL input */}
                <div className="cfg__url-row">
                  <span className="cfg__url-scheme">https://</span>
                  <input
                    ref={inputRef}
                    data-testid="url-input"
                    className="cfg__url-input"
                    placeholder="example.com"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !isAuditing && step === 1) handleStartBaseAudit();
                    }}
                    disabled={isAuditing || step === 2}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                {/* Confirm state — step 2 */}
                {step === 2 && (
                  <div className="cfg__hint cfg__hint--green" style={{ marginTop: "0.875rem" }}>
                    <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>
                      Base URL confirmed — <strong>{normalizeUrl(url)}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Card 1b: Base URL Scan Results Preview (step 2 only) ── */}
            {step === 2 && auditData && (
              <div className="cfg__card cfg__card--preview" style={{ animationDelay: "100ms" }}>
                <div className="cfg__card-header">
                  <div className="cfg__card-icon cfg__card-icon--indigo">
                    <ShieldCheck size={17} />
                  </div>
                  <div>
                    <div className="cfg__card-title">Base URL Scan Results</div>
                    <div className="cfg__card-subtitle">Initial dark-pattern audit findings</div>
                  </div>
                </div>
                <div className="cfg__card-body" style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "1.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRadius: 12, padding: "1rem", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Risk Score</span>
                    <span style={{ fontSize: 32, fontWeight: 800, color: (auditData.stat_cards?.risk_score ?? 0) >= 50 ? "#ef4444" : "#f97316", marginTop: 4 }}>
                      {auditData.stat_cards?.risk_score ?? 0}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      Found {auditData.stat_cards?.total_findings ?? 0} potential issues
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                      <span className="cfg__pill cfg__pill--critical">{auditData.stat_cards?.critical_count ?? 0} Critical</span>
                      <span className="cfg__pill cfg__pill--high">{auditData.stat_cards?.high_count ?? 0} High</span>
                      <span className="cfg__pill cfg__pill--medium">{auditData.stat_cards?.medium_count ?? 0} Med</span>
                      <span className="cfg__pill cfg__pill--low">{auditData.stat_cards?.low_count ?? 0} Low</span>
                    </div>
                    {auditData.ai_insight?.title && (
                      <div style={{ marginTop: "0.75rem", fontSize: 12, color: "#64748b" }}>
                        <span style={{ fontWeight: 700, color: "#ef4444" }}>Top Threat:</span> {auditData.ai_insight.title}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Card 2: Route Selection (step 2 only) ── */}
            {step === 2 && hasRoutes && (
              <div className="cfg__card">
                <div className="cfg__card-header">
                  <div className="cfg__card-icon cfg__card-icon--indigo">
                    <Layers size={17} />
                  </div>
                  <div>
                    <div className="cfg__card-title">Select Routes to Scan</div>
                    <div className="cfg__card-subtitle">
                      {routes.length} route{routes.length !== 1 ? "s" : ""} discovered
                    </div>
                  </div>
                  <span
                    className="cfg__card-badge cfg__card-badge--green"
                    style={{ marginLeft: "auto" }}
                  >
                    {selectedRoutes.size} selected
                  </span>
                </div>

                <div className="cfg__card-body">
                  {/* Toolbar */}
                  <div className="cfg__route-toolbar">
                    <span className="cfg__route-count">
                      Choose which pages to include — base URL always included
                    </span>
                    <button className="cfg__route-toggle" onClick={toggleAll}>
                      {selectedRoutes.size === routes.length ? "Deselect all" : "Select all"}
                    </button>
                  </div>

                  {/* Route items */}
                  <div className="cfg__route-list">
                    {routes.map((route, i) => {
                      const checked = selectedRoutes.has(route.fullUrl);
                      return (
                        <button
                          key={route.fullUrl}
                          data-testid={`route-${route.path}`}
                          className={`cfg__route-item ${checked ? "cfg__route-item--checked" : ""}`}
                          onClick={() => toggleRoute(route.fullUrl)}
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <CheckBox checked={checked} />
                          <div className="cfg__route-info">
                            <div className="cfg__route-label">
                              <MapPin size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                              {route.label}
                            </div>
                            <div className="cfg__route-url">{route.fullUrl}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="cfg__hint cfg__hint--indigo" style={{ marginTop: "1rem" }}>
                    <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    Each selected route is crawled independently. All page data is merged before ML analysis.
                  </div>
                </div>
              </div>
            )}

            {/* ── Run Audit row ── */}
            <div className="cfg__run-row">
              {step === 1 ? (
                <button
                  data-testid="run-audit-btn"
                  className="cfg__btn cfg__btn--run"
                  onClick={handleStartBaseAudit}
                  disabled={isAuditing || !url.trim()}
                >
                  {isAuditing ? (
                    <><Loader2 size={17} className="cfg__spin" /> Analyzing Base URL…</>
                  ) : (
                    <>
                      Analyze Base URL
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    data-testid="finish-audit-btn"
                    className="cfg__btn cfg__btn--ghost"
                    onClick={handleFinishOnly}
                    disabled={isAuditing}
                  >
                    Finish &amp; View Report
                  </button>

                  <button
                    data-testid="run-audit-btn"
                    className="cfg__btn cfg__btn--run"
                    onClick={handleScanSelected}
                    disabled={isAuditing || selectedRoutes.size === 0}
                  >
                    {isAuditing ? (
                      <><Loader2 size={17} className="cfg__spin" /> Merging &amp; Scanning…</>
                    ) : (
                      <>
                        Scan Selected Routes &amp; Merge
                        {selectedRoutes.size > 0 && (
                          <span className="cfg__btn-count">
                            {selectedRoutes.size} route{selectedRoutes.size !== 1 ? "s" : ""}
                          </span>
                        )}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

          </div>{/* /left col */}

          {/* ── RIGHT COLUMN ─────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Frameworks */}
            <div className="cfg__card">
              <div className="cfg__card-header">
                <div className="cfg__card-icon cfg__card-icon--blue">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <div className="cfg__card-title">Frameworks</div>
                  <div className="cfg__card-subtitle">Regulatory standards applied to this audit</div>
                </div>
                <span
                  className="cfg__card-badge cfg__card-badge--green"
                  style={{ marginLeft: "auto" }}
                >
                  4 Active
                </span>
              </div>

              <div className="cfg__card-body">
                <div className="cfg__fw-list">
                  {FRAMEWORKS.map(({ id, name, desc, Icon }) => (
                    <div key={id} data-testid={`fw-${id}`} className="cfg__fw-item">
                      <div className="cfg__fw-icon">
                        <Icon size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="cfg__fw-name">{name}</div>
                        <div className="cfg__fw-desc">{desc}</div>
                      </div>
                      <div className="cfg__fw-tick">
                        <Tick />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  data-testid="add-rubric-btn"
                  className="cfg__add-fw"
                  onClick={() => toast("Custom rubric builder coming soon")}
                  disabled={isAuditing}
                >
                  <Plus size={13} /> Add Custom Rubric
                </button>
              </div>
            </div>

            {/* Scope summary — appears after discovery */}
            {step === 2 && (
              <div className="cfg__scope">
                <div className="cfg__scope-title">Scan Scope</div>
                <div className="cfg__scope-row">
                  <span>Base URL</span>
                  <strong>1 page</strong>
                </div>
                <div className="cfg__scope-row">
                  <span>Selected routes</span>
                  <strong>{selectedRoutes.size} page{selectedRoutes.size !== 1 ? "s" : ""}</strong>
                </div>
                <div className="cfg__scope-total">
                  <span>Total pages</span>
                  <span>{1 + selectedRoutes.size}</span>
                </div>
              </div>
            )}

          </div>{/* /right col */}
        </div>{/* /body grid */}
      </div>
    </AppLayout>
  );
}
