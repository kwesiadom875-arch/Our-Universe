const { test, describe } = require('node:test');
const assert = require('node:assert');
const LibraryItem = require('../LibraryItem');
const Milestone = require('../Milestone');

describe('Schema Indexes Validation', () => {
    test('LibraryItem schema should have expected indexes', () => {
        const indexes = LibraryItem.schema.indexes();

        // Find the index { user: 1, createdAt: -1 }
        const userDateIndex = indexes.find(idx =>
            idx[0].user === 1 && idx[0].createdAt === -1
        );
        assert.ok(userDateIndex, 'Missing index { user: 1, createdAt: -1 } on LibraryItem');

        // Find the unique index { user: 1, googleBookId: 1 }
        const uniqueBookIndex = indexes.find(idx =>
            idx[0].user === 1 && idx[0].googleBookId === 1 && idx[1].unique === true
        );
        assert.ok(uniqueBookIndex, 'Missing unique index { user: 1, googleBookId: 1 } on LibraryItem');
    });

    test('Milestone schema should have expected indexes', () => {
        const indexes = Milestone.schema.indexes();

        // Find the index { user1: 1, date: 1 }
        const user1DateIndex = indexes.find(idx =>
            idx[0].user1 === 1 && idx[0].date === 1
        );
        assert.ok(user1DateIndex, 'Missing index { user1: 1, date: 1 } on Milestone');

        // Find the index { user2: 1, date: 1 }
        const user2DateIndex = indexes.find(idx =>
            idx[0].user2 === 1 && idx[0].date === 1
        );
        assert.ok(user2DateIndex, 'Missing index { user2: 1, date: 1 } on Milestone');
    });
});
