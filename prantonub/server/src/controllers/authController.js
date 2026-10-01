const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  validateEmail,
  validatePassword,
  validateName,
  sanitizeString,
  sanitizeEmail,
} = require("../utils/validators");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER — creates an active account immediately (no email verification)
// ─────────────────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    throw new AppError("Name, email, and password are required", 400);
  if (!validateName(name))
    throw new AppError("Name must be between 2-100 characters", 400);
  if (!validateEmail(email)) throw new AppError("Invalid email format", 400);
  if (!validatePassword(password))
    throw new AppError("Password must be at least 6 characters", 400);

  const sanitizedEmail = sanitizeEmail(email);
  const sanitizedName = sanitizeString(name);

  const existingUser = await User.findOne({ email: sanitizedEmail });

  if (existingUser) throw new AppError("Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 12);

  console.log(`📝 Creating new user: ${sanitizedEmail}`);
  await User.create({
    name: sanitizedName,
    email: sanitizedEmail,
    passwordHash,
    isVerified: true,
  });

  res.status(200).json({
    success: true,
    message: "Account created successfully",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Email and password are required", 400);
  if (!validateEmail(email)) throw new AppError("Invalid email format", 400);

  const sanitizedEmail = sanitizeEmail(email);
  const user = await User.findOne({ email: sanitizedEmail });

  if (!user) throw new AppError("Invalid email or password", 401);

  if (user.passwordHash === "google-oauth")
    throw new AppError("Please sign in with Google instead", 400);

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) throw new AppError("Invalid email or password", 401);

  if (!user.isActive) throw new AppError("Account has been deactivated", 403);

  res.json({
    success: true,
    token: generateToken(user._id),
    user: sanitize(user),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
});

const sanitize = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  currency: u.currency,
  monthlyBudget: u.monthlyBudget,
  theme: u.theme,
  googleId: u.googleId,
  isVerified: u.isVerified,
});

module.exports = {
  register,
  login,
  getMe,
  generateToken,
  sanitize,
};
