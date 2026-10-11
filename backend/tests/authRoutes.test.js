const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const express = require('express');
const request = require('supertest');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');

test('registration and login set a secure session cookie and return a public profile', async () => {
  const previousSecret = process.env.JWT_SECRET;
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  process.env.JWT_SECRET = 'route-test-secret-with-at-least-32-characters';
  const storedUsers = new Map();
  let createdPasswordHash;

  User.findOne = async ({ email }) => storedUsers.get(email) || null;
  User.create = async (userData) => {
    createdPasswordHash = userData.passwordHash;
    const user = {
      ...userData,
      _id: '507f1f77bcf86cd799439011',
      toPublicJSON() {
        const { passwordHash, ...publicUser } = this;
        return publicUser;
      },
    };
    storedUsers.set(user.email, user);
    return user;
  };

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    return res.status(error.statusCode || 500).json({ message: error.message });
  });

  try {
    const registration = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'TEST-USER@example.invalid',
        password: 'StrongPass123!',
      });

    assert.equal(registration.status, 201);
    assert.equal(registration.body.user.email, 'test-user@example.invalid');
    assert.equal(registration.body.user.passwordHash, undefined);
    assert.equal(await bcrypt.compare('StrongPass123!', createdPasswordHash), true);
    assert.equal(registration.body.token, undefined);
    assert.match(registration.headers['set-cookie'][0], /chatsphere_session=/);
    assert.match(registration.headers['set-cookie'][0], /HttpOnly/);
    assert.match(registration.headers['set-cookie'][0], /Secure/);
    assert.match(registration.headers['set-cookie'][0], /SameSite=Lax/);

    const duplicate = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test-user@example.invalid',
        password: 'StrongPass123!',
      });
    assert.equal(duplicate.status, 409);
    assert.match(duplicate.body.message, /already exists/);

    const invalidEmail = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'invalid', password: 'StrongPass123!' });
    assert.equal(invalidEmail.status, 400);

    const invalidPassword = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'new-user@example.invalid', password: 'short' });
    assert.equal(invalidPassword.status, 400);

    const invalidLoginEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid', password: 'StrongPass123!' });
    assert.equal(invalidLoginEmail.status, 400);

    const invalidLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-user@example.invalid', password: 'wrong-password' });
    assert.equal(invalidLogin.status, 401);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: ' TEST-USER@example.invalid ', password: 'StrongPass123!' });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.passwordHash, undefined);
    assert.equal(login.body.token, undefined);
    assert.match(login.headers['set-cookie'][0], /chatsphere_session=/);

    const logout = await request(app).post('/api/auth/logout');
    assert.equal(logout.status, 200);
    assert.match(logout.headers['set-cookie'][0], /chatsphere_session=;/);
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
