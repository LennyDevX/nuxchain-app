# Firebase Admin Setup for Vercel

## Problem Solved
Fixed the "Server returned invalid response: Unexpected token 'A'..." error that occurred when Firebase Admin SDK was not properly initialized before calling `getFirestore()`.

## What Changed
1. Created centralized Firebase Admin initialization in `api/_services/firebase-admin.ts`
2. Updated all backend files to use `getDb()` instead of direct `getFirestore()` calls
3. Add proper error handling to return JSON errors instead of HTML

## Vercel Configuration Required

### Option 1: Using Service Account (Recommended for Production)

1. **Get Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (nuxchain1)
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. **Add to Vercel:**
   ```bash
   # In your terminal
   vercel env add FIREBASE_SERVICE_ACCOUNT
   ```
   - Paste the ENTIRE JSON content (minified, no line breaks)
   - Select: Production, Preview, Development
   - Example format: `{"type":"service_account","project_id":"nuxchain1",...}`

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Using Environment Variables (Quick Fix)

If Option 1 doesn't work immediately, Vercel can use the project ID:

1. Verify `VITE_FIREBASE_PROJECT_ID` is set in Vercel:
   ```bash
   vercel env ls
   ```

2. If missing, add it:
   ```bash
   vercel env add VITE_FIREBASE_PROJECT_ID
   # Value: nuxchain1
   ```

## Testing

After deploying, test the airdrop registration:
1. Go to https://nuxchain.com/airdrop
2. Fill in the form
3. Click "Register for Airdrop"
4. Should see proper JSON error messages or success (no more "Unexpected token" errors)

## Files Modified
- ✅ `api/_services/firebase-admin.ts` (NEW)
- ✅ `api/airdrop/validate-and-register.ts`
- ✅ `api/_services/distributed-rate-limiter.ts`
- ✅ `api/_services/audit-logger.ts`

## Error Messages Before vs After

**Before:**
```
Server returned invalid response: Unexpected token 'A', "A server e"... is not valid JSON
```

**After:**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please wait a moment before trying again.",
  "retryAfter": 45
}
```

## Troubleshooting

If you still see errors after deploying:

1. **Check Vercel Logs:**
   ```bash
   vercel logs --follow
   ```

2. **Verify Environment Variables:**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Ensure `FIREBASE_SERVICE_ACCOUNT` or `VITE_FIREBASE_PROJECT_ID` is set

3. **Test Locally:**
   ```bash
   # Add to .env file
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   
   # Run dev server
   npm run dev
   ```

## Contact
If issues persist, check Firebase Console to ensure:
- ✅ Firestore is enabled
- ✅ Authentication is enabled
- ✅ Service account has proper permissions (Firestore Admin)
