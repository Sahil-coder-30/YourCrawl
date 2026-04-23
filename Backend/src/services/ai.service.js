import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { crawlAndScan } from './crawl.service.js';
import { config } from '../config/config.js';

// ─── Model ────────────────────────────────────────────────────────────────────

console.log('[ai.service] Loading... API key present:', !!process.env.GEMINI_API_KEY);

const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    temperature: 0.3,
    apiKey: config.geminiApiKey,
});

// ─── Data Cleaner ─────────────────────────────────────────────────────────────

/**
 * Parses and cleans raw crawl result into a compact payload for the AI.
 * - Parses stringified scan JSON
 * - Removes base64 image blobs
 * - Deduplicates repetitive tickets by subtype
 */
const buildCleanPayload = (crawlResult) => {
    // Parse scan if it's a string
    const scanData = typeof crawlResult.scan === 'string'
        ? JSON.parse(crawlResult.scan)
        : crawlResult.scan;

    // Group tickets by subtype to avoid sending 70 near-identical tickets
    const grouped = {};
    for (const ticket of scanData.tickets) {
        const key = ticket.dark_pattern_subtype;
        if (!grouped[key]) {
            grouped[key] = {
                subtype: ticket.dark_pattern_subtype,
                category: ticket.dark_pattern_category,
                count: 0,
                sample_problem: ticket.problem_description,
                fix_recommendation: ticket.fix_recommendation,
                effort_estimate: ticket.effort_estimate,
                acceptance_criterion: ticket.acceptance_criterion,
                severity_score: ticket.severity_score,
                max_priority_score: 0,
                regulations_violated: [
                    ...new Set(
                        ticket.compliance_annotations.map(a => a.act_name)
                    )
                ],
            };
        }
        grouped[key].count++;
        grouped[key].max_priority_score = Math.max(
            grouped[key].max_priority_score,
            ticket.priority_score
        );
    }

    return {
        scan_url: scanData.scan_url,
        scan_timestamp: scanData.scan_timestamp,
        summary: {
            total_elements_scanned: scanData.total_elements_scanned,
            total_findings: scanData.total_findings,
            critical_count: scanData.critical_count,
            high_count: scanData.high_count,
            medium_count: scanData.medium_count,
            low_count: scanData.low_count,
            categories_found: scanData.categories_found,
            regulations_violated: scanData.regulations_violated,
        },
        grouped_issues: Object.values(grouped).sort(
            (a, b) => b.max_priority_score - a.max_priority_score
        ),
    };
};

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a dark pattern auditor AI. Your job is to analyze ML model scan results and produce a clear, human-readable audit report.

Your output must be valid Markdown optimized for react-markdown rendering. Follow this structure strictly:

---

# 🔍 Dark Pattern Audit: [Site URL]

## 📊 Executive Summary
2–3 sentences covering overall risk level and key findings.

## 🚨 Detected Dark Patterns
For each issue in grouped_issues, create a section:

### [Subtype Name] _(found on X elements)_
- **Category:** [category]
- **Priority Score:** [max_priority_score]
- **Severity:** [severity_score]
- **Effort to Fix:** [effort_estimate — S = Small, M = Medium, L = Large]
- **What It Means:** Plain English explanation of the pattern
- **Problem:** [sample_problem]
- **Fix:** [fix_recommendation]
- **Acceptance Criteria:** [acceptance_criterion]
- **Regulations Violated:** [regulations_violated as comma-separated list]

## ⚡ Quick Wins (Low Effort Fixes)
List only issues with effort_estimate = "S". Explain why fixing them first makes sense.

## ⚖️ Regulatory Risk Assessment
Summarize the legal exposure based on which regulations are violated. 
Mention DPDP Act, GDPR, DSA, EU AI Act, CCPA separately if found.

## 📋 Scan Summary
| Metric | Value |
|--------|-------|
| URL Scanned | [scan_url] |
| Total Elements Scanned | [total_elements_scanned] |
| Total Findings | [total_findings] |
| Critical | [critical_count] |
| High | [high_count] |
| Medium | [medium_count] |
| Low | [low_count] |

## ✅ Remediation Roadmap
Prioritized ordered list of what to fix first, based on priority_score (highest first).
Format: 1. Fix X (Priority: Y, Effort: Z)

## 🏁 Conclusion
1 short paragraph with final verdict and recommended next steps.

---

Rules:
- Report ONLY what the ML model data says. Do NOT add opinions or fabricate findings.
- Use emojis, headers, bold, and tables to make it scannable.
- All output must be valid Markdown.
- Never truncate or skip any grouped_issue.`;

// ─── Runner Function ──────────────────────────────────────────────────────────

/**
 * Run the audit pipeline on a given URL.
 *
 * @param {string} url - The website URL to audit.
 * @returns {Promise<{success: boolean, report?: string, crawlResult?: object, error?: string}>}
 */
export const runCrawlAgent = async (url) => {
    try {
        console.log(`[crawlAgent] Starting audit for: ${url}`);

        // Step 1: Crawl and scan
        const crawlResult = await crawlAndScan(url);

        if (!crawlResult.success) {
            return { success: false, error: crawlResult.error || 'Crawl failed' };
        }

        // Step 2: Parse and clean the data
        let cleanPayload;
        try {
            cleanPayload = buildCleanPayload(crawlResult);
        } catch (parseError) {
            console.error('[crawlAgent] Failed to parse scan data:', parseError.message);
            return { success: false, error: `Data parsing failed: ${parseError.message}` };
        }

        console.log(`[crawlAgent] Clean payload ready. Unique issue types: ${cleanPayload.grouped_issues.length}`);

        // Step 3: Send clean data to AI
        const result = await model.invoke([
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(
                `Here is the dark pattern scan result for ${url}. Analyze it and generate the audit report.\n\n` +
                `\`\`\`json\n${JSON.stringify(cleanPayload, null, 2)}\n\`\`\``
            ),
        ]);

        const report = result.content;

        console.log('[crawlAgent] Audit complete.');
        return {
            success: true,
            report,
            crawlResult: {
                success: true,
                scan: JSON.stringify(cleanPayload), // return clean version
            },
        };

    } catch (error) {
        console.error('[crawlAgent] Error:', error.message);
        return { success: false, error: error.message };
    }
};