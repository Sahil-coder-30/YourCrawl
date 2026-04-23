import { tool } from '@langchain/core/tools';
import { createAgent } from 'langchain'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { crawlAndScan } from './crawl.service.js';

// ─── Tool Definition ──────────────────────────────────────────────────────────

const crawlTool = tool(
    async ({ url }) => {
        console.log(`[crawlTool] Agent requested crawl for: ${url}`);

        const result = await crawlAndScan(url);

        if (!result.success) {
            return `Error during crawl/scan: ${result.error}`;
        }

        // Return scan data as a JSON string — the agent reads this as tool output
        return JSON.stringify(result.scan, null, 2);
    },
    {
        name: 'crawl_and_scan',
        description: `Crawls a website URL, extracts all interactive elements, takes a screenshot, 
and runs it through a dark pattern detection ML model. 
Returns a structured JSON report of all detected dark patterns, issues, and findings.
Use this whenever you need to audit a website.`,
        schema: z.object({
            url: z.string().url().describe('The full URL of the website to crawl and scan (e.g. https://example.com)')
        })
    }
);

// ─── Model ────────────────────────────────────────────────────────────────────

console.log('[ai.service] Loading... API key present:', !!process.env.GEMINI_API_KEY);

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY in environment');

const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    temperature: 0.3,
    apiKey,
});



// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a dark pattern auditor AI. Your job is to crawl websites and report exactly what the ML model found — nothing more, nothing less.

When given a URL:
1. Use the crawl_and_scan tool to crawl the site and get the ML model's analysis.
2. Take ONLY the data returned by the model and present it in a clear, well-structured format.

Your output must be valid Markdown, optimized for rendering with react-markdown. Follow this structure strictly:

---

# 🔍 Dark Pattern Audit: [Site Name / URL]

## 📊 Summary
A brief 2–3 sentence overview of what the model found overall.

## 🚨 Detected Dark Patterns
For each detected issue, create a section like:

### [Pattern Name]
- **Severity:** [value from model]
- **Element:** [element description from model]  
- **Location:** [location/page context from model]
- **Description:** [explanation from model]

## ⚠️ Key Issues
Bullet list of the most important problems found by the model.

## 📋 All Findings
Present every data point the model returned, formatted clearly.

## ✅ Conclusion
A short closing statement based strictly on the model's output.

---

Rules:
- Do NOT add opinions, warnings, or information not present in the model's data.
- Do NOT omit any findings the model returned.
- Use emojis, headers, and lists to make it beautiful and scannable.
- All output must be Markdown.`;

// ─── Agent ────────────────────────────────────────────────────────────────────

const crawlAgent = createAgent({
    model: model,
    tools: [crawlTool],
    systemPrompt: SYSTEM_PROMPT
});

// ─── Runner Function ──────────────────────────────────────────────────────────
/**
 * Run the crawl agent on a given URL.
 *
 * @param {string} url - The website URL to audit.
 * @returns {Promise<string>} - Markdown-formatted audit report.
 */
export const runCrawlAgent = async (url) => {
    try {
        console.log(`[crawlAgent] Starting audit for: ${url}`);

        const result = await crawlAgent.invoke({
            messages: [
                new HumanMessage(`Please crawl and audit this website for dark patterns: ${url}`)
            ]
        });

        // Extract the final assistant message (the markdown report)
        const messages = result.messages;
        const lastMessage = messages[messages.length - 1];
        const report = lastMessage.content;

        console.log('[crawlAgent] Audit complete.');
        return { success: true, report };

    } catch (error) {
        console.error('[crawlAgent] Error:', error.message);
        return { success: false, error: error.message };
    }
};