# SendGrid Setup & Testing Guide

This guide will help you set up SendGrid and test the seller verification email functionality.

## 📧 Step 1: Set Up SendGrid Account

1. **Create a SendGrid Account**
   - Go to [https://sendgrid.com](https://sendgrid.com)
   - Sign up for a free account (100 emails/day free tier)

2. **Create an API Key**
   - Navigate to **Settings** → **API Keys**
   - Click **Create API Key**
   - Name it (e.g., "HiveJoy Production" or "HiveJoy Development")
   - Select **Full Access** or **Restricted Access** with Mail Send permissions
   - **Copy the API key** (you won't be able to see it again!)

3. **Verify a Sender Email**
   - Go to **Settings** → **Sender Authentication**
   - Click **Verify a Single Sender**
   - Enter your email address (e.g., `noreply@hivejoy.com`)
   - Complete the verification process
   - **Note:** For testing, you can use your personal email, but for production you should use a domain email

## 🔧 Step 2: Configure Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@hivejoy.com  # Must be verified in SendGrid
SENDGRID_AGENT_EMAIL=adarsha.aryal653@gmail.com  # Optional, defaults to this if not set

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For development
# NEXT_PUBLIC_APP_URL=https://hivejoy.netlify.app  # For production
```

**Important:**
- Replace `SG.your_api_key_here` with your actual SendGrid API key
- Replace `noreply@hivejoy.com` with your verified sender email
- The `SENDGRID_AGENT_EMAIL` is optional - it defaults to `adarsha.aryal653@gmail.com`

## 🧪 Step 3: Test the Email Functionality

### Option 1: Test Using the Test Endpoint (Recommended)

Use the test endpoint to send a sample email without creating a producer:

```bash
curl -X POST http://localhost:3000/dev/test/api/send-seller-email \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Honey Farm",
    "email": "seller@example.com",
    "abn": "12345678901",
    "address": {
      "street": "123 Honey Lane",
      "suburb": "Beeville",
      "state": "VIC",
      "postcode": "3000",
      "country": "Australia"
    },
    "bio": "We are a family-owned honey farm producing authentic Australian honey.",
    "producerId": "test-producer-id-123",
    "userId": "test-user-id-456"
  }'
```

Or use a tool like Postman, or create a simple test page.

### Option 2: Test by Creating a Producer

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Sign in to your application** (you need to be authenticated)

3. **Go to the test integration page:**
   - Navigate to `http://localhost:3000/dev/test/integration`
   - Fill in the form with test data
   - Upload an image
   - Submit the form

   This will create a producer and automatically trigger the email to be sent.

### Option 3: Test Using the API Route Directly

You can also test the email API route directly:

```bash
curl -X POST http://localhost:3000/api/sendgrid/seller-registration \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Honey Farm",
    "email": "seller@example.com",
    "abn": "12345678901",
    "address": {
      "street": "123 Honey Lane",
      "suburb": "Beeville",
      "state": "VIC",
      "postcode": "3000",
      "country": "Australia"
    },
    "bio": "We are a family-owned honey farm producing authentic Australian honey.",
    "producerId": "test-producer-id-123",
    "userId": "test-user-id-456"
  }'
```

## ✅ Step 4: Verify It's Working

1. **Check the console logs** - You should see:
   - `Sending test email to: adarsha.aryal653@gmail.com`
   - `SendGrid API Key configured: true`

2. **Check the response** - You should get:
   ```json
   {
     "success": true,
     "message": "Email sent successfully!",
     "recipient": "adarsha.aryal653@gmail.com"
   }
   ```

3. **Check the recipient inbox** - The email should arrive at `adarsha.aryal653@gmail.com` (or your configured agent email)

4. **Check SendGrid Dashboard**:
   - Go to **Activity** → **Email Activity**
   - You should see the email in the activity feed
   - Check for any delivery issues

## 🐛 Troubleshooting

### Email Not Sending

1. **Check API Key:**
   ```bash
   # In your .env.local, verify:
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

2. **Check Sender Email:**
   - Must be verified in SendGrid
   - Check **Settings** → **Sender Authentication**

3. **Check Console Logs:**
   - Look for error messages in your terminal
   - Common errors:
     - `SendGrid API key is not configured` - Missing API key
     - `403 Forbidden` - Invalid API key or insufficient permissions
     - `400 Bad Request` - Invalid sender email

4. **Check SendGrid Activity:**
   - Go to **Activity** → **Email Activity**
   - Look for failed emails and error messages

### Common Errors

**Error: "SendGrid API key is not configured"**
- Solution: Add `SENDGRID_API_KEY` to your `.env.local` file

**Error: "403 Forbidden"**
- Solution: Check that your API key has Mail Send permissions

**Error: "The from address does not match a verified Sender Identity"**
- Solution: Verify your sender email in SendGrid dashboard

**Error: "Email not received"**
- Solution: Check spam folder, verify recipient email is correct

## 📝 Testing Checklist

- [ ] SendGrid account created
- [ ] API key generated and added to `.env.local`
- [ ] Sender email verified in SendGrid
- [ ] Environment variables configured
- [ ] Test endpoint returns success
- [ ] Email received in inbox
- [ ] Email content looks correct
- [ ] Links in email work properly

## 🚀 Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform (Vercel, Netlify, etc.)
2. **Use a production sender email** (e.g., `noreply@hivejoy.com`)
3. **Update `NEXT_PUBLIC_APP_URL`** to your production domain
4. **Test in production** before going live

## 📚 Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [SendGrid API Reference](https://docs.sendgrid.com/api-reference)
