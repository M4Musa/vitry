# Firebase Configuration for Production Deployment

## 🔥 Fixed Issues

### ✅ JWT Signature Error
The "Invalid JWT Signature" error was caused by hardcoded Firebase credentials that can become invalid in production environments. 

**Solution**: Environment-based credential management with fallbacks.

### ✅ Background Blur Removal
Removed `backdrop-filter: blur(2px)` from sidebar overlay as requested.

## 🚀 Production Setup

### Environment Variables Required

Add these to your Vercel/deployment environment:

#### Option 1: Full Service Account JSON (Recommended)
```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"vi-try",...}
FIREBASE_STORAGE_BUCKET=vi-try.appspot.com
```

#### Option 2: Individual Variables
```bash
FIREBASE_PROJECT_ID=vi-try
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-z630y@vi-try.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=vi-try.appspot.com
```

#### Option 3: Service Account File
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
FIREBASE_STORAGE_BUCKET=vi-try.appspot.com
```

## 📋 Vercel Deployment Steps

1. **Add Environment Variables**:
   ```bash
   # In your Vercel dashboard or CLI
   vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
   vercel env add FIREBASE_STORAGE_BUCKET
   ```

2. **Or via Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add the variables listed above
   - Make sure to select all environments (Production, Preview, Development)

## 🛠️ Development Setup

For local development, create a `.env.local` file:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FIREBASE_STORAGE_BUCKET=vi-try.appspot.com
NEXTAUTH_SECRET=your-secret-here
MONGODB_URI=your-mongodb-connection-string
```

## 🔍 Troubleshooting

### Error: "Firebase credentials not found"
- **Production**: Ensure environment variables are set in your deployment platform
- **Development**: Check that `.env.local` exists and has correct values

### Error: "Invalid private key"
- The private key must include `\n` characters properly escaped
- Use double quotes around the entire key
- Ensure no extra spaces or characters

### Error: "Bucket does not exist"
- Check that `FIREBASE_STORAGE_BUCKET` matches your Firebase project
- Ensure the bucket name is `vi-try.appspot.com` (not just `vi-try`)

## 🧪 Testing

To test Firebase connectivity:
```bash
# Check if environment variables are loaded
npm run dev
# Look for console output: "✅ Firebase Admin SDK initialized successfully"
```

## 📁 Files Modified

1. **`config/firebaseAdmin.js`** - New centralized Firebase configuration
2. **`pages/api/user/profile.js`** - Updated to use new configuration
3. **`components/Navbar.module.css`** - Removed background blur
4. **`components/Navbar.jsx`** - Enhanced click-outside functionality

## 🔐 Security Notes

- Never commit Firebase credentials to git
- Use environment variables for all sensitive data
- The fallback hardcoded credentials are only for development
- Production deployments will throw an error if credentials are missing

## ✨ Enhanced Features

- **Smart Error Handling**: Better error messages for debugging
- **Multiple Credential Sources**: Supports various deployment scenarios
- **Development Warnings**: Clear feedback when using fallback credentials
- **Improved Logging**: Detailed Firebase initialization logs

The image upload should now work reliably in both development and production environments!