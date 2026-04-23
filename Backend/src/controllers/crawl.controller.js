import { runCrawlAgent } from "../services/ai.service.js";
import AuditReport from "../models/auditReport.model.js";

// ─── POST /api/crawl ──────────────────────────────────────────────────────────
/**
 * Run a full crawl → ML scan → AI analysis pipeline.
 * Saves the result to the database against the authenticated user.
 * Returns the structured auditData JSON.
 */
export const crawlUrl = async (req, res) => {
    try {
        const { url } = req.body;
        const userId = req.user.id; // set by identifyUser middleware

        if (!url) {
            return res.status(400).json({ success: false, error: "URL is required" });
        }

        console.log(`[crawlController] Starting audit for: ${url} (user: ${userId})`);

        const result = await runCrawlAgent(url);

        if (!result.success) {
            return res.status(500).json({ success: false, error: result.error });
        }

        const { auditData } = result;

        // ── Persist to MongoDB ──────────────────────────────────────────────
        const sc = auditData.stat_cards ?? {};
        const savedReport = await AuditReport.create({
            userId,
            scanUrl: url,
            auditData,
            summary: {
                totalFindings: sc.total_findings  ?? 0,
                riskScore:     sc.risk_score      ?? 0,
                criticalCount: sc.critical_count  ?? 0,
                highCount:     sc.high_count      ?? 0,
                mediumCount:   sc.medium_count    ?? 0,
                lowCount:      sc.low_count       ?? 0,
                framework:     auditData.audit_entry?.framework ?? "",
            },
        });

        console.log(`[crawlController] Report saved (id: ${savedReport._id})`);

        return res.status(200).json({
            success: true,
            reportId: savedReport._id,
            auditData,
        });

    } catch (error) {
        console.error("[crawlController] Unexpected error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message,
        });
    }
};

// ─── GET /api/crawl/history ───────────────────────────────────────────────────
/**
 * Returns the authenticated user's past audit reports,
 * newest-first. Returns only the summary fields to keep the
 * payload light (the full auditData is fetched on-demand).
 */
export const getAuditHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const reports = await AuditReport.find({ userId })
            .sort({ createdAt: -1 })
            .select("_id scanUrl summary createdAt")
            .lean();

        // Shape each record into what the frontend Audits table expects
        const auditsList = reports.map((r) => ({
            id:        r._id,
            target:    (() => { try { return new URL(r.scanUrl).hostname; } catch { return r.scanUrl; } })(),
            scanUrl:   r.scanUrl,
            framework: r.summary.framework || "—",
            status:    "Completed",
            findings:  r.summary.totalFindings,
            risk:      r.summary.riskScore,
            date:      new Date(r.createdAt).toLocaleDateString("en-US", {
                           month: "short", day: "numeric", year: "numeric",
                       }),
        }));

        return res.status(200).json({ success: true, auditsList });

    } catch (error) {
        console.error("[crawlController] getAuditHistory error:", error.message);
        return res.status(500).json({ success: false, error: "Failed to fetch history" });
    }
};

// ─── GET /api/crawl/history/:id ───────────────────────────────────────────────
/**
 * Returns the full auditData for a single saved report.
 * Used when a user clicks an old audit row to reload its results.
 */
export const getAuditById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const report = await AuditReport.findOne({ _id: id, userId }).lean();
        if (!report) {
            return res.status(404).json({ success: false, error: "Audit not found" });
        }

        return res.status(200).json({
            success: true,
            reportId: report._id,
            auditData: report.auditData,
        });

    } catch (error) {
        console.error("[crawlController] getAuditById error:", error.message);
        return res.status(500).json({ success: false, error: "Failed to fetch audit" });
    }
};
