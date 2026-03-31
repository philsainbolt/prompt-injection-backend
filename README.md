# You Shall Not Inject -- Backend API

REST API for a prompt injection learning platform. Users register, log in, and work through 5 progressive challenges where they try to trick an LLM into revealing a secret password. The backend handles auth, challenge management, prompt submission, LLM evaluation, and progress tracking.

**Live:** https://prompt-injection-backend.fly.dev

## Features

- JWT authentication with bcrypt password hashing
- 5 challenges seeded on first boot, each with a hidden system prompt and secret password
- Prompt submission pipeline: user prompt -> LLM adapter -> secret detection -> pass/fail verdict
- Sequential progress gating (beat level N before unlocking N+1)
- Admin-only challenge CRUD and progress override
- Sensitive fields (`systemPrompt`, `secret`, `secretPassword`) stripped from all public responses
- E2E test mode with deterministic LLM responses (no external API calls)
- Input validation on every route via express-validator
- Centralized error handling

## Tech Stack

- **Runtime:** Node.js 18
- **Framework:** Express 4
- **Database:** MongoDB with Mongoose 7
- **Auth:** jsonwebtoken + bcryptjs
- **Validation:** express-validator
- **Testing:** Jest + Supertest + mongodb-memory-server
- **Dev tooling:** nodemon

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/prompt-injection
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAILS=admin@example.com
E2E_MODE=false
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | - | `development` or `production` |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/prompt-injection` | MongoDB connection string |
| `JWT_SECRET` | Yes* | - | Signing key for JWTs. *Not required when `E2E_MODE=true` (falls back to `"secret"`) |
| `ADMIN_EMAILS` | No | - | Comma-separated list of emails with admin access |
| `E2E_MODE` | No | `false` | Enables deterministic LLM responses and bypasses admin checks for testing |

### Install and Run

```bash
npm install
npm run dev     # nodemon, auto-reload
npm start       # production
```

Server starts on `http://localhost:5000` by default.

On first boot, the 5 challenges are automatically seeded into MongoDB if the collection is empty.

## API Endpoints

All endpoints are prefixed with `/api`. Auth-required routes expect `Authorization: Bearer <token>`.

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Returns `{ status: "ok", e2eMode: bool }` |

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account. Body: `{ username, email, password }`. Returns `{ user, message }` |
| POST | `/api/auth/login` | No | Log in. Body: `{ email, password }`. Returns `{ user, token }` |
| POST | `/api/auth/logout` | Yes | No-op server-side (JWT is stateless). Returns `{ message }` |

Registration requires `username` (min 3 chars), valid `email`, and `password` (min 6 chars).

### Challenges (`/api/challenges`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/challenges` | Yes | List all challenges (sensitive fields stripped), sorted by level |
| GET | `/api/challenges/:id` | Yes | Get single challenge by MongoDB ID |
| POST | `/api/challenges` | Admin | Create challenge. Body: `{ title, description, systemPrompt, secretPassword, level }` |
| PUT | `/api/challenges/:id` | Admin | Update challenge fields |
| DELETE | `/api/challenges/:id` | Admin | Delete challenge |
| POST | `/api/challenges/:id/submit` | Yes | Submit a prompt attempt. Body: `{ userPrompt }` (or `{ prompt }`) |

**Submit response shape:**

```json
{
  "success": true,
  "pass": true,
  "response": "LLM output text",
  "hint": "Try reframing your request...",
  "submissionId": "...",
  "progress": { "beaten": [1, 2], "beatenLevels": [1, 2], "currentLevel": 3 }
}
```

`hint` is included only on failure. `progress` is included only on success.

### Progress (`/api/progress`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/progress` | Yes | Get current user's progress: `{ beaten, beatenLevels, currentLevel, progressLevel }` |
| POST | `/api/progress/beat/:id` | Admin | Force-mark a level as beaten (`:id` is the level number, not a Mongo ID) |

### Users (`/api/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/profile` | Yes | Get current user's profile (password hash excluded) |

### Submissions (`/api/submissions`)

All submission routes require auth. Users can only access their own submissions.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/submissions` | Yes | List current user's submissions (newest first) |
| GET | `/api/submissions/:id` | Yes | Get single submission |
| PUT | `/api/submissions/:id` | Yes | Update `userPrompt` on a submission |
| DELETE | `/api/submissions/:id` | Yes | Delete a submission (returns 204) |

## Database Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `username` | String | Unique, min 3 chars |
| `email` | String | Unique, lowercase |
| `passwordHash` | String | bcrypt, 10 salt rounds |
| `progressLevel` | Number | 0-10, default 0 |
| `hintsUsed` | Number | 0-3, default 0 |
| `beatenLevels` | [Number] | Array of beaten level numbers |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

### Challenge

| Field | Type | Notes |
|-------|------|-------|
| `level` | Number | 1-10, unique index |
| `title` | String | Required |
| `description` | String | Required, user-facing |
| `systemPrompt` | String | Required, never exposed in API responses |
| `secretPassword` | String | Never exposed in API responses |
| `secret` | String | Legacy alias for secretPassword |
| `technique` | String | e.g. "basic injection", "narrative manipulation" |
| `difficulty` | String | beginner / intermediate / advanced |
| `explanation` | String | Required |
| `order` | Number | Sort order |

### Submission

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | Ref: User |
| `challengeId` | ObjectId | Ref: Challenge |
| `userPrompt` | String | The injection attempt |
| `llmResponse` | String | What the LLM returned |
| `success` | Boolean | Whether the secret was found in the response |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

## Testing

Tests use Jest with mongodb-memory-server (no real MongoDB needed).

```bash
npm test              # single run with coverage
npm run test:watch    # watch mode
```

`E2E_MODE=true` is set automatically by the test scripts.

**Test files** (`__tests__/`):

| File | Covers |
|------|--------|
| `auth.test.js` | Register, login, validation |
| `logout.test.js` | Logout endpoint |
| `challengeReadAndError.test.js` | GET challenges, 404s, sensitive field stripping |
| `challengeAdmin.test.js` | Admin CRUD (create, update, delete) |
| `challengeSubmit.test.js` | Prompt submission and pass/fail logic |
| `submissions.test.js` | Submission CRUD, ownership enforcement |
| `progress.test.js` | Progress read and beat endpoints |
| `userProfile.test.js` | Profile endpoint |
| `llmAdapter.test.js` | LLM adapter deterministic/random behavior |
| `passwordDetection.test.js` | Secret detection utility |

## Deployment

Deployed on Fly.io. The Dockerfile builds a Node 18 Alpine image and exposes port 8080.

```bash
fly deploy
```

**Required Fly.io secrets:**

```bash
fly secrets set MONGODB_URI="mongodb+srv://..." JWT_SECRET="..." ADMIN_EMAILS="..."
```

The `fly.toml` is configured for the `cdg` (Paris) region with auto-stop/auto-start machines.

## Project Structure

```
src/
  server.js               # Express app, route mounting, DB connect, seed
  config/
    challenges.js          # 5 challenge definitions (seed data)
    runtime.js             # JWT secret, E2E mode, admin email helpers
    seedChallenges.js      # Inserts challenges on first boot
  controllers/
    AuthController.js      # Register, login, logout handlers
    ChallengeController.js # CRUD + submit attempt handler
    progressController.js  # Progress read + admin beat handler
  middleware/
    authMiddleware.js      # JWT verification, sets req.userId
    adminMiddleware.js     # Admin email check (bypassed in E2E mode)
    errorHandler.js        # Centralized error responses
    validate.js            # express-validator result check
    validators.js          # Validation rule sets for each route
  models/
    User.js                # User schema with bcrypt pre-save hook
    Challenge.js           # Challenge schema with sensitive fields
    Submission.js          # Submission schema with compound indexes
  routes/
    authRoutes.js          # /api/auth/*
    challengeRoutes.js     # /api/challenges/*
    progressRoutes.js      # /api/progress/*
    submissionRoutes.js    # /api/submissions/*
    userRoutes.js          # /api/users/*
  services/
    AuthService.js         # Registration, login, token, profile logic
    llmAdapter.js          # LLM response generation (deterministic in E2E mode)
  utils/
    passwordDetection.js   # Checks if LLM response contains the secret
    progressCalc.js        # Calculates next unlocked level from beaten array
```

## Credits

Built by Phillip Hinson.

## License

MIT
