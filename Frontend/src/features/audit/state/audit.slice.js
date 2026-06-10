/**
 * audit.slice.js
 *
 * Manages:
 *  - runAudit        → POST /api/crawl  (run a new audit, save to DB)
 *  - fetchHistory    → GET  /api/crawl/history  (load past audits list)
 *  - loadAuditById   → GET  /api/crawl/history/:id  (reload a past audit)
 */

import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import api from "../../../services/api";


// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Run a new audit for a URL (with optional additional routes) */
export const runAudit = createAsyncThunk(
  "audit/runAudit",
  async ({ url, routes = [], reportId }, { rejectWithValue }) => {
    try {
      const response = await api.post("/crawl", { url, routes, reportId });
      return response.data; // { success, reportId, auditData, routes }
    } catch (err) {
      // Prefer the server's descriptive error message over Axios' generic one
      const data = err.response?.data || {};
      return rejectWithValue({
        message: data.error || data.message || err.message || "Audit failed",
        errorCode: data.errorCode || "UNKNOWN",
      });
    }
  }
);

/** Discover internal routes for a given base URL (Phase 1 of the wizard) */
export const discoverRoutes = createAsyncThunk(
  "audit/discoverRoutes",
  async (url, { rejectWithValue }) => {
    try {
      const response = await api.post("/crawl/discover", { url });
      return response.data.routes; // array of { path, label, fullUrl }
    } catch (err) {
      const data = err.response?.data || {};
      return rejectWithValue(
        data.error || data.message || err.message || "Route discovery failed"
      );
    }
  }
);

/** Fetch the list of past audits for the logged-in user */
export const fetchAuditHistory = createAsyncThunk(
  "audit/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/crawl/history");
      return response.data.auditsList; // array of summary rows
    } catch (err) {
      const data = err.response?.data || {};
      return rejectWithValue(data.error || data.message || err.message || "Failed to load history");
    }
  }
);

/** Load the full auditData for a specific past report */
export const loadAuditById = createAsyncThunk(
  "audit/loadById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/crawl/history/${id}`);
      return response.data; // { reportId, auditData }
    } catch (err) {
      const data = err.response?.data || {};
      return rejectWithValue(data.error || data.message || err.message || "Failed to load audit");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const auditSlice = createSlice({
  name: "audit",
  initialState: {
    /** The full structured audit JSON currently being viewed */
    auditData: null,
    /** The DB id of the currently loaded report */
    currentReportId: null,
    /** The URL that was last audited */
    lastUrl: null,

    /** run-audit lifecycle */
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    errorCode: null,

    /** History list lifecycle */
    history: [],           // array of { id, target, framework, status, findings, risk, date }
    historyStatus: "idle", // idle | loading | succeeded | failed
    historyError: null,

    /** Route discovery lifecycle (Phase 1 of the wizard) */
    discoveredRoutes: [],      // array of { path, label, fullUrl }
    discoverStatus: "idle",    // idle | loading | succeeded | failed
    discoverError: null,
  },

  reducers: {
    clearAudit(state) {
      state.auditData = null;
      state.currentReportId = null;
      state.lastUrl = null;
      state.status = "idle";
      state.error = null;
      state.errorCode = null;
    },
    clearDiscovery(state) {
      state.discoveredRoutes = [];
      state.discoverStatus = "idle";
      state.discoverError = null;
    },
  },

  extraReducers: (builder) => {
    // ── runAudit ──────────────────────────────────────────────────────────
    builder
      .addCase(runAudit.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.errorCode = null;
        state.lastUrl = action.meta.arg;
      })
      .addCase(runAudit.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.auditData = action.payload.auditData;
        state.currentReportId = action.payload.reportId;
        state.discoveredRoutes = action.payload.routes || [];
      })
      .addCase(runAudit.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.payload || "Audit failed";
        state.errorCode = action.payload?.errorCode || null;
      });

    // ── fetchAuditHistory ─────────────────────────────────────────────────
    builder
      .addCase(fetchAuditHistory.pending, (state) => {
        state.historyStatus = "loading";
        state.historyError = null;
      })
      .addCase(fetchAuditHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload;
      })
      .addCase(fetchAuditHistory.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.historyError = action.payload;
      });

    // ── loadAuditById ─────────────────────────────────────────────────────
    builder
      .addCase(loadAuditById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadAuditById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.auditData = action.payload.auditData;
        state.currentReportId = action.payload.reportId;
      })
      .addCase(loadAuditById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // ── discoverRoutes ────────────────────────────────────────────────────
    builder
      .addCase(discoverRoutes.pending, (state) => {
        state.discoverStatus = "loading";
        state.discoverError = null;
        state.discoveredRoutes = [];
      })
      .addCase(discoverRoutes.fulfilled, (state, action) => {
        state.discoverStatus = "succeeded";
        state.discoveredRoutes = action.payload;
      })
      .addCase(discoverRoutes.rejected, (state, action) => {
        state.discoverStatus = "failed";
        state.discoverError = action.payload;
      });
  },
});

export const { clearAudit, clearDiscovery } = auditSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
// Plain selectors
export const selectAuditData        = (s) => s.audit.auditData;
export const selectCurrentReportId  = (s) => s.audit.currentReportId;
export const selectAuditStatus      = (s) => s.audit.status;
export const selectAuditError       = (s) => s.audit.error;
export const selectAuditErrorCode   = (s) => s.audit.errorCode;
export const selectHistory          = (s) => s.audit.history;
export const selectHistoryStatus    = (s) => s.audit.historyStatus;
export const selectExecutiveSummary = (s) => s.audit.auditData?.executive_summary ?? "";
export const selectDiscoveredRoutes = (s) => s.audit.discoveredRoutes;
export const selectDiscoverStatus   = (s) => s.audit.discoverStatus;
export const selectDiscoverError    = (s) => s.audit.discoverError;

// Memoized selectors — these return new array/object references when derived,
// so we use createSelector to keep the reference stable between renders.
const EMPTY_ARRAY  = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

export const selectStatCards = createSelector(
  selectAuditData,
  (data) => data?.stat_cards ?? EMPTY_OBJECT
);

export const selectAnalysisFindings = createSelector(
  selectAuditData,
  (data) => data?.analysis_findings ?? EMPTY_ARRAY
);

export const selectRemediationTasks = createSelector(
  selectAuditData,
  (data) => data?.remediation_tasks ?? EMPTY_ARRAY
);

export const selectComplianceFrameworks = createSelector(
  selectAuditData,
  (data) => data?.compliance_frameworks ?? EMPTY_ARRAY
);

export const selectAuditEntry = createSelector(
  selectAuditData,
  (data) => data?.audit_entry ?? EMPTY_OBJECT
);

export const selectAiInsight = createSelector(
  selectAuditData,
  (data) => data?.ai_insight ?? EMPTY_OBJECT
);

export const selectTimeline = createSelector(
  selectAuditData,
  (data) => data?.remediation_timeline ?? EMPTY_ARRAY
);

export const selectQuickWins = createSelector(
  selectAuditData,
  (data) => data?.quick_wins ?? EMPTY_ARRAY
);

export default auditSlice.reducer;

