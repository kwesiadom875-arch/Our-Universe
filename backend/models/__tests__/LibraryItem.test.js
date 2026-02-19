const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const LibraryItem = require('../LibraryItem');

describe('LibraryItem Model Indexes', () => {
    test('should have an index on user and createdAt for sorting', () => {
        const indexes = LibraryItem.schema.indexes();
        const found = indexes.some(idx => {
            const [fields, options] = idx;
            return fields.user === 1 && fields.createdAt === -1;
        });
        assert.ok(found, 'Index { user: 1, createdAt: -1 } is missing');
    });

    test('should have an index on user and googleBookId for lookups', () => {
        const indexes = LibraryItem.schema.indexes();
        const found = indexes.some(idx => {
            const [fields, options] = idx;
            return fields.user === 1 && fields.googleBookId === 1;
        });
        assert.ok(found, 'Index { user: 1, googleBookId: 1 } is missing');
    });
});
