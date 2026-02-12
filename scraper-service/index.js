const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// --- Singleton Browser Strategy ---
let browser = null;

async function getBrowser() {
    if (!browser || !browser.isConnected()) {
        console.log("🚀 Launching new Puppeteer browser instance...");
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--disable-gpu"
            ]
        });
    }
    return browser;
}

// Keep browser alive, but close if idle for too long (optional, but good for resources)
// For now, we'll just keep it open for speed.

app.post('/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('fragrantica.com')) {
        return res.status(400).json({ error: "Invalid URL. Must be a Fragrantica link." });
    }

    console.log(`📥 Scrape request: ${url}`);
    const start = Date.now();
    let page = null;

    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();

        // Optimize: Block heavy resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Set User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Go to URL
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForSelector('h1[itemprop="name"]', { timeout: 5000 });
        } catch (e) {
            console.log("⚠️ Navigation/Selector timeout, continuing with available content...");
        }

        const content = await page.content();

        // We can close the page immediately now that we have content
        await page.close();
        page = null;

        // Parse with Cheerio
        const $ = cheerio.load(content);

        // --- Extraction Logic (Similar to original) ---
        const rawName = $('h1[itemprop="name"]').text().replace(/for women and men|for women|for men/gi, '').trim();
        const image = $('img[itemprop="image"]').attr('src') || "https://images.unsplash.com/photo-1616949755610-8c977f9f3b1e?auto=format&fit=crop&q=80&w=800";
        let description = $('div[itemprop="description"]').text().trim();
        const ratingText = $('span[itemprop="ratingValue"]').text().trim();

        // Gender
        let gender = "Unisex";
        const titleText = $('h1[itemprop="name"]').text();
        if (titleText.includes("for women") && !titleText.includes("for men")) gender = "Female";
        if (titleText.includes("for men") && !titleText.includes("for women")) gender = "Male";

        // Brand
        let brand = "Unknown";
        try {
            const urlParts = url.split('/perfume/')[1].split('/');
            if (urlParts.length >= 1) {
                brand = urlParts[0].replace(/-/g, ' ');
                brand = brand.replace(/\b\w/g, l => l.toUpperCase());
            }
        } catch (e) { }

        // Pyramid
        let pyramidData = { top: [], middle: [], base: [] };
        const pyramidContainers = $('.pyramid-level-container');
        const levels = ['top', 'middle', 'base'];

        if (pyramidContainers.length > 0) {
            pyramidContainers.each((i, container) => {
                if (i < 3) {
                    const notesArr = [];
                    $(container).find('span, a, div').each((j, el) => {
                        const text = $(el).text().trim();
                        if (text && text.length > 1 && text.length < 50 && !text.includes('\n')) {
                            notesArr.push(text);
                        }
                    });
                    pyramidData[levels[i]] = [...new Set(notesArr)];
                }
            });
        }

        // Accords
        let accords = {};
        $('div[style*="width"][style*="background"]').each((i, el) => {
            const style = $(el).attr('style') || '';
            const text = $(el).text().trim();
            const widthMatch = style.match(/width:\s*([\d.]+)(%|px)/);

            if (widthMatch && text && text.length > 1 && text.length < 40 && !text.includes('\n')) {
                let width = parseFloat(widthMatch[1]);
                if (widthMatch[2] === 'px') width = Math.min((width / 300) * 100, 100);
                const finalName = text.charAt(0).toUpperCase() + text.slice(1);
                accords[finalName] = Math.min(Math.round(width), 100);
            }
        });

        // Heuristics
        const pageText = $('body').text().toLowerCase();
        let longevity = pageText.includes('long lasting') ? "Long Lasting" : pageText.includes('weak') ? "Weak" : "Moderate";
        let sillage = pageText.includes('enormous') ? "Strong" : pageText.includes('intimate') ? "Intimate" : "Moderate";
        let season = "All";
        if (pageText.includes('summer')) season = "Summer";
        if (pageText.includes('winter')) season = "Winter";

        // Response
        const data = {
            name: rawName || "New Scent",
            brand,
            description: description.substring(0, 500), // Truncate for safety
            image,
            accords: Object.keys(accords).length > 0 ? accords : { "Woody": 50, "Fresh": 30 },
            longevity,
            sillage,
            season,
            pyramid: pyramidData,
            rating: ratingText || null,
            gender
        };

        const duration = Date.now() - start;
        console.log(`✅ Scrape successful (${duration}ms)`);
        res.json(data);

    } catch (error) {
        console.error("❌ Scraping Error:", error.message);
        if (page) await page.close();
        res.status(500).json({ error: "Failed to scrape data" });
    }
});

app.listen(PORT, () => {
    console.log(`Scraper Service running on port ${PORT}`);
});
