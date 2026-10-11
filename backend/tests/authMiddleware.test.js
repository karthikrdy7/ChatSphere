const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { generateToken } = require('../utils/security');
const { TOKEN_COOKIE_NAME } = require('../utils/authCookie');

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('invalid JWT cookie is rejected without querying the user collection', async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'unit-test-secret-with-at-least-32-characters';
  const originalFindById = User.findById;
  User.findById = () => {
    throw new Error('The user query must not run for invalid JWTs.');
  };
  const response = createResponse();

  try {
    await authMiddleware({
      headers: {},
      cookies: { [TOKEN_COOKIE_NAME]: 'invalid-token' },
    }, response, (error) => {
      if (error) throw error;
    });
    assert.equal(response.statusCode, 401);
    assert.equal(response.body.message, 'Invalid or expired token.');
  } finally {
    User.findById = originalFindById;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('database errors are passed to Express instead of being reported as invalid JWTs', async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'unit-test-secret-with-at-least-32-characters';
  const originalFindById = User.findById;
  const databaseError = new Error('Database is unavailable.');
  User.findById = () => ({
    select: async () => {
      throw databaseError;
    },
  });
  const response = createResponse();
  let forwardedError;

  try {
    await authMiddleware({
      headers: {},
      cookies: { [TOKEN_COOKIE_NAME]: generateToken('507f1f77bcf86cd799439011') },
    }, response, (error) => {
      forwardedError = error;
    });
    assert.equal(forwardedError, databaseError);
    assert.equal(response.statusCode, 200);
  } finally {
    User.findById = originalFindById;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('Bearer authorization headers are not accepted as an authentication token', async () => {
  const response = createResponse();

  await authMiddleware({ headers: { authorization: 'Bearer legacy-token' } }, response, () => {});
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, 'Authentication required.');
});
