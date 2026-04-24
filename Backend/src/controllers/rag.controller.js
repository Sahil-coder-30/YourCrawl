import { queryRAG } from '../services/rag.service.js';
import AuditReport from '../models/auditReport.model.js';

// ─── POST /api/rag/query ─────────────────────────────────────────────
/**
 * Accepts a user question (and optional reportId) and returns a
 * RAG-powered compliance answer grounded in:
 *   1. DPDP Act, EU AI Act, Consumer Protection Act knowledge base
 *   2. The user's specific website audit report (if provided)
 */
export const ragQuery = async (req, res) => {
    try {
        const { question, reportId, chatHistory } = req.body;
        const userId = req.user.id;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Question is required',
            });
        }

        // Optionally load the user's audit report for contextual answers
        let auditContext = null;
        if (reportId) {
            const report = await AuditReport.findOne({
                _id: reportId,
                userId,
            }).lean();

            if (report) {
                // Build a compact context string from the audit data
                const ad = report.auditData;
                auditContext = JSON.stringify({
                    scan_url: ad.scan_url,
                    executive_summary: ad.executive_summary,
                    stat_cards: ad.stat_cards,
                    analysis_findings: ad.analysis_findings?.map(f => ({
                        entity: f.entity,
                        severity: f.severity,
                        controlStatus: f.controlStatus,
                        what_it_is: f.what_it_is,
                        why_it_matters: f.why_it_matters,
                    })),
                    compliance_frameworks: ad.compliance_frameworks?.map(c => ({
                        name: c.name,
                        score: c.score,
                        explanation: c.explanation,
                    })),
                    remediation_tasks: ad.remediation_tasks?.map(t => ({
                        title: t.title,
                        priority: t.priority,
                        regulations_violated: t.regulations_violated,
                        business_rationale: t.business_rationale,
                    })),
                });
            }
        }

        console.log(`[ragController] Query from user ${userId}: "${question.substring(0, 80)}..."`);

        const result = await queryRAG(question, auditContext, chatHistory || null);

        return res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {
        console.error('[ragController] Error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to process your question. Please try again.',
            details: error.message,
        });
    }
};
