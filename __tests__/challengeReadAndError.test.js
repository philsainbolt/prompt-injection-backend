const request = require('supertest');
const app = require('../src/server');
const errorHandler = require('../src/middleware/errorHandler');
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

describe('Challenge read endpoints', () => {
  beforeAll(connectDB);
  afterEach(clearDB);
  afterAll(closeDB);

  it('GET /api/challenges returns metadata without secret_password', async () => {
    const headers = await authHeader();
    const res = await request(app).get('/api/challenges').set(headers);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
    expect(res.body[0].secret_password).toBeUndefined();
  });
});

describe('errorHandler middleware', () => {
  function createRes() {
    return {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
  }

  it('maps known errors and statusCode override', () => {
    const req = {};
    const next = jest.fn();

    const conflictRes = createRes();
    errorHandler({ statusCode: 409, message: 'duplicate' }, req, conflictRes, next);
    expect(conflictRes.statusCode).toBe(409);

    const genericRes = createRes();
    errorHandler({ message: 'boom' }, req, genericRes, next);
    expect(genericRes.statusCode).toBe(500);
  });
});
