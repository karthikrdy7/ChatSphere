const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCreatedAtCursor } = require('../utils/messageCursor');

test('message cursor includes older timestamps and same-timestamp IDs', () => {
  const cursor = buildCreatedAtCursor('2026-10-11T12:00:00.000Z', '507f1f77bcf86cd799439011');

  assert.equal(cursor.error, undefined);
  assert.deepEqual(cursor.filter, {
    $or: [
      { createdAt: { $lt: new Date('2026-10-11T12:00:00.000Z') } },
      { createdAt: new Date('2026-10-11T12:00:00.000Z'), _id: { $lt: '507f1f77bcf86cd799439011' } },
    ],
  });
});

test('message cursor rejects invalid timestamps and IDs without timestamps', () => {
  assert.match(buildCreatedAtCursor('not-a-date').error, /valid timestamp/);
  assert.match(buildCreatedAtCursor('', '507f1f77bcf86cd799439011').error, /timestamp is required/);
  assert.deepEqual(buildCreatedAtCursor().filter, null);
});
