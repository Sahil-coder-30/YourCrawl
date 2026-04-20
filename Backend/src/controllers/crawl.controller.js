import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

export const crawlUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Starting crawl for: ${url}`);

        // Launch puppeteer-core (requires an executable path since it doesn't bundle Chromium)
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Default path for macOS Chrome
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Recommended for server environments
        });

        const page = await browser.newPage();
        
        // Set a standard viewport
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Extract basic data
        const title = await page.title();
        const textContent = await page.evaluate(() => document.body.innerText);
        const htmlContent = await page.content();
        
        // Extract metadata
        const metaTags = await page.evaluate(() => {
            const meta = {};
            document.querySelectorAll('meta').forEach(tag => {
                const name = tag.getAttribute('name') || tag.getAttribute('property');
                const content = tag.getAttribute('content');
                if (name && content) {
                    meta[name] = content;
                }
            });
            return meta;
        });

        // Extract all visible links
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                        .map(a => a.href)
                        .filter(href => href.startsWith('http'));
        });

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
        fs.writeFileSync(screenshotPath, screenshotBuffer);

        // Convert to base64
        const screenshotBase64 = screenshotBuffer.toString('base64');
        
        // This is the URL where the image can be viewed directly in a browser
        const imageUrl = `http://localhost:3000/screenshots/${screenshotFileName}`;

        await browser.close();

        return res.status(200).json({
            message: 'Crawl completed successfully',
            data: {
                url,
                title,
                metaTags,
                links: [...new Set(links)], // Remove duplicates
                textLength: textContent.length,
                htmlLength: htmlContent.length,
                textContent: textContent, // May be very large, user can process as needed
                imageUrl: imageUrl, // Directly accessible via browser
                screenshotBase64: `data:image/png;base64,${screenshotBase64}`
            }
        });

    } catch (error) {
        console.error("Crawl error:", error);
        return res.status(500).json({ 
            error: 'Failed to crawl URL', 
            details: error.message 
        });
    }
};
