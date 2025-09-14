# Vercel Authentication Fix Guide

This document provides solutions for authentication middleware issues on Vercel deployment.

## 🔧 Environment Variables Required on Vercel

### 1. **NEXTAUTH_URL** (Critical)
```bash
NEXTAUTH_URL=https://your-app-name.vercel.app
```
⚠️ **This must match your exact Vercel domain**

### 2. **NEXTAUTH_SECRET** (Critical)
```bash
NEXTAUTH_SECRET=your-secure-random-string-here
```
Generate with: `openssl rand -base64 32`

### 3. **MONGODB_URI** (Required)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vi-try
```

### 4. **Debug Environment** (Optional, for troubleshooting)
```bash
ENABLE_DEBUG_ENDPOINTS=true
```

## 🚀 Deployment Steps

1. **Set Environment Variables in Vercel Dashboard:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all the variables listed above

2. **Verify Domain Configuration:**
   - Ensure `NEXTAUTH_URL` matches your Vercel domain exactly
   - Include `https://` prefix
   - No trailing slash

3. **Redeploy:**
   - Trigger a new deployment after setting environment variables
   - Go to Deployments tab and click "Redeploy"

## 🐛 Debugging Steps

### Step 1: Check Environment Variables
Visit: `https://your-app.vercel.app/api/debug/auth-status`

This will show:
- ✅ Environment variables status
- 🔐 Session and token information
- 🍪 Cookie details
- 🌐 Request headers

### Step 2: Common Issues & Solutions

#### Issue: "Redirected to login even when logged in"
**Solution:**
- Verify `NEXTAUTH_URL` matches Vercel domain exactly
- Clear browser cookies
- Check if `NEXTAUTH_SECRET` is set

#### Issue: "Token validation fails"
**Solution:**
- Ensure `NEXTAUTH_SECRET` is identical between local and Vercel
- Verify JWT token expiry settings
- Check server logs in Vercel dashboard

#### Issue: "CORS or cookie issues"
**Solution:**
- Verify domain in `NEXTAUTH_URL`
- Check if using custom domain vs Vercel domain
- Ensure secure cookies are enabled

## 🔍 Enhanced Middleware Features

The updated middleware now includes:
- ✅ Better token validation for serverless environments
- 🔧 Enhanced logging for production debugging
- 🔐 Improved JWT secret handling
- 🌐 Better CORS and cookie management

## 📋 Quick Checklist

- [ ] `NEXTAUTH_URL` set correctly on Vercel
- [ ] `NEXTAUTH_SECRET` set on Vercel (same as local)
- [ ] `MONGODB_URI` configured for production
- [ ] Redeployed after setting environment variables
- [ ] Tested login flow on production
- [ ] Verified protected routes work
- [ ] Checked debug endpoint (if enabled)

## 🆘 Still Having Issues?

1. **Enable Debug Mode:**
   ```bash
   ENABLE_DEBUG_ENDPOINTS=true
   ```

2. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Functions tab
   - Check real-time logs during authentication

3. **Test Locally with Production Environment:**
   ```bash
   NODE_ENV=production npm run dev
   ```

4. **Common Vercel-Specific Issues:**
   - Serverless function cold starts
   - JWT token size limits
   - Cookie SameSite policies
   - Domain/subdomain mismatches

## 📞 Environment Variable Template

Copy this to your `.env` file and update for Vercel:

```bash
# Production Environment Variables for Vercel
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secure-random-string-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vi-try

# Optional: Enable debug endpoints
ENABLE_DEBUG_ENDPOINTS=true

# Other required variables...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🔄 Changes Made to Fix Vercel Issues

1. **Enhanced Middleware (`middleware.js`):**
   - Better token validation for serverless
   - Improved error handling
   - Enhanced logging for production debugging

2. **Enhanced NextAuth Config (`[...nextauth].js`):**
   - Better JWT configuration
   - Enhanced session handling
   - Improved redirect logic for Vercel domains

3. **Debug Endpoint (`/api/debug/auth-status`):**
   - Real-time authentication status checking
   - Environment variable validation
   - Cookie and session debugging