# Antigravity Review — Multi-Agent AI Code Auditor

Antigravity Review is a production-grade code auditing console built with the MERN stack (MongoDB, Express, React, Node.js). It supports multi-agent static/LLM reviews, real-time logging via Server-Sent Events (SSE), and features a premium developer dashboard inspired by Cursor IDE and Vercel.

## 🚀 Key Features

* **Multi-Agent AI Review System**: Specialized prompts simulating Security, Performance, Clean Code, and Architecture agents consolidate reports with an overall code quality score.
* **Dual-Mode Task Queue**: Connects to BullMQ with Redis if online, and automatically falls back to an in-memory event queue if Redis is not running.
* **Dual-Mode Review Engine**: Calls Google Gemini API if a key is provided, or executes a high-fidelity local pattern matching engine to report real-world code smells.
* **Real-time SSE Logs Console**: Watch cloning, file scanning, and agent analysis operations stream live to a terminal CLI view.
* **IDE Monaco Editor Integration**: Inspect line-by-line issue decorations, hover tips, and click suggestions to focus editor context.
* **PDF Report & Markdown Downloads**: Generate styled audit files and export logs directly from the results page.
* **AI Explainer Chat**: Chat directly with an AI assistant regarding the selected file contents.
* **Demo Auth & OAuth Support**: GitHub OAuth login flow via Passport.js, with a direct Developer Demo Login bypass to immediately test all dashboards.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS, Monaco Editor, Recharts, Framer Motion, Lucide Icons, Axios.
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), Redis (BullMQ / ioredis), JWT, Passport.js.
* **AI Engine**: Google Gemini API integration (via Direct REST calls).

---

## ⚙️ Environment Variables

Create a file named `.env` in the `backend/` subdirectory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-code-reviewer
FRONTEND_URL=http://localhost:5173
JWT_SECRET=secret-jwt-key-reviewer-dev-2026

# Queue system
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Multi-Agent AI configuration (optional: falls back to local scanner if empty)
GEMINI_API_KEY=your_gemini_api_key_here

# GitHub OAuth integration (optional: falls back to Demo Login if empty)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

---

## 🏃‍♂️ How to Run

### Step 1: Install Dependencies
From the root project directory, run:
```bash
npm run install:all
```
This automatically installs node modules across root, backend, and frontend subfolders.

### Step 2: Start Development Servers
Start both the backend server and frontend Vite application concurrently:
```bash
npm run dev
```

* **Frontend Console**: `http://localhost:5173`
* **Backend REST API**: `http://localhost:5000`

---

## 👨‍💻 Testing Guide

1. Navigate to `http://localhost:5173` and click **Launch Console**.
2. Click **Instant Developer Demo Login** (this will authenticate you immediately as `demo_developer` without requiring GitHub configurations).
3. Click **Launch Code Review**.
4. Select **Paste Raw Code Block** and paste some JavaScript code containing issues (e.g. usage of `eval`, block scope violations, nested loops, missing useEffect dependencies).
5. Click **Queue Audit Analysis**.
6. View the SSE logs stream live in the terminal.
7. Explore quality scorecards, navigate file panels, click suggestions to scroll Monaco lines, print PDF reports, or ask the AI Chat sidebar questions regarding the file code!
Live link : https://code-review-ai-agent-two.vercel.app/
