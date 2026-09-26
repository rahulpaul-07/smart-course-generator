# Production Deployment Guide

This guide covers deploying CourseAI across Vercel (Frontend), Render (Backend), and MongoDB Atlas (Database).

## 1. Database Deployment: MongoDB Atlas
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (M0 Free Tier is sufficient for staging).
3. Under **Database Access**, create a new database user with a secure password.
4. Under **Network Access**, whitelist `0.0.0.0/0` (or configure specific Render IP ranges if applicable).
5. Click **Connect** -> **Connect your application** and copy the Connection String (`MONGO_URI`).

## 2. Backend Deployment: Render
1. Create an account at [Render](https://render.com/).
2. Create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the following settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm ci --omit=dev`
   - **Start Command:** `npm start`
5. Add the following **Environment Variables**:
   - `MONGO_URI` (from Atlas)
   - `JWT_SECRET` (at least 32 characters; the server refuses to start otherwise)
   - `CLIENT_URL`: the exact frontend origin, e.g. `https://smart-course-generator.vercel.app`. **Required:** in production it is the only origin CORS allows, so without it every browser request is rejected.
   - `NODE_ENV=production`
   - `TRUST_PROXY_HOPS=2`: the number of proxies in front of the API (Vercel's `/api` rewrite, then Render's own proxy). It makes `req.ip` the visitor rather than a proxy, which every IP-keyed rate limit depends on. Use `1` if browsers call the Render URL directly.
   - At least one of `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`
   - Optional: `DEMO_MODE=true` to enable one-click guest accounts, `RAG_ENABLED=true`, `APP_TIMEZONE`
6. Deploy the service and copy the provided URL (e.g., `https://my-backend.onrender.com`).
7. If `DEMO_MODE` is on, load the showcase courses that guest accounts are cloned from, once: run `npm run seed` from a Render shell (or locally with `MONGO_URI` pointing at production). It is idempotent.

## 3. Frontend Deployment: Vercel
1. Create an account at [Vercel](https://vercel.com/).
2. Create a new project and import your GitHub repository.
3. Configure the following settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
4. Point the `/api` rewrite in `frontend/vercel.json` at your Render URL (it ships pointing at `https://smart-course-generator.onrender.com`).
5. Add the following **Environment Variables**:
   - Do **not** set `VITE_API_BASE_URL`. The SPA calls `/api` on its own origin and Vercel forwards it to Render. Same-origin is what lets the `SameSite=Strict` refresh cookie reach `/api/auth/refresh`; with the API on a different site (`*.onrender.com` from `*.vercel.app`) the browser never sends it and every session ends when the 30-minute access token expires.
   - Optional: `VITE_GOOGLE_CLIENT_ID`, and `VITE_AUTH0_DOMAIN` + `VITE_AUTH0_CLIENT_ID`. Each sign-in method (and its SDK) is only loaded when configured. An Auth0 **custom domain** must be added to `connect-src` and `frame-src` in the Content-Security-Policy in `vercel.json`; `*.auth0.com` is already allowed.
6. Deploy the project.

`vercel.json` also sets the SPA's security headers (Content-Security-Policy, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`). `vite preview` serves the same headers, so the Playwright suite fails if a policy change breaks the app.

## 4. Deployment Readiness Checklist
- [ ] MongoDB Atlas cluster is active and accepting connections.
- [ ] Backend is deployed on Render and `/api/health` returns 200 OK.
- [ ] Frontend is deployed on Vercel and successfully communicates with the Backend.
- [ ] `https://<vercel-domain>/api/health` returns 200 (the rewrite reaches Render).
- [ ] Signed in, `POST /api/auth/refresh` from the browser returns 200 (the refresh cookie is sent). A session survives past the access-token lifetime.
- [ ] Long generations stream to completion through the rewrite (generate a course and a lesson on the live site).
- [ ] Response headers on the SPA include `Content-Security-Policy`, and the browser console shows no CSP violations on the landing, lesson and sign-in pages.
- [ ] Auth0 callback URLs have been updated to include the Vercel production domain.
- [ ] `CLIENT_URL` on the backend exactly matches the Vercel production origin (no trailing slash).
- [ ] With `DEMO_MODE=true`, "Try the demo" on the landing page lands on a dashboard with a course (run `npm run seed` if the dashboard is empty).
- [ ] `/status` shows at least one provider with a key configured.
