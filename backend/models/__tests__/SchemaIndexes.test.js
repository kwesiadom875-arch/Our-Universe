const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const LibraryItem = require('../LibraryItem');

describe('Schema Indexes', () => {
    test('LibraryItem should have compound index for user and createdAt', () => {
        const indexes = LibraryItem.schema.indexes();
        const hasIndex = indexes.some(idx => {
            const keys = idx[0];
            return keys.user === 1 && keys.createdAt === -1;
        });

        assert.ok(hasIndex, 'Missing index { user: 1, createdAt: -1 } on LibraryItem');
    });

    test('LibraryItem should have compound index for user and googleBookId', () => {
        const indexes = LibraryItem.schema.indexes();
        const hasIndex = indexes.some(idx => {
            const keys = idx[0];
            return keys.user === 1 && keys.googleBookId === 1;
        });

        assert.ok(hasIndex, 'Missing index { user: 1, googleBookId: 1 } on LibraryItem');
    });
});
