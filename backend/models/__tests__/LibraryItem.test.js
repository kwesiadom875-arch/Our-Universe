const { test, describe } = require('node:test');
const assert = require('node:assert');
const LibraryItem = require('../LibraryItem');

describe('LibraryItem Model Indexes', () => {
    test('should have compound index on user and createdAt for efficient sorting', () => {
        const indexes = LibraryItem.schema.indexes();
        const sortIndex = indexes.find(idx => {
            const keys = idx[0];
            return keys.user === 1 && keys.createdAt === -1;
        });

        // Log indexes if not found, for debugging
        if (!sortIndex) {
            console.log('Available indexes:', JSON.stringify(indexes, null, 2));
        }

        assert.ok(sortIndex, 'Index { user: 1, createdAt: -1 } should exist to optimize library list views');
    });

    test('should have compound index on user and googleBookId for fast lookup', () => {
        const indexes = LibraryItem.schema.indexes();
        const lookupIndex = indexes.find(idx => {
            const keys = idx[0];
            return keys.user === 1 && keys.googleBookId === 1;
        });

        // Log indexes if not found, for debugging
        if (!lookupIndex) {
            console.log('Available indexes:', JSON.stringify(indexes, null, 2));
        }

        assert.ok(lookupIndex, 'Index { user: 1, googleBookId: 1 } should exist to optimize duplicate checks');
    });
});
