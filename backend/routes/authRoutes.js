const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { hashPassword, getJwtSecret, generateToken } = require('../utils/security');
const { TOKEN_COOKIE_NAME, getAuthCookieOptions } = require('../utils/authCookie');
const { authMiddleware } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();
const registerAttemptLimit = createRateLimiter({
  prefix: 'chatsphere:rate-limit:auth-register:',
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many registration attempts. Please try again in an hour.',
});
const loginAttemptLimit = createRateLimiter({
  prefix: 'chatsphere:rate-limit:auth-login:',
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

const validateAuthRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  return next();
};

const validateRegister = [
  body('name')
    .isString().withMessage('Name must be between 2 and 80 characters.')
    .bail()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .isString().withMessage('Please provide a valid email address.')
    .bail()
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .customSanitizer((email) => email.toLowerCase()),
  body('password')
    .isString().withMessage('Password must be at least 8 characters and no more than 72 bytes.')
    .bail()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters and no more than 72 bytes.')
    .bail()
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('Password must be at least 8 characters and no more than 72 bytes.'),
];

const validateLogin = [
  body('email')
    .isString().withMessage('Email and password are required.')
    .bail()
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .customSanitizer((email) => email.toLowerCase()),
  body('password')
    .isString().withMessage('Email and password are required.')
    .bail()
    .notEmpty().withMessage('Email and password are required.')
    .bail()
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('Password is too long.'),
];

function setAuthCookie(res, token) {
  return res.cookie(TOKEN_COOKIE_NAME, token, getAuthCookieOptions());
}

router.post('/register', registerAttemptLimit, validateRegister, validateAuthRequest, async (req, res, next) => {
  try {
    getJwtSecret();
    const { name, email, password } = req.body || {};
    const normalizedName = name.trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: normalizedName,
      email,
      passwordHash,
      avatar: normalizedName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'CU',
      status: 'Available',
    });

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: user.toPublicJSON(),
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    next(error);
  }
});

router.post('/login', loginAttemptLimit, validateLogin, validateAuthRequest, async (req, res, next) => {
  try {
    getJwtSecret();
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user.toPublicJSON() });
});

router.get('/users', authMiddleware, async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filter = { _id: { $ne: req.user._id } };
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).select('name email avatar status online lastSeen').sort({ name: 1 }).limit(100);
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, status, avatar } = req.body || {};
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
        return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
      }
      user.name = name.trim();
    }
    if (status !== undefined) {
      if (typeof status !== 'string' || status.length > 140) {
        return res.status(400).json({ message: 'Status must be 140 characters or fewer.' });
      }
      user.status = status.trim();
    }
    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || avatar.length > 500) {
        return res.status(400).json({ message: 'Avatar must be a URL string of 500 characters or fewer.' });
      }
      user.avatar = avatar.trim();
    }
    await user.save();

    return res.json({ user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, getAuthCookieOptions());
  return res.status(200).json({ message: 'Logged out successfully.' });
});

module.exports = router;
