const assert = require('node:assert');
const test = require('node:test');

const LibraryItem = require('../LibraryItem');
const Milestone = require('../Milestone');

test('Schema index definitions', async (t) => {
    await t.test('LibraryItem should have index on { user: 1, createdAt: -1 }', () => {
        const indexes = LibraryItem.schema.indexes();
        const hasIndex = indexes.some(idx =>
            idx[0].user === 1 && idx[0].createdAt === -1
        );
        assert.ok(hasIndex, 'LibraryItem is missing { user: 1, createdAt: -1 } index');
    });

    await t.test('LibraryItem should have unique compound index on { user: 1, googleBookId: 1 }', () => {
        const indexes = LibraryItem.schema.indexes();
        const hasIndex = indexes.some(idx =>
            idx[0].user === 1 && idx[0].googleBookId === 1 && idx[1].unique === true
        );
        assert.ok(hasIndex, 'LibraryItem is missing unique { user: 1, googleBookId: 1 } index');
    });

    await t.test('Milestone should have index on { user1: 1, date: 1 }', () => {
        const indexes = Milestone.schema.indexes();
        const hasIndex = indexes.some(idx =>
            idx[0].user1 === 1 && idx[0].date === 1
        );
        assert.ok(hasIndex, 'Milestone is missing { user1: 1, date: 1 } index');
    });

    await t.test('Milestone should have index on { user2: 1, date: 1 }', () => {
        const indexes = Milestone.schema.indexes();
        const hasIndex = indexes.some(idx =>
            idx[0].user2 === 1 && idx[0].date === 1
        );
        assert.ok(hasIndex, 'Milestone is missing { user2: 1, date: 1 } index');
    });
});
