const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const User = require('../User');

describe('User Model Schema Validation', () => {
    test('should be valid when all required fields including password are provided (no googleId)', () => {
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        const error = user.validateSync();
        assert.strictEqual(error, undefined);
    });

    test('should be valid when googleId is provided without password', () => {
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            googleId: 'google123'
        });
        const error = user.validateSync();
        assert.strictEqual(error, undefined);
    });

    test('should be invalid when both password and googleId are missing', () => {
        const user = new User({
            username: 'testuser',
            email: 'test@example.com'
        });
        const error = user.validateSync();
        assert.ok(error);
        assert.ok(error.errors.password);
        assert.strictEqual(error.errors.password.kind, 'required');
    });

    test('should be invalid when username is missing', () => {
        const user = new User({
            email: 'test@example.com',
            password: 'password123'
        });
        const error = user.validateSync();
        assert.ok(error);
        assert.ok(error.errors.username);
        assert.strictEqual(error.errors.username.kind, 'required');
    });

    test('should be invalid when email is missing', () => {
        const user = new User({
            username: 'testuser',
            password: 'password123'
        });
        const error = user.validateSync();
        assert.ok(error);
        assert.ok(error.errors.email);
        assert.strictEqual(error.errors.email.kind, 'required');
    });
});
