const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runVerification() {
    try {
        console.log('Starting verification for Media Features...');

        // 1. Register a test user
        const username = `mediatester_${Date.now()}`;
        const email = `${username}@example.com`;
        const password = 'password123';

        console.log(`Registering user: ${username}`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            username,
            email,
            password
        });
        const token = regRes.data.token;
        console.log('User registered.');

        const config = { headers: { 'x-auth-token': token } };

        // 2. Search for a movie (Breaking Bad)
        console.log('Searching for "Breaking Bad"...');
        const searchRes = await axios.get(`${API_URL}/media/search?query=Breaking Bad&type=tv`, config);
        const results = searchRes.data.results;

        if (results.length === 0) {
            console.error('❌ Search failed: No results found.');
            return;
        }

        const show = results[0];
        console.log(`Found: ${show.title} (ID: ${show.id})`);

        // 3. Add to Watched
        console.log('Adding to Watched list...');
        await axios.post(`${API_URL}/media/add`, {
            tmdbId: show.id,
            mediaType: 'tv',
            title: show.title,
            posterPath: show.poster_path,
            rating: 5
        }, config);
        console.log('Added to watched.');

        // 4. Verify in Watched List
        console.log('Fetching Watched list...');
        const watchedRes = await axios.get(`${API_URL}/media/watched`, config);
        const watchedItems = watchedRes.data;

        const found = watchedItems.find(i => i.tmdbId === show.id);
        if (found) {
            console.log('✅ Verified: Item is in watched list.');
        } else {
            console.error('❌ Verification Failed: Item not found in watched list.');
        }

        // 5. Test Recommendations
        console.log('Fetching Recommendations...');
        const recRes = await axios.get(`${API_URL}/media/recommendations`, config);
        console.log(`Received ${recRes.data.results.length} recommendations based on "${recRes.data.seed}".`);

        if (recRes.data.results.length > 0) {
            console.log('✅ Verified: Recommendations received.');
        } else {
            console.warn('⚠️ Warning: No recommendations received (might be API limit or empty source).');
        }

    } catch (err) {
        console.error('An error occurred:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('No response received (Network error?)');
        }
    }
}

runVerification();
