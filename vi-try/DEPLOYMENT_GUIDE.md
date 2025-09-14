# Vercel Deployment Guide

## Environment Variables Required

You need to set these environment variables in your Vercel dashboard:

### 1. Authentication Configuration
```
NEXTAUTH_URL=https://vitry-dbp2mzbgf-musas-projects-42bd9878.vercel.app
NEXTAUTH_SECRET=your-secret-key-here-should-be-at-least-32-characters-long
```

### 2. Database Configuration
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vi-try
```

### 3. Email Configuration (for user verification and password reset)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Stripe Configuration (for payments)
```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Application Configuration
```
NODE_ENV=production
```

### 6. Security
```
JWT_SECRET=your-jwt-secret-here-different-from-nextauth
```

## Steps to Deploy:

1. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all the above variables with your actual values

2. **Update NEXTAUTH_URL:**
   - Replace the URL with your actual Vercel deployment URL
   - This is crucial to fix the authentication callback issues

3. **Database Connection:**
   - Ensure your MongoDB database allows connections from Vercel's IP ranges
   - Update connection string with proper credentials

4. **Redeploy:**
   - After setting environment variables, trigger a new deployment
   - You can do this by pushing a small change to your repository

## Common Issues Fixed:

### ✅ Authentication Callback Issues:
- Added proper redirect callback handling
- Fixed session strategy configuration
- Added proper redirect URL handling

### ✅ Image Loading Issues:
- Fixed case-sensitive file paths (`/logo.png` → `/Logo.png`)
- Fixed Navbar menu icon to use Next.js Image component
- All static assets are properly configured

### ✅ Infinite Redirect Loops:
- Fixed welcome page redirect logic
- Added proper session status checking

## Verification Checklist:

After deployment, verify:
- [ ] Home page loads without authentication errors
- [ ] Images and logos display correctly
- [ ] Login/Register flow works properly
- [ ] No infinite redirects to welcome page
- [ ] Database connections work
- [ ] Payment system functions (if configured)

## Troubleshooting:

If you still see callback issues:
1. Double-check `NEXTAUTH_URL` matches your exact domain
2. Ensure `NEXTAUTH_SECRET` is set and sufficiently long
3. Check Vercel function logs for detailed error messages
4. Verify MongoDB connection string is correct and accessible