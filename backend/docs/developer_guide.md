# Developer Guide

Welcome to the CourseAI Pro Backend! Follow this guide to set up your local development environment and start contributing.

## Local Setup Guide

1. **Prerequisites**
   - Node.js >= 18.x
   - MongoDB (Local instance or MongoDB Atlas cluster)
   - Git

2. **Installation**
   ```bash
   git clone <repository_url>
   cd smart-course-generator/backend
   npm install
   ```

3. **Environment Configuration**
   Copy the example environment variables and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   *Required Keys for Full Functionality:*
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure random string for signing auth tokens.
   - `GEMINI_API_KEY`: Required for primary AI generation.

4. **Running the Application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Guide

The backend uses a standard RESTful architecture. All API responses follow a consistent envelope pattern:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Detailed error message",
  "traceId": "uuid-for-log-correlation"
}
```

For the complete interactive API documentation, ensure the server is running and navigate to:
`http://localhost:8000/api-docs`

## Troubleshooting Guide

**1. MongoDB Connection Timeouts**
- *Issue*: Application crashes on startup with `MongooseServerSelectionError`.
- *Fix*: Check that your IP address is whitelisted in your MongoDB Atlas Network Access panel.

**2. AI Generation Failing (502 Bad Gateway)**
- *Issue*: Lesson or course generation fails midway.
- *Fix*: Ensure your API keys in `.env` are valid and have not exceeded quota limits. The application falls back across Gemini, Groq, and OpenRouter, so having at least two keys provided guarantees the highest uptime.

**3. Jest Test Suite Timing Out**
- *Issue*: `npm test` fails with `Exceeded timeout of 120000 ms`.
- *Fix*: The first time `mongodb-memory-server` runs, it downloads an 800MB MongoDB binary. Ensure you have a stable internet connection. Subsequent runs will use the cached binary and complete instantly.

**4. Rate Limiting Blocks (429 Too Many Requests)**
- *Issue*: API calls are blocked during load testing.
- *Fix*: The API has endpoint-specific rate limits. For local load testing, you can temporarily disable the `apiLimiter` in `backend/server.js`.
