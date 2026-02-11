const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
    const url = 'https://www.fragrantica.com/perfume/Dior/Sauvage-31861.html';
    console.log('Testing scrape for:', url);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('h1[itemprop="name"]', { timeout: 10000 });
    } catch (e) { console.log('Timeout, continuing...'); }

    const content = await page.content();
    await browser.close();

    const ch = cheerio.load(content);

    // =============== NEW SELECTORS ===============
    console.log('\n=== PYRAMID via .pyramid-level-container ===');

    const pyramidContainers = ch('.pyramid-level-container');
    console.log('Pyramid containers found:', pyramidContainers.length);

    const levels = ['top', 'middle', 'base'];
    const pyramidData = { top: [], middle: [], base: [] };

    pyramidContainers.each((i, container) => {
        if (i < 3) {
            const notes = [];
            // Each note is likely in a child element with the note name text
            ch(container).find('span, a, div').each((j, noteEl) => {
                const text = ch(noteEl).text().trim();
                // Filter out empty, very short, or container text
                if (text && text.length > 1 && text.length < 50 && !text.includes('\n')) {
                    notes.push(text);
                }
            });
            const uniqueNotes = [...new Set(notes)].filter(n => n.length > 1);
            pyramidData[levels[i]] = uniqueNotes;
            console.log(`  Level ${i} (${levels[i]}):`, uniqueNotes);
        }
    });

    console.log('\nFinal pyramid:', JSON.stringify(pyramidData, null, 2));

    // =============== ACCORDS ===============
    console.log('\n=== ACCORDS ===');

    // Try various selectors for accords
    const accordSelectors = [
        '[class*="accord"]',
        'div[style*="width"][style*="background"]',
        '.cell div[style*="width"]',
    ];

    for (const sel of accordSelectors) {
        const found = ch(sel);
        if (found.length > 0 && found.length < 30) {
            console.log(`\nSelector "${sel}": ${found.length} elements`);
            found.each((i, el) => {
                const cls = ch(el).attr('class') || '';
                const style = ch(el).attr('style') || '';
                const text = ch(el).text().trim();
                if (text && text.length > 1 && text.length < 50) {
                    console.log(`  ${i}: text="${text}" style="${style.substring(0, 120)}"`);
                }
            });
        }
    }

    // Also try to find accords by looking for percentage bars with text
    console.log('\n=== ACCORD BARS (alternative) ===');
    ch('div[style*="width:"]').each((i, el) => {
        const style = ch(el).attr('style') || '';
        const text = ch(el).text().trim();
        const widthMatch = style.match(/width:\s*([\d.]+)(%|px)/);
        if (widthMatch && text && text.length > 1 && text.length < 40 && !text.includes('\n')) {
            console.log(`  "${text}" => width: ${widthMatch[1]}${widthMatch[2]}`);
        }
    });

})().catch(e => console.error('Error:', e.message));
