const request = require('supertest');

jest.mock('../src/services/llmAdapter', () => ({
  generateResponse: jest.fn(),
}));

const { generateResponse } = require('../src/services/llmAdapter');
const app = require('../src/server');
const { connectDB, clearDB, closeDB } = require('./helpers/dbSetup');

async function authHeader(username = 'alice', email = 'alice@example.com') {
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

async function getFirstChallengeId(headers) {
  const res = await request(app).get('/api/challenges').set(headers);
  return res.body[0]._id;
}

async function createSubmission(headers, challengeId) {
  generateResponse.mockResolvedValue('I cannot help with that request.');

  const res = await request(app)
    .post(`/api/challenges/${challengeId}/submit`)
    .set(headers)
    .send({ prompt: 'test prompt for submission' });

  return res.body.submissionId;
}

describe('Submission endpoints', () => {
  beforeAll(connectDB);
  afterEach(async () => {
    await clearDB();
    jest.clearAllMocks();
  });
  afterAll(closeDB);

  it('GET /api/submissions returns empty array initially', async () => {
    const headers = await authHeader();

    const res = await request(app).get('/api/submissions').set(headers);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('GET /api/submissions includes submission after challenge attempt', async () => {
    const headers = await authHeader();
    const challengeId = await getFirstChallengeId(headers);
    await createSubmission(headers, challengeId);

    const res = await request(app).get('/api/submissions').set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].userPrompt).toBe('test prompt for submission');
    expect(res.body[0].challengeId).toBe(challengeId);
  });

  it('GET /api/submissions/:id returns a single submission', async () => {
    const headers = await authHeader();
    const challengeId = await getFirstChallengeId(headers);
    const submissionId = await createSubmission(headers, challengeId);

    const res = await request(app)
      .get(`/api/submissions/${submissionId}`)
      .set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(submissionId);
    expect(res.body.userPrompt).toBe('test prompt for submission');
  });

  it('PUT /api/submissions/:id updates userPrompt', async () => {
    const headers = await authHeader();
    const challengeId = await getFirstChallengeId(headers);
    const submissionId = await createSubmission(headers, challengeId);

    const res = await request(app)
      .put(`/api/submissions/${submissionId}`)
      .set(headers)
      .send({ userPrompt: 'updated prompt text' });

    expect(res.statusCode).toBe(200);
    expect(res.body.userPrompt).toBe('updated prompt text');
  });

  it('DELETE /api/submissions/:id removes it', async () => {
    const headers = await authHeader();
    const challengeId = await getFirstChallengeId(headers);
    const submissionId = await createSubmission(headers, challengeId);

    const res = await request(app)
      .delete(`/api/submissions/${submissionId}`)
      .set(headers);

    expect(res.statusCode).toBe(204);

    // Confirm it's gone
    const get = await request(app)
      .get(`/api/submissions/${submissionId}`)
      .set(headers);

    expect(get.statusCode).toBe(404);
  });

  it('accessing another user\'s submission returns 403', async () => {
    const aliceHeaders = await authHeader('alice', 'alice@example.com');
    const bobHeaders = await authHeader('bob', 'bob@example.com');
    const challengeId = await getFirstChallengeId(aliceHeaders);

    // Alice creates a submission
    const submissionId = await createSubmission(aliceHeaders, challengeId);

    // Bob tries to access it
    const getRes = await request(app)
      .get(`/api/submissions/${submissionId}`)
      .set(bobHeaders);

    expect(getRes.statusCode).toBe(403);

    // Bob tries to update it
    const putRes = await request(app)
      .put(`/api/submissions/${submissionId}`)
      .set(bobHeaders)
      .send({ userPrompt: 'hacked' });

    expect(putRes.statusCode).toBe(403);

    // Bob tries to delete it
    const deleteRes = await request(app)
      .delete(`/api/submissions/${submissionId}`)
      .set(bobHeaders);

    expect(deleteRes.statusCode).toBe(403);
  });

  it('invalid ObjectId gets 400', async () => {
    const headers = await authHeader();

    const res = await request(app)
      .get('/api/submissions/not-a-valid-id')
      .set(headers);

    expect(res.statusCode).toBe(400);
  });
});
