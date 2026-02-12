const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    const url = 'https://www.fragrantica.com/perfume/Dior/Sauvage-31861.html';
    console.log(`Testing lightweight fetch for: ${url}`);

    try {
        const start = Date.now();
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/'
            },
            timeout: 5000
        });
        const duration = Date.now() - start;

        const $ = cheerio.load(data);
        const title = $('h1[itemprop="name"]').text().trim();

        if (title) {
            console.log(`✅ Success! Fetched in ${duration}ms`);
            console.log(`   Title found: ${title}`);
        } else {
            console.log(`❌ Fetched in ${duration}ms but title not found (blocked?)`);
        }

    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
        }
    }
}

testScrape();
