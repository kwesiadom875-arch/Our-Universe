const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const LibraryItem = require('../LibraryItem');

describe('LibraryItem Model Indexes', () => {
    test('should have index on user and createdAt', () => {
        const indexes = LibraryItem.schema.indexes();
        const found = indexes.some(index => {
            const keys = index[0];
            return keys.user === 1 && keys.createdAt === -1;
        });
        assert.ok(found, 'Index { user: 1, createdAt: -1 } should exist');
    });

    test('should have index on user and googleBookId', () => {
        const indexes = LibraryItem.schema.indexes();
        const found = indexes.some(index => {
            const keys = index[0];
            return keys.user === 1 && keys.googleBookId === 1;
        });
        assert.ok(found, 'Index { user: 1, googleBookId: 1 } should exist');
    });
});
