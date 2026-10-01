
<div align="center">

# 💰 FinanceHub
### Personal Expense Tracker — Full Stack MERN Application

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

<br/>

> **FinanceHub** is an industry-grade personal finance management platform built with the MERN stack.
> Track income, manage budgets, visualize spending patterns, and automate recurring transactions —
> all in one beautifully designed, fully responsive application.

<br/>

---

### 🌐 Live Demo

| Service | Link |
|:--:|:--|
| 🖥️ Frontend | https://financehub-prantonub.vercel.app/ |
| 🔌 Backend API | https://financehub-personal-expence-tracker.onrender.com |
| 🗄️ Database | MongoDB Atlas |

---

</div>

<br/>

## ✨ Features

<details>
<summary><b>🔐 Authentication & Security</b></summary>
<br/>

- 📧 Email & password registration with **email verification**
- 🔒 Secure login with **JWT tokens** (7-day expiry)
- 🔑 **Google OAuth 2.0** sign-in via Passport.js
- 🛡️ Protected routes on both **frontend and backend**
- 🚪 Logout with full session cleanup

</details>

<details>
<summary><b>🤖 AI Finance Assistant (Chatbot)</b></summary>
<br/>

- 🧠 Built-in AI chatbot to help users with **finance-related questions**
- 💬 Users can ask anything about **budgeting, saving, expenses, and money management**
- 📊 AI can analyze and explain **real transaction data insights**
- ⚡ Powered by **Groq API + Llama 3.3 model** for fast responses
- 📈 Provides personalized financial suggestions based on user activity
- 🔐 Works securely with user-authenticated data only
- 🚀 Integrated directly inside the FinanceHub dashboard for easy access

</details>

<details>
<summary><b>💳 Transaction Management</b></summary>
<br/>

- ➕ Add **income** and **expense** transactions
- ✏️ Edit and delete any transaction
- 🔍 Filter by **category**, **type**, **date range**, and **keyword search**
- 📄 Pagination — 15 records per page
- ⬇️ Export filtered transactions to **CSV**

</details>

<details>
<summary><b>📊 Dashboard</b></summary>
<br/>

- 💹 Monthly **income**, **expense**, and **net savings** summary cards
- 📊 Income vs Expense **bar chart** (6-month view)
- 🥧 Spending by category **donut pie chart**
- 🕐 **Recent transactions** list

</details>

<details>
<summary><b>🎯 Budget Goals</b></summary>
<br/>

- 🎯 Set **per-category** monthly spending limits
- 📶 Real-time **progress bars**
- 🚦 Color-coded budget alerts:
  - 🟢 **Green** — Under 70% · Safe zone
  - 🟡 **Yellow** — 70–99% · Near limit
  - 🔴 **Red** — 100%+ · Over budget
- 📅 Month and year selector

</details>

<details>
<summary><b>🔄 Recurring Transactions</b></summary>
<br/>

- 🗓️ Schedule **daily**, **weekly**, or **monthly** transactions
- ⚙️ Auto-generated via **cron job** (runs at midnight)
- 🔘 Enable / disable toggle per item
- 📋 Full CRUD management

</details>

<details>
<summary><b>📈 Analytics</b></summary>
<br/>

- 📉 6-month **area chart** — income vs expense cash flow
- 📈 Monthly savings **line chart**
- 🥧 Category **pie chart**
- 📊 Horizontal **bar chart** by category
- 📋 Category breakdown table with **percentage** analysis

</details>

<details>
<summary><b>📤 Export & Reports</b></summary>
<br/>

- 📊 Export transactions to **CSV** (respects active filters)
- 📄 Generate **monthly financial report** as HTML
- ⬇️ **One-click PDF download** — no browser dialog — via html2pdf.js
- 📅 Month & year selector for targeted reports

</details>

<details>
<summary><b>⚙️ Settings & Preferences</b></summary>
<br/>

- 👤 Update name, currency preference, monthly budget
- 🌙 **Dark mode** toggle — persisted to database
- 🔑 Change password securely
- ❌ Delete account — cascades all user data

</details>

<details>
<summary><b>🌟 Bonus Features</b></summary>
<br/>

- 🌗 **Dark / Light mode** with smooth transition
- 💱 **Multi-currency** support — USD, EUR, GBP, BDT, INR, and more
- 📱 Fully **responsive** — mobile, tablet, and desktop

</details>

<br/>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:---:|:---:|:---:|
| **Frontend** | React 18 + Vite | UI framework & fast builds |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **Charts** | Recharts | Interactive data visualization |
| **Backend** | Node.js + Express 4 | REST API server |
| **Database** | MongoDB + Mongoose | NoSQL data storage & modeling |
| **Auth** | JWT + Passport.js | Token-based authentication |
| **OAuth** | Google OAuth 2.0 | Social sign-in |
| **Scheduling** | node-cron | Automated recurring transactions |
| **PDF Export** | html2pdf.js (CDN) | Client-side PDF generation |



---

## 🔑 Environment Variables

Create `server/.env` with the following:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/financehub

# Auth
JWT_SECRET=your_strong_jwt_secret
SESSION_SECRET=your_session_secret

# Frontend URL
CLIENT_URL=http://localhost:5173

# Email Verification (Resend) — REQUIRED FOR REGISTRATION
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=FinanceHub <onboarding@resend.dev>
# No domain? onboarding@resend.dev only mails your own Resend account email

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Chatbot (Groq API)
GROQ_API_KEY=your_groq_api_key
```

**See `server/.env.example` for detailed documentation.**

<br/>

---

<div align="left">

## 📧 Email Verification Setup (Resend — no domain required)

Email verification is **REQUIRED** for user registration.

| Step | Action |
|:---:|---|
| 1 | Go to [Resend](https://resend.com) and create a free account |
| 2 | Dashboard → **API Keys** → **Create API Key** (Sending access) |
| 3 | Copy the key (starts with `re_`) → `RESEND_API_KEY` in `server/.env` |
| | • **No domain?** keep `RESEND_FROM_EMAIL=FinanceHub <onboarding@resend.dev>` |
| | • ⚠️ Then Resend only delivers to **your own Resend account email** |
| 4 | Add the variable to `server/.env` and restart the server |
| 5 | Later: verify a domain, then set `RESEND_FROM_EMAIL=noreply@yourdomain.com` |

> 💡 **Having issues?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for help

</div>

<br/>

---

<div align="left">

## 🚀 Deploy Troubleshooting (Render)

> **If Render says "Deploy failed", verify these settings — they are the usual cause.**

| Setting | Required value |
|:---:|---|
| **Root Directory** | `prantonub/server` — the repo root has **no** `package.json` |
| **Build Command** | `npm install` (or `npm ci`) |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` (aliases: `/`, `/healthz`, `/api/health`) |
| **Node Version** | 20 (from `engines` in `server/package.json`) |

Environment variables (Render → **Environment**) — `.env` is git-ignored, so
**every** value below must be set in the dashboard:

```env
MONGO_URI=mongodb+srv://user:pass@cluster0.xxx.mongodb.net/financehub?retryWrites=true&w=majority
JWT_SECRET=...
SESSION_SECRET=...
CLIENT_URL=https://financehub-prantonub.vercel.app
SERVER_URL=https://your-app.onrender.com
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=FinanceHub <onboarding@resend.dev>
GROQ_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

| Symptom | Cause / fix |
|---|---|
| `Deploy failed: no open ports detected` | Was caused by the server only binding its port **after** MongoDB connected. Fixed: the port now opens immediately and Mongo is retried every 10s. |
| `Deploy failed` + `Health check failed` | Fixed: `/health`, `/healthz` and `/api/health` always return **200**. |
| Logs show `❌ MongoDB URI is missing` | `MONGO_URI` is not set in the Render dashboard — add it (the password must **not** keep Atlas's `< >` brackets). |
| Logs show `MongoServerError: bad auth` | Wrong password, or `< >` left around it. |
| `/health` returns `"database": "connecting"` | Atlas **Network Access** is blocking Render — allow `0.0.0.0/0` (or Render's static egress IPs). |
| Build fails: `Could not read package.json` | **Root Directory** is wrong — set it to `prantonub/server`. |

</div>

<br/>

---

<div align="left">

## 🔐 Google OAuth Setup

| Step | Action |
|:---:|---|
| 1 | Go to [Google Cloud Console](https://console.cloud.google.com/) |
| 2 | Create project → **APIs & Services** → **Credentials** |
| 3 | Click **Create Credentials** → **OAuth 2.0 Client ID** |
| 4 | Set type to **Web application** |
| 5 | Add redirect URI: `http://localhost:5000/api/auth/google/callback` |
| 6 | Copy **Client ID** + **Secret** → paste into `server/.env` |

</div>

<br/>

---

<div align="left">

## 📄 License

This project was developed for **educational**, **personal learning**, and **assignment submission** purposes.

<br/>

━━━━━━━━━━━━━━━━━━━━━━━

### 👨‍💻 Developed By

# Tauhidul Islam Pranto

### ⚡ Powered by the MERN Stack

`MongoDB` • `Express.js` • `React.js` • `Node.js`

<br/>

💡 *Transforming ideas into full-stack experiences.*

</div>
