import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { log } from 'console';

let browserInstance = null;

// ─── Internal: Shared Browser Instance ───────────────────────────────────────

const getBrowserInstance = async () => {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: true,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-zygote',
                '--no-first-run'
            ]
        });
    }
    return browserInstance;
};

// ─── Tool 1: crawlPage ────────────────────────────────────────────────────────
/**
 * Crawls a URL and extracts page elements + a full-page screenshot.
 *
 * @param {string} url - The URL to crawl.
 * @returns {Promise<{
 *   success: boolean,
 *   data?: { url: string, timestamp: string, pages: Array },
 *   error?: string
 * }>}
 */
export const crawlPage = async (url) => {
    let page;
    try {
        if (!url) {
            return { success: false, error: 'URL is required' };
        }

        console.log(`[crawlPage] Starting crawl for: ${url}`);

        const browser = await getBrowserInstance();
        page = await browser.newPage();

        // Block media resources to speed up crawl
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['media'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const title = await page.title();

        const selectors = [
            'button', 'a', 'input', 'select', 'textarea', 'label',
            '[role="button"]', '[role="checkbox"]', '[role="dialog"]', '[role="alert"]',
            '.modal', '.banner', '.popup', '.overlay', '.cookie', '.consent',
            '[class*="close"]', '[class*="dismiss"]', '[class*="cancel"]',
            '[class*="subscribe"]', '[class*="newsletter"]',
            'form', '[class*="countdown"]', '[class*="timer"]',
            '[class*="price"]', '[class*="fee"]', '[class*="charge"]'
        ].join(', ');

        const elements = await page.$$eval(selectors, els => els.map(el => {
            const rect = el.getBoundingClientRect();
            const css = window.getComputedStyle(el);
            return {
                id: el.id || el.getAttribute('data-testid') || `el_${Math.random().toString(36).slice(2, 10)}`,
                tag: el.tagName.toLowerCase(),
                text: (el.textContent || '').trim().slice(0, 500),
                classes: [...el.classList],
                bounding_box: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
                computed_css: {
                    font_size: css.fontSize,
                    font_weight: css.fontWeight,
                    color: css.color,
                    background_color: css.backgroundColor,
                    opacity: css.opacity,
                    display: css.display,
                    visibility: css.visibility,
                    cursor: css.cursor,
                    z_index: css.zIndex,
                    position: css.position,
                    text_decoration: css.textDecoration,
                    border: css.border,
                    padding: css.padding,
                    margin: css.margin,
                    text_align: css.textAlign
                },
                aria: {
                    role: el.getAttribute('role'),
                    label: el.getAttribute('aria-label'),
                    hidden: el.getAttribute('aria-hidden'),
                    checked: el.getAttribute('aria-checked'),
                    expanded: el.getAttribute('aria-expanded'),
                    disabled: el.getAttribute('aria-disabled'),
                    required: el.getAttribute('aria-required')
                },
                is_interactive: ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName),
                is_visible: rect.width > 0 && rect.height > 0 && css.display !== 'none' && css.visibility !== 'hidden',
                element_type: el.tagName.toLowerCase(),
                href: el.href || null,
                input_type: el.type || null,
                default_checked: el.checked ?? null,
                placeholder: el.placeholder || null,
                children: []
            };
        }));

        // Save screenshot to disk + return as base64
        const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        const timestamp = Date.now();
        const safeUrlName = url.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
        const screenshotPath = path.join(screenshotsDir, `${safeUrlName}_${timestamp}.png`);

        const screenshotBuffer = await page.screenshot({ fullPage: true });
        fs.writeFileSync(screenshotPath, screenshotBuffer);
        const screenshotBase64 = screenshotBuffer.toString('base64');

        await page.close();

        const crawlData = {
            url,
            timestamp: new Date().toISOString(),
            pages: [
                {
                    page_id: `page_${timestamp}`,
                    url,
                    title,
                    screenshots: { full_page: `data:image/png;base64,${screenshotBase64}` },
                    page_state: 'initial',
                    elements
                }
            ]
        };

        console.log(`[crawlPage] Done. Extracted ${elements.length} elements from "${title}".`);
        return { success: true, data: crawlData };

    } catch (error) {
        if (page) await page.close().catch(() => {});
        console.error('[crawlPage] Error:', error.message);
        return { success: false, error: error.message };
    }
};

// ─── Tool 2: scanForDarkPatterns ──────────────────────────────────────────────
/**
 * Sends crawl data to the ML microservice for dark-pattern analysis.
 *
 * @param {object} crawlData - The output of crawlPage().data
 * @returns {Promise<{
 *   success: boolean,
 *   data?: object,
 *   error?: string
 * }>}
 */
export const scanForDarkPatterns = async (crawlData) => {
    try {
        if (!crawlData) {
            return { success: false, error: 'crawlData is required' };
        }

        console.log('[scanForDarkPatterns] Sending data to ML microservice...');

        const mlResponse = await fetch('http://127.0.0.1:8000/api/v1/scan', {
            method: 'POST',
            headers: {
                'X-API-Key': 'ncs-dark-pattern-auditor-2026',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(crawlData)
        });

        if (!mlResponse.ok) {
            const errText = await mlResponse.text();
            throw new Error(`ML Microservice Error: ${mlResponse.status} ${errText}`);
        }

        const scanResult = await mlResponse.json();
        console.log('[scanForDarkPatterns] Analysis received.');
        return { success: true, data: scanResult };

    } catch (error) {
        console.error('[scanForDarkPatterns] Error:', error.message);
        return { success: false, error: error.message };
    }
};

// ─── Tool 3: crawlAndScan (combined) ─────────────────────────────────────────
/**
 * Convenience tool: crawls a URL and immediately scans it for dark patterns.
 * Wraps crawlPage + scanForDarkPatterns into a single agent-callable step.
 *
 * @param {string} url - The URL to audit.
 * @returns {Promise<{
 *   success: boolean,
 *   crawl?: object,
 *   scan?: object,
 *   error?: string
 * }>}
 */
export const crawlAndScan = async (url) => {
    const crawlResult = await crawlPage(url);
   

    if (!crawlResult.success) {
        return { success: false, error: `Crawl failed: ${crawlResult.error}` };
    }

    const scanResult = await scanForDarkPatterns(crawlResult.data);
    if (!scanResult.success) {
        return { success: false, error: `Scan failed: ${scanResult.error}` };
    }

    return {
        success: true,
        crawl: crawlResult.data,
        scan: scanResult.data
    };
};