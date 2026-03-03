# Prompt Injection Backend

Backend for the Prompt Injection Learning App. Built with Express, MongoDB, and Ollama integration.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and configure your environment variables:
   ```
   cp .env.example .env
   ```

3. Ensure MongoDB is running locally on port 27017:
   ```
   mongod
   ```

4. Ensure Ollama is running on localhost:11434

5. Start the server:
   ```
   npm start
   ```

## Running Tests

```
npm test
```

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/:id` - Get challenge by ID
- `POST /api/challenges/submit` - Submit answer to challenge
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get submission by ID
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/health` - Health check endpoint

## Architecture

- `/src/models` - MongoDB schemas
- `/src/routes` - API route handlers
- `/src/controllers` - Business logic
- `/src/services` - Service layer (auth, challenges, LLM)
- `/src/middleware` - Express middleware
- `/__tests__` - Jest test suite
