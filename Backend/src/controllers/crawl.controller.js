import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

let browserInstance = null;

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

export const crawlUrl = async (req, res) => {
    let page;
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Starting crawl for: ${url}`);

        const browser = await getBrowserInstance();
        page = await browser.newPage();
        
        // Block heavy, layout-irrelevant resources to speed up crawl (keeping CSS/images for accurate bounding boxes)
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            // Block media to save bandwidth and time; images/fonts/CSS are kept for exact layout calculation
            if (['media'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // Set a standard viewport
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Extract basic data
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
              bounding_box: {
                x: rect.x,
                y: rect.y,
                w: rect.width,
                h: rect.height
              },
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

        // Setup screenshots directory
        const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        // Create safe filename
        const timestamp = Date.now();
        const safeUrlName = url.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
        const screenshotFileName = `${safeUrlName}_${timestamp}.png`;
        const screenshotPath = path.join(screenshotsDir, screenshotFileName);

        // Take a screenshot
        const screenshotBuffer = await page.screenshot({ 
            fullPage: true 
        });

        // Save screenshot to disk
        // We'll also keep this to disk, or maybe we don't need to if we just return base64, 
        // but it's safe to keep since it's already there.
        fs.writeFileSync(screenshotPath, screenshotBuffer);

        // Convert to base64
        const screenshotBase64 = screenshotBuffer.toString('base64');
        
        // Close page instead of entire browser
        await page.close();

        return res.status(200).json({
            url: url,
            timestamp: new Date().toISOString(),
            pages: [
                {
                    page_id: `page_${timestamp}`,
                    url: url,
                    title: title,
                    screenshots: {
                        full_page: `data:image/png;base64,${screenshotBase64}`
                    },
                    page_state: "initial",
                    elements: elements
                }
            ]
        });

    } catch (error) {
        if (page) {
            await page.close().catch(e => console.error('Failed to close page on error:', e));
        }
        console.error("Crawl error:", error);
        return res.status(500).json({ 
            error: 'Failed to crawl URL', 
            details: error.message 
        });
    }
};
