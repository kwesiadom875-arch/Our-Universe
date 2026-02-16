const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const LibraryItem = require('../LibraryItem');

describe('LibraryItem Model Indexes', () => {
    test('should have index on { user: 1, createdAt: -1 }', () => {
        const indexes = LibraryItem.schema.indexes();
        const index = indexes.find(idx =>
            idx[0].user === 1 && idx[0].createdAt === -1
        );
        assert.ok(index, 'Index { user: 1, createdAt: -1 } should exist');
    });

    test('should have index on { user: 1, googleBookId: 1 }', () => {
        const indexes = LibraryItem.schema.indexes();
        const index = indexes.find(idx =>
            idx[0].user === 1 && idx[0].googleBookId === 1
        );
        assert.ok(index, 'Index { user: 1, googleBookId: 1 } should exist');
    });
});
