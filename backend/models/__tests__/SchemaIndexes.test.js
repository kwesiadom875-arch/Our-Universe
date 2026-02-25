const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const LibraryItem = require('../LibraryItem');
const Milestone = require('../Milestone');

describe('Schema Indexes', () => {
    test('LibraryItem should have index on user and createdAt', () => {
        const indexes = LibraryItem.schema.indexes();
        const found = indexes.some(idx => {
            const keys = idx[0];
            return keys.user === 1 && keys.createdAt === -1;
        });
        assert.ok(found, 'LibraryItem missing index { user: 1, createdAt: -1 }');
    });

    test('LibraryItem should have index on user and googleBookId', () => {
        const indexes = LibraryItem.schema.indexes();
        const found = indexes.some(idx => {
            const keys = idx[0];
            return keys.user === 1 && keys.googleBookId === 1;
        });
        assert.ok(found, 'LibraryItem missing index { user: 1, googleBookId: 1 }');
    });

    test('Milestone should have index on user1 and date', () => {
        const indexes = Milestone.schema.indexes();
        const found = indexes.some(idx => {
            const keys = idx[0];
            return keys.user1 === 1 && keys.date === 1;
        });
        assert.ok(found, 'Milestone missing index { user1: 1, date: 1 }');
    });

    test('Milestone should have index on user2 and date', () => {
        const indexes = Milestone.schema.indexes();
        const found = indexes.some(idx => {
            const keys = idx[0];
            return keys.user2 === 1 && keys.date === 1;
        });
        assert.ok(found, 'Milestone missing index { user2: 1, date: 1 }');
    });
});
