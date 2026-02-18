const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const LibraryItem = require('../LibraryItem');

describe('LibraryItem Model Schema Validation', () => {
    test('should have an index for user and createdAt for optimized sorting', () => {
        const indexes = LibraryItem.schema.indexes();
        const hasIndex = indexes.some(index => {
            const [fields, options] = index;
            return fields.user === 1 && fields.createdAt === -1;
        });
        assert.ok(hasIndex, 'Missing index on { user: 1, createdAt: -1 }');
    });

    test('should have an index for user and googleBookId for duplicate checks', () => {
        const indexes = LibraryItem.schema.indexes();
        const hasIndex = indexes.some(index => {
            const [fields, options] = index;
            return fields.user === 1 && fields.googleBookId === 1;
        });
        assert.ok(hasIndex, 'Missing index on { user: 1, googleBookId: 1 }');
    });
});
