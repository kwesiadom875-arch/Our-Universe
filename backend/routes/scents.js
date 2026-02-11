const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Scent = require('../models/Scent');

// @route   GET api/scents
// @desc    Get all scents for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const scents = await Scent.find({ user: req.user.id }).sort({ dateAdded: -1 });
        res.json(scents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/scents
// @desc    Add a new scent
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, brand, type, notes, rating, image, season, wishlist, description, accords, longevity, sillage, pyramid, journals } = req.body;

    try {
        const newScent = new Scent({
            user: req.user.id,
            name,
            brand,
            type,
            notes,
            rating,
            image,
            season,
            wishlist: wishlist || false,
            myCollection: !wishlist,
            description,
            accords,
            longevity,
            sillage,
            pyramid,
            journals
        });

        const scent = await newScent.save();
        res.json(scent);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/scents/:id
// @desc    Update a scent (e.g. move to collection, change rating)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, brand, type, notes, rating, image, season, wishlist, myCollection } = req.body;

    // Build object
    const scentFields = {};
    if (name) scentFields.name = name;
    if (brand) scentFields.brand = brand;
    if (type) scentFields.type = type;
    if (notes) scentFields.notes = notes;
    if (rating !== undefined) scentFields.rating = rating;
    if (image) scentFields.image = image;
    if (season) scentFields.season = season;
    if (wishlist !== undefined) scentFields.wishlist = wishlist;
    if (myCollection !== undefined) scentFields.myCollection = myCollection;

    try {
        let scent = await Scent.findById(req.params.id);

        if (!scent) return res.status(404).json({ msg: 'Scent not found' });

        // Ensure user owns contact
        if (scent.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        scent = await Scent.findByIdAndUpdate(req.params.id,
            { $set: scentFields },
            { new: true });

        res.json(scent);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/scents/:id
// @desc    Delete a scent
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const scent = await Scent.findById(req.params.id);

        if (!scent) {
            return res.status(404).json({ msg: 'Scent not found' });
        }

        // Check user
        if (scent.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Scent.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Scent removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Scent not found' });
        }
        res.status(500).send('Server Error');
    }
});

// =============================================================================
// AI-Powered Magic Fetch (Adapted from PAFUM-D-ELITE working scraper)
// Uses: Puppeteer (fetch) + Cheerio (parse HTML) + Gemini AI (enrich)
// =============================================================================

// @route   POST api/scents/scrape
// @desc    Magic fetch using Puppeteer + Cheerio + Gemini AI
// @access  Private
router.post('/scrape', auth, async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('fragrantica.com')) {
        return res.status(400).json({ error: "Invalid URL. Must be a Fragrantica link." });
    }

    let browser = null;

    try {
        const puppeteer = require('puppeteer');
        const cheerio = require('cheerio');
        const { GoogleGenerativeAI } = require("@google/generative-ai");

        // 1. PUPPETEER: Fetch the page (bypasses Cloudflare)
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

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await page.waitForSelector('h1[itemprop="name"]', { timeout: 10000 });
        } catch (e) {
            console.log("Navigation/Selector timeout, continuing with available content...");
        }

        const content = await page.content();
        await browser.close();
        browser = null;

        // 2. CHEERIO: Parse the HTML (reliable extraction like PAFUM-D-ELITE)
        const $ = cheerio.load(content);

        const rawName = $('h1[itemprop="name"]').text().replace(/for women and men|for women|for men/gi, '').trim();
        const image = $('img[itemprop="image"]').attr('src') || null;
        let description = $('div[itemprop="description"]').text().trim();
        const ratingText = $('span[itemprop="ratingValue"]').text().trim();

        // Gender detection
        let gender = "Unisex";
        const titleText = $('h1[itemprop="name"]').text();
        if (titleText.includes("for women") && !titleText.includes("for men")) gender = "Female";
        if (titleText.includes("for men") && !titleText.includes("for women")) gender = "Male";

        // Pyramid Extraction (exact same logic as PAFUM-D-ELITE)
        let pyramidData = { top: [], middle: [], base: [] };
        const pyramidDivs = $('div[style*="flex-flow: wrap"][style*="justify-content: center"]');

        if (pyramidDivs.length >= 3) {
            const getNotesFromDiv = (div) => {
                const notesArr = [];
                $(div).find('div').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text) notesArr.push(text);
                });
                return [...new Set(notesArr)].filter(n => n.length > 1);
            };

            pyramidData.top = getNotesFromDiv(pyramidDivs.eq(0));
            pyramidData.middle = getNotesFromDiv(pyramidDivs.eq(1));
            pyramidData.base = getNotesFromDiv(pyramidDivs.eq(2));
        }

        // Accords Extraction
        let accords = {};
        $('.accord-bar').each((i, el) => {
            const name = $(el).text().trim();
            // Estimate percentage from bar width if available
            const style = $(el).attr('style') || '';
            const widthMatch = style.match(/width:\s*(\d+)/);
            const width = widthMatch ? parseInt(widthMatch[1]) : (100 - (i * 15));
            if (name) accords[name] = Math.min(width, 100);
        });

        // Brand from URL (reliable, same as PAFUM-D-ELITE)
        let brand = "Unknown";
        try {
            const urlParts = url.split('/perfume/')[1].split('/');
            if (urlParts.length >= 1) {
                brand = urlParts[0].replace(/-/g, ' ');
                brand = brand.replace(/\b\w/g, l => l.toUpperCase());
            }
        } catch (e) {
            console.log("Could not extract brand from URL");
        }

        // 3. GEMINI AI: Enrich the description (shorten if too long)
        if (description && description.length > 200) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                let cleanDesc = description
                    .replace(/Sponsored.*/i, "")
                    .replace(/Read about this perfume.*/i, "")
                    .trim();

                const result = await model.generateContent({
                    contents: [
                        {
                            role: 'user',
                            parts: [{
                                text: `You are a luxury perfume copywriter. Shorten this perfume description to 2-3 elegant sentences (max 150 words). Remove unnecessary details, keep only the essence, mood, and key notes. Be poetic but concise.\n\n${cleanDesc}`
                            }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200,
                    }
                });

                const aiText = result.response.text().replace(/```json\n?|\n?```/g, "").replace(/```\n?/g, "").trim();
                if (aiText) description = aiText;
            } catch (aiError) {
                console.error("AI description shortening failed:", aiError.message);
                description = description.substring(0, 200) + '...';
            }
        }

        // If no description was found at all, provide a default
        if (!description) {
            description = `A captivating fragrance by ${brand}.`;
        }

        // Determine longevity/sillage/season from page text (simple heuristic)
        const pageText = $('body').text().toLowerCase();
        let longevity = "Moderate";
        let sillage = "Moderate";
        let season = "All";

        if (pageText.includes('long lasting') || pageText.includes('eternal')) longevity = "Long Lasting";
        if (pageText.includes('weak')) longevity = "Weak";
        if (pageText.includes('strong') || pageText.includes('enormous')) sillage = "Strong";
        if (pageText.includes('intimate')) sillage = "Intimate";
        if (pageText.includes('summer')) season = "Summer";
        if (pageText.includes('winter')) season = "Winter";
        if (pageText.includes('spring')) season = "Spring";

        // Final response
        const data = {
            name: rawName || "New Scent",
            brand: brand || "Brand",
            description,
            image: image || "https://images.unsplash.com/photo-1616949755610-8c977f9f3b1e?auto=format&fit=crop&q=80&w=800",
            accords: Object.keys(accords).length > 0 ? accords : { "Woody": 50, "Fresh": 30 },
            longevity,
            sillage,
            season,
            pyramid: pyramidData,
            rating: ratingText || null,
            gender
        };

        console.log("✅ Scrape successful:", data.name, "by", data.brand);
        res.json(data);

    } catch (error) {
        console.error("❌ Scraping Error:", error.message);
        if (browser) await browser.close();

        // Fallback: extract from URL
        let extractedName = "New Scent";
        let extractedBrand = "Brand";
        try {
            const urlParts = url.split('/perfume/')[1].split('/');
            extractedBrand = urlParts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const namePart = urlParts[1] || "";
            extractedName = namePart.split('-').slice(0, -1).join(' ') || "New Scent";
        } catch (e) { }

        return res.json({
            name: extractedName,
            brand: extractedBrand,
            description: "Could not fetch details automatically. Please fill manually.",
            image: "https://images.unsplash.com/photo-1616949755610-8c977f9f3b1e?auto=format&fit=crop&q=80&w=800",
            accords: {},
            longevity: "",
            sillage: "",
            season: "All",
            pyramid: { top: [], middle: [], base: [] }
        });
    }
});

// @route   POST api/scents/:id/journals
// @desc    Add a journal entry to a scent
// @access  Private
router.post('/:id/journals', auth, async (req, res) => {
    try {
        const scent = await Scent.findById(req.params.id);

        if (!scent) {
            return res.status(404).json({ msg: 'Scent not found' });
        }

        const newJournal = {
            user: req.user.username || "Anonymous", // Use username from token or default
            text: req.body.text,
            date: new Date()
        };

        scent.journals.unshift(newJournal);
        await scent.save();

        res.json(scent.journals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
