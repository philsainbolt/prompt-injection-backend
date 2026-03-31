const request = require('supertest');
const app = require('../src/server');
const { connectDB, clearDB, closeDB } = require('./helpers/dbSetup');

describe('Auth flow', () => {
  beforeAll(connectDB);
  afterEach(clearDB);
  afterAll(closeDB);

  it('registers and logs in user with jwt token', async () => {
    const register = await request(app).post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(register.statusCode).toBe(201);
    expect(register.body.user.email).toBe('alice@example.com');

    const login = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeTruthy();
    expect(login.body.user.username).toBe('alice');
  });

  it('rejects duplicate registration', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    const duplicate = await request(app).post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(duplicate.statusCode).toBe(409);
  });
});
