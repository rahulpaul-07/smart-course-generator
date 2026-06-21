# Production Deployment Guide

This guide covers deploying the Unified Course Platform across Vercel (Frontend), Render (Backend), and MongoDB Atlas (Database).

## 1. Database Deployment: MongoDB Atlas
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (M0 Free Tier is sufficient for staging).
3. Under **Database Access**, create a new database user with a secure password.
4. Under **Network Access**, whitelist `0.0.0.0/0` (or configure specific Render IP ranges if applicable).
5. Click **Connect** -> **Connect your application** and copy the Connection String (`MONGODB_URI`).

## 2. Backend Deployment: Render
1. Create an account at [Render](https://render.com/).
2. Create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the following settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add the following **Environment Variables**:
   - `MONGODB_URI` (from Atlas)
   - `JWT_SECRET`
   - `PORT` (usually defaults to 10000 on Render)
   - `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`
6. Deploy the service and copy the provided URL (e.g., `https://my-backend.onrender.com`).

## 3. Frontend Deployment: Vercel
1. Create an account at [Vercel](https://vercel.com/).
2. Create a new project and import your GitHub repository.
3. Configure the following settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
4. Add the following **Environment Variables**:
   - `VITE_API_URL` (Set this to your Render backend URL, e.g., `https://my-backend.onrender.com`)
   - `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`
5. Deploy the project.

## 4. Deployment Readiness Checklist
- [ ] MongoDB Atlas cluster is active and accepting connections.
- [ ] Backend is deployed on Render and `/api/health` returns 200 OK.
- [ ] Frontend is deployed on Vercel and successfully communicates with the Backend.
- [ ] Auth0 callback URLs have been updated to include the Vercel production domain.
- [ ] CORS settings in the Backend allow requests from the Vercel production domain.
