# 📚 Pustak Lab — Crowdsourced Academic Notes Platform

> **"Wikipedia meets Google Drive" for student notes.** Upload, discover, and download study materials shared by students across universities.

![Pustak Lab](https://img.shields.io/badge/Pustak_Lab-v1.0.0-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Free Forever](https://img.shields.io/badge/Free-Forever-amber?style=for-the-badge)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand + TanStack Query |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (free M0) |
| File Storage | Supabase Storage (free tier) |
| Auth | JWT + bcrypt + Google OAuth |
| Email | Nodemailer + Gmail SMTP |
| Hosting | Vercel (Frontend & Serverless Express API) |

---

## 📁 Project Structure

```
Pustak Lab/
├── api/             # Vercel Serverless Function entrypoint (Express)
│   └── index.js
├── client/          # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/         # Axios client + API functions
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # All page components
│   │   ├── store/       # Zustand state stores
│   │   └── utils/       # Utility helpers
│   ├── vercel.json      # Client-side SPA routing config
│   └── .env.example
│
├── server/          # Node.js + Express REST API
│   ├── src/
│   │   ├── config/      # DB (Mongoose serverless-cached), Supabase, Passport
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Auth, upload, errors
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # Express routes
│   │   └── utils/       # Helpers (email, hash)
│   ├── seed.js          # Sample data seeder
│   ├── vercel.json      # Standalone serverless config
│   └── .env.example
│
└── vercel.json      # Root Vercel configuration for monorepo
```

---

## 🐙 Step-by-Step GitHub Push Guide

1. **Initialize Git repository (if not done yet):**
   ```bash
   git init
   ```

2. **Stage and commit clean project files:**
   *(Note: `.env` secret files and built `dist/` outputs are automatically ignored by `.gitignore`)*
   ```bash
   git add .
   git commit -m "Initial commit - Pustak Lab ready for Vercel deployment"
   ```

3. **Link to your GitHub Repository and Push:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pustak-lab.git
   git push -u origin main
   ```

---

## ☁️ Deploying on Vercel

### Option 1: Unified Monorepo Deployment (Recommended)

Deploy both the Frontend and Express Backend in a **single Vercel Project**:

1. Log in to [Vercel](https://vercel.com) and click **"Add New" -> "Project"**.
2. Import your GitHub repository (`pustak-lab`).
3. Leave **Root Directory** as `./` (the repository root).
4. Vercel will automatically detect `vercel.json` and build both the Vite frontend and Vercel Serverless Express API.
5. In **Environment Variables**, add:

   | Key | Value Description |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_ACCESS_SECRET` | Secret key for JWT access tokens |
   | `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens |
   | `SUPABASE_URL` | Your Supabase Project URL |
   | `SUPABASE_SERVICE_KEY` | Your Supabase Service Role Key |
   | `SUPABASE_BUCKET` | `pustak-notes` |
   | `CLIENT_URL` | Your Vercel domain (e.g., `https://pustak-lab.vercel.app`) |
   | `AUTO_PUBLISH` | `true` |
   | `VITE_API_URL` | `/api` *(or leave blank so it uses relative `/api`)* |

6. Click **Deploy**! 🚀

---

### Option 2: Separate Vercel Projects

If you prefer to host the Frontend and Backend as separate Vercel projects:

#### Deploying Frontend (`pustak-lab-client`):
1. Create a new Vercel Project and select your repository.
2. Set **Root Directory** to `client`.
3. Add Environment Variables:
   - `VITE_API_URL`: `https://pustak-lab-backend.vercel.app/api`
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Deploy!

#### Deploying Backend (`pustak-lab-server`):
1. Create another Vercel Project and select your repository.
2. Set **Root Directory** to `server`.
3. Add Environment Variables (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `CLIENT_URL`, etc.).
4. Deploy!

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free M0 cluster)
- A Supabase account (free tier)

### Step 1: Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### Step 2: Configure Environment Variables

**Server** — copy `.env.example` to `.env`:
```bash
cd server
cp .env.example .env
```

**Client** — copy `.env.example` to `.env`:
```bash
cd client
cp .env.example .env
```

### Step 3: Run the App Locally

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

Visit: **http://localhost:5173**

---

## 🔒 Security & Best Practices

- Secret `.env` files are excluded from git index via `.gitignore`.
- Mongoose uses connection caching for serverless execution.
- Supabase storage policies protect file uploads.
- JWT rotation with short-lived access tokens.

---

## 📄 License

MIT License — free to use, fork, and deploy.
