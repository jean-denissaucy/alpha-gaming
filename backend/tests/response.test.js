import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSuccessResponse, buildErrorResponse } from '../utils/response.js';

test('buildSuccessResponse wraps payload and keeps compatibility fields', () => {
    const response = buildSuccessResponse({ user: { id: 1 } }, { user: { id: 1 }, token: 'abc123' });

    assert.equal(response.success, true);
    assert.deepEqual(response.data, { user: { id: 1 } });
    assert.deepEqual(response.user, { id: 1 });
    assert.equal(response.token, 'abc123');
});

test('buildErrorResponse returns a consistent error payload', () => {
    const response = buildErrorResponse('Bad request', 400);

    assert.equal(response.success, false);
    assert.equal(response.error, 'Bad request');
    assert.equal(response.statusCode, 400);
});
