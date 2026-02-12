const https = require('https');

const url = 'https://www.fragrantica.com/perfume/Dior/Sauvage-31861.html';
console.log(`Testing native https fetch for: ${url}`);

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
    }
};

const req = https.get(url, options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', chunk => data += chunk);

    res.on('end', () => {
        if (res.statusCode === 200) {
            if (data.includes('Sauvage')) {
                console.log('✅ Success! Found "Sauvage" in response.');
            } else {
                console.log('❌ Success (200 OK) but content might be blocked/captcha.');
            }
        } else {
            console.log(`❌ Failed with status ${res.statusCode}`);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request Error: ${e.message}`);
});
