const request = require('supertest');
const app = require('../src/server');
const { connectDB, clearDB, closeDB } = require('./helpers/dbSetup');

async function authHeader() {
  await request(app).post('/api/auth/register').send({
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123',
  });

  const login = await request(app).post('/api/auth/login').send({
    email: 'alice@example.com',
    password: 'password123',
  });

  return { Authorization: `Bearer ${login.body.token}` };
}

describe('Logout endpoint', () => {
  beforeAll(connectDB);
  afterEach(clearDB);
  afterAll(closeDB);

  it('POST /api/auth/logout with valid token returns 200', async () => {
    const headers = await authHeader();

    const res = await request(app).post('/api/auth/logout').set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });

  it('POST /api/auth/logout without token returns 401', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.statusCode).toBe(401);
  });
});
