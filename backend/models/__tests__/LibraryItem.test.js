const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const LibraryItem = require('../LibraryItem');

describe('LibraryItem Model Index Validation', () => {
    test('should have index on user and createdAt for sorting', () => {
        const indexes = LibraryItem.schema.indexes();
        const found = indexes.find(index => {
            const keys = index[0];
            return keys.user === 1 && keys.createdAt === -1;
        });
        assert.ok(found, 'Index { user: 1, createdAt: -1 } is missing');
    });

    test('should have index on user and googleBookId for lookups', () => {
        const indexes = LibraryItem.schema.indexes();
        const found = indexes.find(index => {
            const keys = index[0];
            return keys.user === 1 && keys.googleBookId === 1;
        });
        assert.ok(found, 'Index { user: 1, googleBookId: 1 } is missing');
    });
});
