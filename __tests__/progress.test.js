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

describe('Progress endpoints', () => {
  beforeAll(connectDB);
  afterEach(clearDB);
  afterAll(closeDB);

  it('GET /api/progress returns initial state', async () => {
    const headers = await authHeader();
    const res = await request(app).get('/api/progress').set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.currentLevel).toBe(1);
    expect(res.body.beaten).toEqual([]);
  });

  it('POST /api/progress/beat/:id marks challenges as beaten and advances level', async () => {
    const headers = await authHeader();

    const beatOne = await request(app).post('/api/progress/beat/1').set(headers);
    expect(beatOne.statusCode).toBe(200);
    expect(beatOne.body.currentLevel).toBe(2);

    const beatTwo = await request(app).post('/api/progress/beat/2').set(headers);
    expect(beatTwo.statusCode).toBe(200);
    expect(beatTwo.body.currentLevel).toBe(3);
  });
});
