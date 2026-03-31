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

describe('User profile endpoints', () => {
  beforeAll(connectDB);
  afterEach(clearDB);
  afterAll(closeDB);

  it('GET /api/users/profile returns user data', async () => {
    const headers = await authHeader();

    const res = await request(app).get('/api/users/profile').set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('alice');
    expect(res.body.email).toBe('alice@example.com');
    // Password hash should not be exposed
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/users/profile');

    expect(res.statusCode).toBe(401);
  });
});
