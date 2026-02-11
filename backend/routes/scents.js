const express = require('express');
const axios = require('axios');
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

// @route   POST api/scents/scrape
// @desc    Magic fetch from Fragrantica using Puppeteer (Headless Chrome)
// @access  Private
router.post('/scrape', auth, async (req, res) => {
    const { url } = req.body;
    let browser = null;

    try {
        // Validation
        if (!url.includes('fragrantica.com')) {
            throw new Error("Not a fragrantica link");
        }

        // Dynamic import because Puppeteer is often ESM, but we are using CommonJS
        // Actually standard puppeteer works with require usually, but let's see.
        const puppeteer = require('puppeteer');

        // Launch Headless Browser
        // We use 'new' headless mode for better detection evasion
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for some environments
        });

        const page = await browser.newPage();

        // Set User Agent to a real desktop browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate
        // We wait until 'domcontentloaded' to be faster, but sometimes 'networkidle2' is safer for JS heavy sites
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Extract Data
        // We run document.querySelector inside the page context
        const data = await page.evaluate(() => {
            const metaImage = document.querySelector('meta[property="og:image"]');
            const metaTitle = document.querySelector('meta[property="og:title"]');
            const metaDesc = document.querySelector('meta[name="description"]');

            // Try to find the big main image if og:image fails
            const mainImage = document.querySelector('img[itemprop="image"]');

            return {
                image: metaImage ? metaImage.content : (mainImage ? mainImage.src : null),
                title: metaTitle ? metaTitle.content : document.title,
                description: metaDesc ? metaDesc.content : ""
            };
        });

        await browser.close();

        // Process the extracted data
        let name = "Unknown Scent";
        let brand = "Unknown Brand";
        const fullTitle = data.title;

        if (fullTitle) {
            // "Sauvage Dior for men"
            const parts = fullTitle.split(' for ')[0]; // "Sauvage Dior"

            // Try URL parts for brand hint
            const urlParts = url.split('/');
            const brandHint = urlParts[4] || "";

            if (parts.toLowerCase().includes(brandHint.toLowerCase())) {
                brand = brandHint.charAt(0).toUpperCase() + brandHint.slice(1);
                name = parts.replace(new RegExp(brand, 'i'), '').trim();
            } else {
                const words = parts.split(' ');
                brand = words.pop();
                name = words.join(' ');
            }
        }

        res.json({
            name: name || "New Scent",
            brand: brand || "Brand",
            description: data.description || "No description found.",
            image: data.image || "https://images.unsplash.com/photo-1616949755610-8c977f9f3b1e?auto=format&fit=crop&q=80&w=800",
            accords: { "Floral": 50, "Woody": 30, "Fresh": 20 },
            longevity: "Moderate",
            sillage: "Moderate",
            season: "All",
            pyramid: { top: [], middle: [], base: [] }
        });

    } catch (err) {
        console.error("Puppeteer Scrape failed:", err.message);
        if (browser) await browser.close();

        // Fallback to the text-based mock (Same as before)
        let extractedName = "Unknown Scent";
        let extractedBrand = "Unknown Brand";
        if (url && url.includes('fragrantica.com')) {
            try {
                const parts = url.split('/');
                const namePart = parts[parts.length - 1];
                extractedName = namePart.split('-').slice(0, -1).join(' ').replace(/-/g, ' ');
                extractedBrand = parts[4] || "Designer";
            } catch (e) { }
        }

        return res.json({
            name: extractedName !== "Unknown Scent" ? extractedName : "New Scent",
            brand: extractedBrand !== "Unknown Brand" ? extractedBrand : "Brand",
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
        const user = await require('../models/User').findById(req.user.id);
        const scent = await Scent.findById(req.params.id);

        if (!scent) {
            return res.status(404).json({ msg: 'Scent not found' });
        }

        const newJournal = {
            user: user.username || "Anonymous", // Use user's name or default
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
