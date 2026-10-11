const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const { createRateLimiter } = require('../middleware/rateLimit');
const paymentRoutes = require('../routes/paymentRoutes');

function createLimiterApp(options) {
  const app = express();
  app.set('trust proxy', 'loopback');
  app.use(createRateLimiter(options));
  app.get('/limited', (_req, res) => res.status(200).json({ ok: true }));
  return app;
}

test('rate limiter allows the configured number of requests and rejects the next', async () => {
  const app = createLimiterApp({ windowMs: 60_000, maxRequests: 1, message: 'Slow down.', redis: null });
  const firstResponse = await request(app).get('/limited').set('X-Forwarded-For', '192.0.2.1');
  const secondResponse = await request(app).get('/limited').set('X-Forwarded-For', '192.0.2.1');

  assert.equal(firstResponse.status, 200);
  assert.equal(firstResponse.headers['ratelimit-remaining'], '0');
  assert.equal(secondResponse.status, 429);
  assert.equal(secondResponse.body.message, 'Slow down.');
  assert.ok(Number(secondResponse.headers['retry-after']) >= 1);
});

test('rate limiter keeps separate client buckets', async () => {
  const app = createLimiterApp({ windowMs: 60_000, maxRequests: 1, message: 'Slow down.', redis: null });
  const firstResponse = await request(app).get('/limited').set('X-Forwarded-For', '192.0.2.2');
  const secondResponse = await request(app).get('/limited').set('X-Forwarded-For', '192.0.2.3');

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
});

test('rate limiter uses the in-memory store when Redis is not configured', async () => {
  const app = createLimiterApp({ windowMs: 60_000, maxRequests: 1, message: 'Slow down.', redis: null });
  const response = await request(app).get('/limited').set('X-Forwarded-For', '192.0.2.4');

  assert.equal(response.status, 200);
  assert.equal(response.headers['ratelimit-remaining'], '0');
});

test('rate limiter falls back to memory while Redis is not ready', async () => {
  const app = createLimiterApp({
    windowMs: 60_000,
    maxRequests: 1,
    message: 'Slow down.',
    redis: { isReady: false },
  });
  const response = await request(app).get('/limited').set('X-Forwarded-For', '192.0.2.5');

  assert.equal(response.status, 200);
  assert.equal(response.headers['ratelimit-remaining'], '0');
});

test('demo payment amounts accept valid cents without floating-point rounding errors', () => {
  assert.equal(paymentRoutes.parseDemoAmount(0.29), 0.29);
  assert.equal(paymentRoutes.parseDemoAmount('125.00'), 125);
  assert.equal(paymentRoutes.parseDemoAmount('0.001'), null);
  assert.equal(paymentRoutes.parseDemoAmount('1e2'), null);
  assert.equal(paymentRoutes.parseDemoAmount(true), null);
});
