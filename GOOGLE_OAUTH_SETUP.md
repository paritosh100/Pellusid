# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Configure consent screen if prompted:
     - User Type: **External**
     - App name: **Pellucid Insights**
     - User support email: Your email
     - Developer contact: Your email
     - Save and continue through all steps
   
5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Pellucid Insights**
   - Authorized redirect URIs:
     - Add: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - Replace `YOUR_PROJECT_REF` with your actual Supabase project reference
   - Click **Create**
   
6. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it to **Enabled**
5. Paste your Google credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. Click **Save**

## Step 3: Find Your Supabase Project Reference

Your redirect URI needs your Supabase project reference:
- In Supabase dashboard, go to **Settings** → **API**
- Look for **Project URL**: `https://YOUR_PROJECT_REF.supabase.co`
- Use this in Google OAuth redirect URI

## Step 4: Test the Integration

1. Restart your dev server: `npm run dev`
2. Go to http://localhost:3000/login
3. Click "Continue with Google"
4. You should be redirected to Google login
5. After login, you'll be redirected back to your app

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- No trailing slashes
- Use `https://` not `http://`

### "OAuth client not found"
- Double-check Client ID and Secret in Supabase
- Make sure you saved the changes in Supabase

### Email not verified
- Google OAuth automatically verifies emails
- Users won't need to click email confirmation links

## What's Implemented

✅ **Login Page** - "Continue with Google" button  
✅ **Signup Page** - "Continue with Google" button  
✅ **Auth Callback** - Handles OAuth redirects  
✅ **Styled UI** - Matches your tropical mint theme  

## Cost

- **Free** - No charges from Google or Supabase for OAuth
- Included in Supabase free tier (50,000 MAU)
