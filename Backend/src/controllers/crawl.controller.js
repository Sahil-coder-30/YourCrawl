import { runCrawlAgent } from "../services/ai.service.js";

/**
 * POST /api/crawl
 * Body: { url: string }
 *
 * Thin HTTP layer — all crawl + scan + formatting logic lives in the agent.
 * Returns a Markdown report ready for react-markdown rendering.
 */
export const crawlUrl = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        console.log(`[crawlController] Handing off to agent for: ${url}`);

        const result = await runCrawlAgent(url);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error
            });
        }

        return res.status(200).json({
            success: true,
            report: result.report ,   // Markdown string → pipe straight into react-markdown
            crawlResult: result.crawlResult
        });

    } catch (error) {
        console.error('[crawlController] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
};

