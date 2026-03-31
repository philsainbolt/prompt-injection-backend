const request = require('supertest');
const app = require('../src/server');
const { connectDB, clearDB, closeDB } = require('./helpers/dbSetup');

const ADMIN_EMAIL = 'admin@redmond.com';
const NON_ADMIN_EMAIL = 'bob@example.com';

async function authHeader(email = ADMIN_EMAIL, username = 'adminuser') {
  await request(app).post('/api/auth/register').send({
    username,
    email,
    password: 'password123',
  });

  const login = await request(app).post('/api/auth/login').send({
    email,
    password: 'password123',
  });

  return { Authorization: `Bearer ${login.body.token}` };
}

const validChallenge = {
  title: 'Test Challenge',
  description: 'A test challenge description',
  systemPrompt: 'You are a helpful assistant with secret: TESTSECRET',
  secretPassword: 'TESTSECRET',
  level: 6,
  technique: 'test technique',
  secret: 'TESTSECRET',
  explanation: 'A test explanation',
  order: 6,
};

describe('Challenge admin CRUD', () => {
  beforeAll(async () => {
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;
    await connectDB();
  });
  afterEach(clearDB);
  afterAll(async () => {
    delete process.env.ADMIN_EMAILS;
    await closeDB();
  });

  it('POST /api/challenges creates a challenge', async () => {
    const headers = await authHeader();

    const res = await request(app)
      .post('/api/challenges')
      .set(headers)
      .send(validChallenge);

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.title).toBe('Test Challenge');
    expect(res.body.description).toBe('A test challenge description');
    // Sensitive fields should be stripped
    expect(res.body.secretPassword).toBeUndefined();
    expect(res.body.systemPrompt).toBeUndefined();
  });

  it('GET /api/challenges/:id returns a single challenge', async () => {
    const headers = await authHeader();

    // Get a seeded challenge
    const list = await request(app).get('/api/challenges').set(headers);
    const challengeId = list.body[0]._id;

    const res = await request(app)
      .get(`/api/challenges/${challengeId}`)
      .set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(challengeId);
    expect(res.body.title).toBeDefined();
    // Sensitive fields stripped
    expect(res.body.secretPassword).toBeUndefined();
    expect(res.body.systemPrompt).toBeUndefined();
  });

  it('PUT /api/challenges/:id updates challenge fields', async () => {
    const headers = await authHeader();

    // Create a challenge first
    const created = await request(app)
      .post('/api/challenges')
      .set(headers)
      .send(validChallenge);

    const res = await request(app)
      .put(`/api/challenges/${created.body._id}`)
      .set(headers)
      .send({ title: 'Updated Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('DELETE /api/challenges/:id removes the challenge', async () => {
    const headers = await authHeader();

    const created = await request(app)
      .post('/api/challenges')
      .set(headers)
      .send(validChallenge);

    const res = await request(app)
      .delete(`/api/challenges/${created.body._id}`)
      .set(headers);

    expect(res.statusCode).toBe(204);

    // Confirm it's gone
    const get = await request(app)
      .get(`/api/challenges/${created.body._id}`)
      .set(headers);

    expect(get.statusCode).toBe(404);
  });

  it('non-admin user gets 403 on POST/PUT/DELETE', async () => {
    // Temporarily disable E2E mode so admin middleware actually checks emails
    const originalE2E = process.env.E2E_MODE;
    const originalJwtSecret = process.env.JWT_SECRET;
    process.env.E2E_MODE = 'false';
    process.env.JWT_SECRET = 'secret';

    const adminHeaders = await authHeader(ADMIN_EMAIL, 'adminuser');
    const nonAdminHeaders = await authHeader(NON_ADMIN_EMAIL, 'regularuser');

    // Create a challenge as admin
    const created = await request(app)
      .post('/api/challenges')
      .set(adminHeaders)
      .send(validChallenge);

    expect(created.statusCode).toBe(201);

    // Non-admin should get 403
    const postRes = await request(app)
      .post('/api/challenges')
      .set(nonAdminHeaders)
      .send(validChallenge);
    expect(postRes.statusCode).toBe(403);

    const putRes = await request(app)
      .put(`/api/challenges/${created.body._id}`)
      .set(nonAdminHeaders)
      .send({ title: 'Hacked' });
    expect(putRes.statusCode).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/challenges/${created.body._id}`)
      .set(nonAdminHeaders);
    expect(deleteRes.statusCode).toBe(403);

    // Restore E2E mode and JWT secret
    process.env.E2E_MODE = originalE2E;
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it('invalid ObjectId gets 400', async () => {
    const headers = await authHeader();

    const res = await request(app)
      .get('/api/challenges/not-a-valid-id')
      .set(headers);

    expect(res.statusCode).toBe(400);
  });
});
