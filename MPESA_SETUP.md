# M-PESA Integration Setup Guide

This guide explains how to set up M-PESA integration for ServiceConnect.

## Setup Environment Variables

Add the following variables to your `.env` file:

```
# M-PESA Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
```

## Development with ngrok

For development, you need a publicly accessible URL to receive callbacks from Safaricom. You can use ngrok:

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/)
2. Start your Next.js application: `npm run dev`
3. In a separate terminal, run: `ngrok http 3000`
4. You'll get a public URL like `https://abcd1234.ngrok.io`
5. Update your `.env` file with:
   ```
   MPESA_CALLBACK_URL=https://abcd1234.ngrok.io/api/mpesa/callback
   ```

## Alternative: Using webhook.site

If you just want to test the payment flow without implementing the callback, you can use webhook.site:

1. Go to [webhook.site](https://webhook.site/)
2. You'll get a unique URL that you can use for testing
3. Update your `.env` file with:
   ```
   MPESA_CALLBACK_URL=https://webhook.site/your-unique-id
   ```

## Production Setup

For production, set the `MPESA_CALLBACK_URL` to your actual production URL:

```
MPESA_CALLBACK_URL=https://serviceconnect.co.ke/api/mpesa/callback
```

## Troubleshooting

If you receive a "Bad Request - Invalid CallBackURL" error, it means:
1. Your callback URL is not publicly accessible
2. The callback URL format is incorrect
3. You're using localhost which is not accessible from the internet

The M-PESA API requires a public HTTPS URL as the callback URL. 