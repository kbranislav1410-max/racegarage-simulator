# Email Configuration - Security Fix Summary

## What Happened?

When setting up email notifications for reservations, real API credentials were accidentally added to the `.env.example` file, which is committed to Git and publicly visible. This created a security vulnerability.

## What Was Fixed?

✅ **Removed all real credentials from `.env.example`**
- Real Resend API key → placeholder `re_your_api_key_here`
- Real email address → placeholder `noreply@yourdomain.sk`
- Added example SMTP configuration with safe placeholder values

✅ **Enhanced security documentation**
- Added explicit warnings about credential safety
- Added recovery steps for accidental commits

## How to Properly Set Up Email Configuration

### Step 1: Create Your Local `.env` File

```bash
# Copy the example file
cp .env.example .env
```

### Step 2: Add Your Real Credentials to `.env`

Edit `.env` (NOT `.env.example`) and add your real credentials:

**For Resend (Recommended):**
```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_YOUR_REAL_API_KEY"
EMAIL_FROM="noreply@yourdomain.sk"
```

**For Gmail/SMTP:**
```env
EMAIL_PROVIDER="nodemailer"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-real-email@gmail.com"
SMTP_PASS="your-real-app-password"
EMAIL_FROM="noreply@yourdomain.sk"
```

### Step 3: Verify `.env` is Not Committed

The `.env` file should NEVER be committed to Git. Verify:

```bash
# Check gitignore includes .env
cat .gitignore | grep ".env"
# Should show: .env*

# Verify .env is not tracked
git status
# .env should NOT appear in the list
```

## Important Security Rules

### ✅ DO:
- Put real credentials in `.env` (local file, not committed)
- Use placeholder values in `.env.example` (committed to Git)
- Keep `.env` in `.gitignore`
- For production, set environment variables directly in hosting platform (Vercel, etc.)

### ❌ DON'T:
- Never put real API keys in `.env.example`
- Never commit `.env` file to Git
- Never share API keys in documentation or comments
- Never hardcode credentials in source code

## If You Accidentally Committed Credentials

1. **Immediately revoke/regenerate the API keys:**
   - For Resend: Go to dashboard and delete the exposed API key, create a new one
   - For Gmail: Revoke the app password and create a new one

2. **Remove the credentials from Git history** (if needed):
   ```bash
   # Contact your team lead or DevOps for help with this
   # It requires rewriting Git history
   ```

3. **Update your local `.env` with new credentials**

## Current Status

✅ All security issues fixed
✅ Build successful
✅ Code review passed
✅ Security scan passed
✅ Email functionality working correctly (with fire-and-forget pattern)

## How Email Works Now

1. **Dynamic imports** - Email libraries only load when actually sending email
2. **No build-time network calls** - Nothing connects to external services during build
3. **Graceful fallback** - Falls back to console logging if no provider configured
4. **Fire-and-forget** - Email failures don't crash reservation creation
5. **Proper error handling** - All email errors are caught and logged

## For More Information

- See `NASTAVENIE_EMAILOV_REZERVACIE.md` for complete email setup guide (in Slovak)
- See `EMAIL_NOTIFICATIONS.md` for ride completion email notifications
- See `.env.example` for configuration template

## Questions?

If you have questions about email configuration or security:
1. Read the documentation mentioned above
2. Check that your `.env` file is properly configured
3. Verify `.env` is not being committed to Git
4. Test with console fallback first (don't set EMAIL_PROVIDER)
