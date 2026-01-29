# Email Notifications

The Racegarage Simulator includes automatic email notifications sent to customers after completing a ride session.

## Features

After each ride is recorded, the customer automatically receives an email containing:

1. **Today's ride minutes** - Minutes from the just-completed ride
2. **Total minutes** - Cumulative minutes across all historical rides
3. **Challenge information** (if applicable):
   - Displayed only if the customer has recorded a challenge attempt in the last 24 hours for the current month's challenge
   - Shows the customer's best lap time for the month
   - Shows the customer's current position on the leaderboard

## Configuration

The system supports multiple email providers with automatic fallback to console logging if no provider is configured.

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env`:

```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@yourdomain.com"
```

### Option 2: Nodemailer (SMTP)

Use any SMTP server (Gmail, SendGrid, Amazon SES, etc.):

```env
EMAIL_PROVIDER="nodemailer"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Option 3: Console Fallback (Development)

If no `EMAIL_PROVIDER` is set, emails are logged to the console instead of being sent. This is useful for development and testing.

```env
# Leave EMAIL_PROVIDER empty or omit it
EMAIL_FROM="noreply@racegarage.local"
```

## Email Templates

The system includes both HTML and plain text versions of the email:

- **HTML version**: Styled with inline CSS, responsive design, summary cards
- **Text version**: Plain text fallback for email clients that don't support HTML

Example email content:
```
Subject: Ride Complete - 30 min + Challenge Update 🏆

Hi John Doe,

Thank you for riding with us today! Here's a summary of your session:

TODAY: 30 minutes
TOTAL: 150 minutes

CHALLENGE UPDATE - January 2026
Your Best Lap Time: 01:23.456
Current Leaderboard Position: #5
```

## Audit Logging

All email sending attempts are logged to the `AuditLog` table with:
- Action: `EMAIL_SENT`
- Entity: `RideSession`
- EntityId: Customer ID
- Payload: Recipient email, subject, success status, whether challenge info was included

## Error Handling

Email sending is designed to never fail the ride creation request:

1. Email sending happens asynchronously (fire-and-forget)
2. If the email provider fails, the error is logged but the ride is still created successfully
3. Audit logs are created for all sending attempts (both successful and failed)
4. If audit logging fails, it doesn't affect the email or ride creation

## Implementation Details

### Files

- `/lib/email/provider.ts` - Email provider interface and implementations (Resend, Nodemailer, Console)
- `/lib/email/templates.ts` - HTML and text email templates
- `/lib/email/service.ts` - Main email service with business logic
- `/api/rides/route.ts` - Integration point (calls `sendRideCompletionEmail` after creating ride)

### Challenge Information Logic

Challenge information is included in the email only if ALL conditions are met:

1. A `ChallengeMonth` exists for the current month and year
2. The customer has recorded at least one `ChallengeAttempt` in the last 24 hours for that challenge
3. The customer has a best lap time for that challenge month

The leaderboard position is calculated by counting how many customers have a better (lower) best lap time than the current customer.

## Testing

To test email notifications:

1. **With Console Provider** (default):
   ```bash
   npm run dev
   # Record a ride - check console for email output
   ```

2. **With Resend** (recommended for production):
   ```bash
   # Add RESEND_API_KEY to .env
   npm run dev
   # Record a ride - email will be sent
   ```

3. **With Challenge Info**:
   ```bash
   # 1. Create a challenge month for current month
   # 2. Record a challenge attempt for a customer
   # 3. Record a ride for the same customer within 24 hours
   # 4. Email will include challenge info
   ```

## Production Recommendations

1. **Use Resend** for simplicity and reliability
2. **Set up a custom domain** in Resend for better deliverability
3. **Monitor audit logs** to track email sending success/failure rates
4. **Set up email templates** in your email provider for additional customization
5. **Consider rate limiting** if sending high volumes of emails
6. **Test thoroughly** before deploying to production

## Troubleshooting

**Emails not being sent:**
- Check that `EMAIL_PROVIDER` is set in `.env`
- Verify API keys or SMTP credentials are correct
- Check application logs for error messages
- Verify customer has a valid email address

**Challenge info not appearing:**
- Ensure challenge month exists for current month
- Verify customer has attempt in last 24 hours
- Check that attempt is linked to current month's challenge

**Console fallback always used:**
- Verify `.env` file is in the root directory
- Check that environment variables are loaded correctly
- Restart the development server after changing `.env`
