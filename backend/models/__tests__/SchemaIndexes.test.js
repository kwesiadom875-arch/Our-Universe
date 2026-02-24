const { test, describe } = require('node:test');
const assert = require('node:assert');
const LibraryItem = require('../LibraryItem');

describe('Mongoose Model Indexes', () => {

    test('LibraryItem should have lookup and sort indexes', () => {
        const indexes = LibraryItem.schema.indexes();

        // Check for unique lookup index
        const lookupIndex = indexes.find(idx =>
            idx[0].user === 1 &&
            idx[0].googleBookId === 1
        );
        assert.ok(lookupIndex, 'LibraryItem should have index on user, googleBookId');
        assert.ok(lookupIndex[1].unique, 'LibraryItem lookup index should be unique');

        // Check for sort index
        const sortIndex = indexes.find(idx =>
            idx[0].user === 1 &&
            idx[0].createdAt === -1
        );
        assert.ok(sortIndex, 'LibraryItem should have index on user, createdAt (-1)');
    });
});
