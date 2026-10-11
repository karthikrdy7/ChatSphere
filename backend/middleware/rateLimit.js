const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');

let redisClient = null;
let fallbackWarningLogged = false;
let limiterSequence = 0;

if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', () => warnMemoryFallback());
  redisClient.on('ready', () => {
    fallbackWarningLogged = false;
    console.info('Redis rate-limit store connected.');
  });
  redisClient.connect().catch(() => warnMemoryFallback());
} else {
  warnMemoryFallback();
}

function warnMemoryFallback() {
  if (fallbackWarningLogged) return;
  fallbackWarningLogged = true;
  console.warn('Redis rate limiting is unavailable; using the in-memory limiter for this process.');
}

function createRateLimiter({ windowMs, maxRequests, message, prefix, redis = redisClient }) {
  const memoryLimiter = rateLimit({
    windowMs,
    limit: maxRequests,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });

  if (!redis) {
    return (req, res, next) => {
      warnMemoryFallback();
      return memoryLimiter(req, res, next);
    };
  }

  let redisLimiter;
  const getRedisLimiter = () => {
    if (!redisLimiter) {
      redisLimiter = rateLimit({
        windowMs,
        limit: maxRequests,
        message: { message },
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
          prefix: prefix || `chatsphere:rate-limit:${++limiterSequence}:`,
          sendCommand: (...args) => redis.sendCommand(args),
        }),
      });
    }
    return redisLimiter;
  };

  return (req, res, next) => {
    if (!redis.isReady) {
      warnMemoryFallback();
      return memoryLimiter(req, res, next);
    }

    return getRedisLimiter()(req, res, (error) => {
      if (error) {
        warnMemoryFallback();
        return memoryLimiter(req, res, next);
      }
      return next();
    });
  };
}

module.exports = { createRateLimiter };
