const { test, describe, beforeEach, mock } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');

// Mock TMDB_API_KEY
process.env.TMDB_API_KEY = 'test-key';

// Mock axios.get
// We need to do this BEFORE requiring the service if we want to ensure it uses our mocked method
// but since axios exports an instance, modifying it here should reflect in the service
// provided the service uses the default export.

// However, tmdbService requires axios.
// Let's verify if axios is a function or object with methods.
// Usually axios is a function with properties.

// We will overwrite axios.get with a mock function.
axios.get = mock.fn(async () => ({ data: { results: [] } }));

const { fetchPopularMedia } = require('../tmdbService');

describe('tmdbService', () => {
    beforeEach(() => {
        axios.get.mock.resetCalls();
    });

    test('should fetch from API on first call', async () => {
        const mockData = { results: [{ id: 1, title: 'Test Movie' }] };
        axios.get.mock.mockImplementation(async () => ({ data: mockData }));

        const result = await fetchPopularMedia('movie', 1);

        assert.deepStrictEqual(result, mockData);
        assert.strictEqual(axios.get.mock.callCount(), 1);

        // Verify URL and Params
        const call = axios.get.mock.calls[0];
        assert.strictEqual(call.arguments[0], 'https://api.themoviedb.org/3/movie/popular');
        assert.deepStrictEqual(call.arguments[1].params, {
            api_key: 'test-key',
            language: 'en-US',
            page: 1
        });
    });

    test('should return cached data on second call', async () => {
        const mockData = { results: [{ id: 2, title: 'Another Movie' }] };
        axios.get.mock.mockImplementation(async () => ({ data: mockData }));

        // First call - API hit
        await fetchPopularMedia('movie', 2);

        // Second call - Cache hit
        const result = await fetchPopularMedia('movie', 2);

        assert.deepStrictEqual(result, mockData);
        assert.strictEqual(axios.get.mock.callCount(), 1); // Still 1 call
    });

    test('should fetch again for different page', async () => {
        const mockData = { results: [] };
        axios.get.mock.mockImplementation(async () => ({ data: mockData }));

        // Page 3
        await fetchPopularMedia('movie', 3);
        // Page 4
        await fetchPopularMedia('movie', 4);

        assert.strictEqual(axios.get.mock.callCount(), 2);
    });
});
