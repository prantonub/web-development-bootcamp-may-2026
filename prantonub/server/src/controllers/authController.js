const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/emailService");
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

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER — creates unverified user and sends OTP
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

  // Block if already verified
  if (existingUser && existingUser.isVerified)
    throw new AppError("Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (existingUser) {
    // Exists but not verified — update and resend
    console.log(`📝 Updating unverified user: ${sanitizedEmail}`);
    existingUser.name = sanitizedName;
    existingUser.passwordHash = passwordHash;
    existingUser.otp = otp;
    existingUser.otpExpiry = otpExpiry;
    await existingUser.save();
  } else {
    console.log(`📝 Creating new user: ${sanitizedEmail}`);
    await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      passwordHash,
      otp,
      otpExpiry,
      isVerified: false,
    });
  }

  console.log(`🔐 Generated OTP for ${sanitizedEmail}: ${otp}`);
  console.log(`📧 Sending OTP email to: ${sanitizedEmail}`);

  try {
    await sendOtpEmail(sanitizedEmail, otp);
    console.log(`✅ OTP email sent successfully to: ${sanitizedEmail}`);
  } catch (emailErr) {
    console.error(
      `❌ Email sending failed for ${sanitizedEmail}:`,
      emailErr.message,
    );
    // In development, still allow registration to continue for testing
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `⚠️ Continuing registration without email (development mode)`,
      );
    } else {
      throw emailErr;
    }
  }

  res.status(200).json({
    success: true,
    message: "Verification code sent to your email",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY EMAIL — checks OTP and activates account
// ─────────────────────────────────────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new AppError("Email and OTP are required", 400);

  const sanitizedEmail = sanitizeEmail(email);
  console.log(`🔍 Verifying email: ${sanitizedEmail} with OTP: ${otp}`);

  const user = await User.findOne({ email: sanitizedEmail });

  if (!user) {
    console.error(`❌ User not found: ${sanitizedEmail}`);
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    console.warn(`⚠️ User already verified: ${sanitizedEmail}`);
    throw new AppError("Email is already verified", 400);
  }

  if (!user.otp || !user.otpExpiry) {
    console.error(`❌ No OTP found for: ${sanitizedEmail}`);
    throw new AppError(
      "No verification code found. Please register again.",
      400,
    );
  }

  if (new Date() > user.otpExpiry) {
    console.error(`❌ OTP expired for: ${sanitizedEmail}`);
    throw new AppError(
      "Verification code has expired. Please request a new one.",
      400,
    );
  }

  if (user.otp !== otp) {
    console.error(
      `❌ Invalid OTP for ${sanitizedEmail}. Expected: ${user.otp}, Got: ${otp}`,
    );
    throw new AppError("Invalid verification code", 400);
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  console.log(`✅ Email verified successfully: ${sanitizedEmail}`);

  res.json({
    success: true,
    message: "Email verified successfully",
    token: generateToken(user._id),
    user: sanitize(user),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESEND OTP — generates a fresh code and emails it
// ─────────────────────────────────────────────────────────────────────────────
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new AppError("Email is required", 400);

  const sanitizedEmail = sanitizeEmail(email);
  console.log(`🔄 Resending OTP for: ${sanitizedEmail}`);

  const user = await User.findOne({ email: sanitizedEmail });

  if (!user) {
    console.error(`❌ User not found for resend: ${sanitizedEmail}`);
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    console.warn(
      `⚠️ User already verified, cannot resend OTP: ${sanitizedEmail}`,
    );
    throw new AppError("Email is already verified", 400);
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  console.log(`🔐 Generated new OTP for ${sanitizedEmail}: ${otp}`);
  console.log(`📧 Sending OTP email to: ${sanitizedEmail}`);

  try {
    await sendOtpEmail(sanitizedEmail, otp);
    console.log(`✅ OTP email resent successfully to: ${sanitizedEmail}`);
  } catch (emailErr) {
    console.error(
      `❌ Email resend failed for ${sanitizedEmail}:`,
      emailErr.message,
    );
    // In development, still allow to continue for testing
    if (process.env.NODE_ENV !== "production") {
      console.warn(`⚠️ Continuing without email (development mode)`);
    } else {
      throw emailErr;
    }
  }

  res.json({
    success: true,
    message: "New verification code sent to your email",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — only allows verified users
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

  if (!user.isVerified)
    throw new AppError("Please verify your email before logging in", 403);

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
  verifyEmail,
  resendOtp,
};
