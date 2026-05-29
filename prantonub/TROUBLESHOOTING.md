# 📧 Email Verification Troubleshooting Guide

## Problem: "Email verification isn't working" or "OTP not received"

This guide helps you fix email verification issues in FinanceHub.

---

## ✅ Quick Checklist

- [ ] `.env` file exists in `server/` directory
- [ ] `BREVO_USER` is set (looks like: `xxxxx@smtp-brevo.com`)
- [ ] `BREVO_PASS` is set (very long string)
- [ ] `BREVO_SENDER_EMAIL` is set to a valid email address
- [ ] `CLIENT_URL` is set correctly
- [ ] Server is running without errors
- [ ] Check server console for error messages

---

## 🔧 Setup Email Service (Brevo)

### Step 1: Create Brevo Account
1. Go to https://www.brevo.com
2. Sign up for a **free account**
3. Complete email verification

### Step 2: Get SMTP Credentials
1. Log in to Brevo dashboard
2. Go to **Settings** → **SMTP & API**
3. Find your **SMTP relay credentials**:
   - **BREVO_USER**: Relay email (e.g., `abc123@smtp-brevo.com`)
   - **BREVO_PASS**: Relay password (very long string starting with `xsmtpsib-`)

### Step 3: Configure .env File
Create or update `server/.env`:

```env
# Email Configuration
BREVO_USER=your_relay_email@smtp-brevo.com
BREVO_PASS=your_relay_password
BREVO_SENDER_EMAIL=noreply@yourdomain.com
```

⚠️ **Important**: `BREVO_SENDER_EMAIL` should be:
- Your actual email address, OR
- A custom domain email you've verified in Brevo

### Step 4: Restart Server
```bash
cd server
npm start
```

---

## 🐛 Debug Issues

### Issue 1: "Email not configured" error

**Symptoms**: Registration works but no email is sent

**Solution**:
```env
# Check these are NOT empty in server/.env
BREVO_USER=<something>
BREVO_PASS=<something>
BREVO_SENDER_EMAIL=<something>
```

**Check server logs**:
- Run server and look for console output starting with 🔐 and 📧
- If you see `❌ Email not configured`, add the missing variables

---

### Issue 2: "Failed to send verification email"

**Symptoms**: Registration fails with email error

**Solution**:
1. Verify Brevo credentials are correct (copy-paste from Brevo dashboard)
2. Check internet connection
3. Verify `BREVO_SENDER_EMAIL` is a valid email format

**Check server logs**:
```
❌ Brevo email error: <error message>
```
Common errors:
- `Invalid credentials` → Check BREVO_USER and BREVO_PASS
- `SMTP connection failed` → Check internet or Brevo service status

---

### Issue 3: "Email never arrives"

**Symptoms**: Registration succeeds, but user doesn't receive OTP email

**Solutions**:
1. **Check spam folder** - Brevo emails sometimes go to spam
2. **Verify sender email**:
   - Make sure `BREVO_SENDER_EMAIL` looks legitimate
   - Consider using a domain email instead of free email
3. **Check Brevo quota**:
   - Free Brevo accounts have daily limits
   - Log into Brevo dashboard to check usage
4. **Wait a bit** - Email delivery can take 1-2 minutes

---

### Issue 4: "Invalid verification code" when entering OTP

**Symptoms**: OTP appears invalid even though it was received

**Potential causes**:
1. **OTP expired** - Valid for 10 minutes only
   - Solution: Click "Resend code" to get a new one
2. **Typo in OTP** - Check all 6 digits are correct
3. **Browser issue** - Try a different browser or incognito window
4. **Clock skew** - Server and client time might be out of sync
   - Solution: Check system time on both machines

---

## 🚀 For Development/Testing

### Quick Test Without Real Email

If you don't have Brevo set up yet, you can still test registration:

1. In `server/.env`, set `NODE_ENV=development`
2. Leave email credentials blank or use dummy values
3. **Registration will succeed** but email won't send (development mode only)
4. Check **server console** for the generated OTP
5. Use that OTP in the verification form

**Console output example**:
```
🔐 Generated OTP for user@example.com: 123456
📧 Sending OTP email to: user@example.com
⚠️ WARNING: Email not sent in development mode. User still registered.
```

Then use OTP `123456` to verify email.

---

## 📊 Server Console Debugging

**Enable verbose logging** by checking for these messages:

### ✅ Successful flow:
```
📝 Creating new user: user@example.com
🔐 Generated OTP for user@example.com: 123456
📧 Sending OTP email to: user@example.com
✅ OTP email sent successfully to: user@example.com
🔍 Verifying email: user@example.com with OTP: 123456
✅ Email verified successfully: user@example.com
```

### ❌ Error flow:
```
❌ Email not configured. Add BREVO_USER and BREVO_PASS
❌ User not found: user@example.com
❌ OTP expired for: user@example.com
❌ Invalid OTP for user@example.com. Expected: 123456, Got: 654321
```

---

## 🆘 Still Not Working?

1. **Check .env file location**: Must be in `server/` directory
2. **Server needs restart**: After changing .env, restart with `npm start`
3. **Clear browser cache**: Try incognito/private window
4. **Check internet connection**: Email requires internet access
5. **Verify MongoDB**: Make sure database is connected

Still stuck? Check:
- Server port is not blocked
- MongoDB Atlas IP whitelist (if using cloud DB)
- Brevo account not suspended/limited

---

## 📞 Get Help

**Server logs show detailed errors** - Look for:
- `❌` (error) markers
- `📧` (email) messages  
- `🔐` (OTP) generation

Share these logs for faster debugging!
