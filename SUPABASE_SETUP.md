# Supabase Integration Setup Guide

## Prerequisites
1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project

## Step 1: Run the Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase/schema.sql` and paste it into the editor
5. Click "Run" to execute the SQL

This will create:
- `users` table (extends Supabase auth.users)
- `readings` table (stores all generated readings)
- `journal_responses` table (tracks journal prompt interactions)
- `analytics_events` table (tracks user behavior)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for auto-updating timestamps

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Click on "API" in the settings menu
3. Copy the following values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```
   OPENAI_API_KEY=your_actual_openai_key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

## Step 4: Restart the Development Server

```bash
npm run dev
```

## Features Enabled

With Supabase integration, you now have:

✅ **Persistent Storage**: Readings are saved to the database, not in-memory  
✅ **Analytics Tracking**: All user interactions are logged for insights  
✅ **Journal Responses**: Prompt acceptances/rejections are tracked  
✅ **Optional Authentication**: Users can create accounts (coming soon)  
✅ **Reading History**: Users can view their past readings (coming soon)  

## Troubleshooting

### "Failed to save reading to database"
- Check that your Supabase credentials are correct in `.env.local`
- Verify the database schema was run successfully
- Check the Supabase logs in the dashboard

### "No content in OpenAI response"
- Verify your OpenAI API key is correct
- Check your OpenAI account has credits

### RLS Policy Errors
- Make sure you ran the complete `schema.sql` file
- Check that RLS policies are enabled in Supabase dashboard

## Next Steps

- Enable Supabase Auth for user accounts
- Build reading history page
- Add user profile management
- Implement email notifications for journal prompts
