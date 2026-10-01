require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const passport = require("./src/config/passport");
const { errorHandler } = require("./src/middleware/errorHandler");
const { apiLimiter } = require("./src/middleware/rateLimiter");

// Import cron job
require("./src/config/cron");

const app = express();

// ✅ FIX: Tell Express to trust Render's reverse proxy.
// Without this, express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
// and crashes every request before it even reaches your routes.
app.set("trust proxy", 1);

// Security: Add helmet middleware for security headers
app.use(helmet());

// Rate limiting and CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// General rate limiting for all API requests
app.use("/api/", apiLimiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/transactions", require("./src/routes/transaction"));
app.use("/api/budgets", require("./src/routes/budget"));
app.use("/api/recurring", require("./src/routes/recurring"));
app.use("/api/notifications", require("./src/routes/notification"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/export", require("./src/routes/export"));
app.use("/api/ai", require("./src/routes/ai"));

// Root + health check endpoints
// IMPORTANT: Render probes a health path while deploying. These routes must
// answer 200 even when the database is not connected yet, otherwise a slow or
// unreachable database turns a successful build into a failed deploy.
const healthPayload = () => ({
  success: true,
  status: "ok",
  service: "SpendWise API v2",
  database:
    mongoose.connection.readyState === 1 ? "connected" : "connecting",
  uptime: Math.round(process.uptime()),
  timestamp: new Date().toISOString(),
});

app.get("/", (_req, res) =>
  res.json({ success: true, message: "SpendWise API v2 🚀" }),
);

app.get(["/health", "/healthz", "/api/health"], (_req, res) =>
  res.json(healthPayload()),
);

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

// Database connection
const dns = require("dns");

// Both names are accepted: MONGO_URI is what this project uses (see .env.example),
// MONGODB_URI is the common convention used by many hosts (Render, Heroku, ...).
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Parse user/host out of the URI so the startup log shows WHAT we are dialling.
// A wrong username, host or password then becomes obvious at a glance.
const parseMongoUri = (uri = "") => {
  const m = uri.match(/^mongodb(\+srv)?:\/\/([^:@/]+):([^@]*)@(.+)$/);
  if (!m) return { user: "(unparsable)", pass: "", host: "(unparsable)", db: "" };
  const hostAndDb = m[4].split("?")[0];
  const slash = hostAndDb.indexOf("/");
  return {
    user: decodeURIComponent(m[2]),
    pass: decodeURIComponent(m[3]),
    host: slash === -1 ? hostAndDb : hostAndDb.slice(0, slash),
    db: slash === -1 ? "" : hostAndDb.slice(slash + 1),
  };
};

const mongoTarget = parseMongoUri(MONGO_URI);

// Turn raw driver errors into actionable instructions instead of cryptic text.
const describeMongoError = (err) => {
  const msg = err.message || String(err);

  if (/bad auth|authentication failed/i.test(msg)) {
    return [
      "MongoDB rejected the credentials (bad auth).",
      `     → user: "${mongoTarget.user}" · password length: ${mongoTarget.pass.length} · host: "${mongoTarget.host}"`,
      "     → If you copied the URI from Atlas, delete the < > brackets around the password.",
      "     → Confirm the user exists in Atlas → Database Access and the password is current.",
      "     → Percent-encode special characters in the password: @ : / ? # → %40 %3A %2F %3F %23",
    ].join("\n");
  }
  if (/querySrv|ENOTFOUND|EAI_AGAIN/i.test(msg)) {
    return [
      `Cannot resolve "${mongoTarget.host}" (DNS).`,
      "     → Check the cluster hostname in MONGO_URI (Atlas → Connect → Drivers).",
    ].join("\n");
  }
  if (
    /whitelist|not allowed to access|Server selection timed out|ETIMEDOUT/i.test(
      msg,
    )
  ) {
    return [
      "Atlas refused the network connection.",
      "     → Atlas → Network Access → allow 0.0.0.0/0 (or this host's IP).",
    ].join("\n");
  }
  return msg;
};

if (!MONGO_URI) {
  console.error(
    "❌ MongoDB URI is missing. Set MONGO_URI in your environment (see server/.env.example).",
  );
} else {
  console.log(
    `📡 Environment: MONGO_URI=${process.env.MONGO_URI ? "set" : "unset"} · MONGODB_URI=${process.env.MONGODB_URI ? "set" : "unset"}`,
  );
  console.log(
    `📡 MongoDB target → user="${mongoTarget.user}" · host="${mongoTarget.host}" · db="${mongoTarget.db || "(default)"}"`,
  );

  // The #1 copy-paste mistake: Atlas displays the password as <password>.
  if (/[<>]/.test(MONGO_URI)) {
    console.error(
      "❌ MONGO_URI contains < or > — remove the angle brackets around the password.",
    );
  }
}

const connectDB = async () => {
  const options = { serverSelectionTimeoutMS: 10000 };

  try {
    await mongoose.connect(MONGO_URI, options);
  } catch (err) {
    // A `mongodb+srv://` URI needs a DNS SRV lookup. Some local networks and ISP
    // routers refuse it (querySrv ECONNREFUSED) even though the cluster is fine,
    // so retry once through public resolvers. Render/Atlas DNS already works and
    // never reaches this fallback.
    if (/querySrv/i.test(err.message)) {
      console.warn(
        "⚠️ DNS SRV lookup failed — retrying with public DNS resolvers (8.8.8.8 / 1.1.1.1)...",
      );
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      await mongoose.connect(MONGO_URI, options);
    } else {
      throw err;
    }
  }
};

// IMPORTANT: bind the port BEFORE — and independently of — the database.
// Render marks a deploy as failed when no port opens in time or when the
// process exits, so a database problem must never stop the API from starting.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));

// Retry with exponential backoff so a persistent misconfiguration does not spam
// the logs every 10 seconds forever (10s → 20s → 40s → 60s cap).
const connectWithRetry = async (attempt = 1) => {
  if (!MONGO_URI) return;

  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error(
      `❌ MongoDB connection attempt ${attempt} failed:\n${describeMongoError(err)}`,
    );
    const delay = Math.min(10000 * 2 ** (attempt - 1), 60000);
    console.warn(
      `⚠️ API still listening on port ${PORT} — retrying in ${delay / 1000}s.`,
    );
    setTimeout(() => connectWithRetry(attempt + 1), delay);
  }
};

connectWithRetry();
