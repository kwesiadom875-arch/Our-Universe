const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Milestone = require('../Milestone');
const LibraryItem = require('../LibraryItem');

describe('Schema Index Verification', () => {

    function hasIndex(model, indexFields) {
        const indexes = model.schema.indexes();
        // indexes is array of arrays: [[{ field: 1 }, { options }]]
        return indexes.some(idx => {
            const fields = idx[0];
            // Check if fields match indexFields deeply
            const keys = Object.keys(indexFields);
            if (keys.length !== Object.keys(fields).length) return false;

            return keys.every(key => fields[key] === indexFields[key]);
        });
    }

    test('Milestone model should have user1 and user2 indexes sorted by date', () => {
        const hasUser1Index = hasIndex(Milestone, { user1: 1, date: 1 });
        const hasUser2Index = hasIndex(Milestone, { user2: 1, date: 1 });

        assert.ok(hasUser1Index, 'Missing index { user1: 1, date: 1 } on Milestone');
        assert.ok(hasUser2Index, 'Missing index { user2: 1, date: 1 } on Milestone');
    });

    test('LibraryItem model should have user index sorted by createdAt', () => {
        const hasUserDateIndex = hasIndex(LibraryItem, { user: 1, createdAt: -1 });
        assert.ok(hasUserDateIndex, 'Missing index { user: 1, createdAt: -1 } on LibraryItem');
    });

    test('LibraryItem model should have user and googleBookId index', () => {
         const hasUserBookIndex = hasIndex(LibraryItem, { user: 1, googleBookId: 1 });
         assert.ok(hasUserBookIndex, 'Missing index { user: 1, googleBookId: 1 } on LibraryItem');
    });

});
