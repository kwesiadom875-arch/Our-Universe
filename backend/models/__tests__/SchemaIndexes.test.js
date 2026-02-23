const { test, describe } = require('node:test');
const assert = require('node:assert');
const LibraryItem = require('../LibraryItem');
const Milestone = require('../Milestone');

function hasIndex(model, indexSpec) {
    const indexes = model.schema.indexes();
    // indexes is an array of [spec, options]
    return indexes.some(([spec]) => {
        // Check if all keys in indexSpec are present in spec with the same value
        // and that spec has no extra keys
        if (Object.keys(spec).length !== Object.keys(indexSpec).length) return false;
        for (const key in indexSpec) {
            if (spec[key] !== indexSpec[key]) return false;
        }
        return true;
    });
}

describe('Model Index Verification', () => {
    test('LibraryItem should have index on { user: 1, createdAt: -1 }', () => {
        const hasIt = hasIndex(LibraryItem, { user: 1, createdAt: -1 });
        assert.strictEqual(hasIt, true, 'LibraryItem missing index { user: 1, createdAt: -1 }');
    });

    test('LibraryItem should have index on { user: 1, googleBookId: 1 }', () => {
        const hasIt = hasIndex(LibraryItem, { user: 1, googleBookId: 1 });
        assert.strictEqual(hasIt, true, 'LibraryItem missing index { user: 1, googleBookId: 1 }');
    });

    test('Milestone should have index on { user1: 1, date: 1 }', () => {
        const hasIt = hasIndex(Milestone, { user1: 1, date: 1 });
        assert.strictEqual(hasIt, true, 'Milestone missing index { user1: 1, date: 1 }');
    });

    test('Milestone should have index on { user2: 1, date: 1 }', () => {
        const hasIt = hasIndex(Milestone, { user2: 1, date: 1 });
        assert.strictEqual(hasIt, true, 'Milestone missing index { user2: 1, date: 1 }');
    });
});
