const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const LibraryItem = require('../LibraryItem');

describe('Schema Index Validation', () => {
  test('LibraryItem should have index on { user: 1, createdAt: -1 }', () => {
    const indexes = LibraryItem.schema.indexes();
    const hasIndex = indexes.some(idx => {
      const keys = idx[0];
      return keys.user === 1 && keys.createdAt === -1;
    });

    // This should fail initially
    assert.ok(hasIndex, 'LibraryItem should have an index on { user: 1, createdAt: -1 } for efficient sorting');
  });

  test('LibraryItem should have index on { user: 1, googleBookId: 1 }', () => {
    const indexes = LibraryItem.schema.indexes();
    const hasIndex = indexes.some(idx => {
      const keys = idx[0];
      return keys.user === 1 && keys.googleBookId === 1;
    });

    // This should fail initially
    assert.ok(hasIndex, 'LibraryItem should have an index on { user: 1, googleBookId: 1 } for efficient lookups');
  });
});
