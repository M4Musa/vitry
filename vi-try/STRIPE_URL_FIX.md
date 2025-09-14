# Fix Stripe Redirect URL Issue

## 🔍 **Problem Identified**
After Stripe payment, users are being redirected to `http://localhost:3000/subscription?session_id=...` instead of your production domain.

## 🎯 **Root Cause**
The issue is in `/pages/api/checkout.js` where Stripe checkout session URLs are configured using `process.env.NEXTAUTH_URL`, which is set to `localhost:3000` in your local environment.

## ✅ **Solutions Applied**

### 1. **Code Fix Applied** (Dynamic URL Detection)
Updated `/pages/api/checkout.js` to automatically detect the correct URL:

```js
// Before:
success_url: `${process.env.NEXTAUTH_URL}/subscription?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`,

// After:
const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

success_url: `${baseUrl}/subscription?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${baseUrl}/subscription?canceled=true`,
```

### 2. **Environment Variables to Set in Vercel**

Go to your Vercel Dashboard → vitry project → Settings → Environment Variables and set:

```env
NEXTAUTH_URL=https://vitry.vercel.app
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vi-try
```

## 🚀 **How This Fix Works**

1. **Development**: Uses `NEXTAUTH_URL` (localhost:3000)
2. **Production (Vercel)**: Uses `VERCEL_URL` environment variable automatically
3. **Fallback**: If neither is available, defaults to localhost

## 📋 **Environment Variables Currently in Your .env**
I noticed in your local `.env`:
- `NEXTAUTH_URL="http://localhost:3000"` ← This was causing the issue
- This is fine for local development
- But production needs to use `https://vitry.vercel.app`

## 🔧 **Additional Vercel Environment Variables Needed**

Based on your `.env` file, you'll also need:

```env
# Email Configuration
EMAIL_USERNAME=vi.try0110@gmail.com
RECEIVER_EMAIL=vi.try0110@gmail.com
EMAIL_PASSWORD=rlqvcupkdkyohbrg

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51QyV9ACEAYYx5FHJd3t4ppTeOGK5mzoT5KT8a4OJWObPoJlLAxTdn7ypY9VuJ7ygZffRBKkJL2YbLJiTZBQKJstJ00lg8coAet
STRIPE_WEBHOOK_SECRET=pk_test_51QyV9ACEAYYx5FHJMTmeBXna7gytTrsmr8iq9TlrQ5tkUqX7tutWRvwh0PT4WeW1baOwwjJn15gSc7fTPn5zmDd9003qJZtqBK

# Price IDs
NEXT_PUBLIC_BASIC_PRICE_ID=price_1QyWLNCEAYYx5FHJAbuCUpjM
NEXT_PUBLIC_PRO_PRICE_ID=price_1QyWLsCEAYYx5FHJRXUsW1qm
NEXT_PUBLIC_ENTERPRISE_PRICE_ID=price_1QyWNACEAYYx5FHJNzKAWuRB

# Database
MONGODB_URI=mongodb+srv://admin:12345@vi-try.0cq8h.mongodb.net/myDatabase

# JWT
JWT_SECRET=your_jwt_secret
```

## 🎯 **Expected Result After Fix**

After payment completion, users will now be redirected to:
```
https://vitry.vercel.app/subscription?session_id=cs_test_...
```

Instead of:
```
http://localhost:3000/subscription?session_id=cs_test_...
```

## ⚡ **Next Steps**

1. **Commit and push** the code changes
2. **Set environment variables** in Vercel Dashboard  
3. **Trigger redeploy** (happens automatically after env var changes)
4. **Test payment flow** - should now redirect correctly

The payment verification should now work properly in production! 🎉