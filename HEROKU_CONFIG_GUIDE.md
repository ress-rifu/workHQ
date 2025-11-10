# Heroku Environment Configuration Guide

## Problem
Your Heroku backend can't validate Supabase tokens because the environment variables aren't configured.

## Solution: Set Heroku Environment Variables

You have 2 options:

### Option 1: Using Heroku Dashboard (Easiest)

1. Go to https://dashboard.heroku.com/apps/workhq-api-c0ff13762192
2. Click on **Settings** tab
3. Scroll to **Config Vars** section
4. Click **Reveal Config Vars**
5. Add the following variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://rdkgfezrowfnlrbtiekn.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `DATABASE_URL` | Your Supabase database connection string |
| `DIRECT_URL` | Your Supabase direct database URL (if using connection pooler) |
| `NODE_ENV` | `production` |

### Option 2: Using Heroku CLI

Run these commands in your terminal:

```bash
# Login to Heroku
heroku login

# Set environment variables
heroku config:set SUPABASE_URL="https://rdkgfezrowfnlrbtiekn.supabase.co" -a workhq-api-c0ff13762192

heroku config:set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here" -a workhq-api-c0ff13762192

heroku config:set DATABASE_URL="your-database-url-here" -a workhq-api-c0ff13762192

heroku config:set NODE_ENV="production" -a workhq-api-c0ff13762192

# Verify variables are set
heroku config -a workhq-api-c0ff13762192
```

## How to Get Your Credentials

### 1. Supabase Service Role Key
1. Go to https://supabase.com/dashboard/project/rdkgfezrowfnlrbtiekn
2. Click **Settings** (gear icon)
3. Click **API** in the sidebar
4. Copy the **service_role** key (under "Project API keys")
5. ⚠️ **IMPORTANT**: Keep this secret! Don't share it publicly.

### 2. Database URL
1. In Supabase dashboard, go to **Settings** > **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.rdkgfezrowfnlrbtiekn.supabase.co:5432/postgres`

### 3. Direct URL (Optional, for better performance)
1. Same as Database URL section
2. Select **Direct connection** instead of pooler
3. Usually on port 6543 instead of 5432

## After Setting Variables

The Heroku app will automatically restart. Wait about 30 seconds, then test again.

## Quick Test After Configuration

Run this command to test if it worked:

```bash
curl https://workhq-api-c0ff13762192.herokuapp.com/health
```

You should see:
```json
{
  "status": "OK",
  "message": "WorkHQ API is running",
  "timestamp": "..."
}
```

## Troubleshooting

If you still get authentication errors:

1. **Check if variables are set:**
   ```bash
   heroku config -a workhq-api-c0ff13762192
   ```

2. **Restart the app:**
   ```bash
   heroku restart -a workhq-api-c0ff13762192
   ```

3. **Check logs:**
   ```bash
   heroku logs --tail -a workhq-api-c0ff13762192
   ```

4. **Verify Supabase credentials are correct:**
   - Make sure you copied the **service_role** key, not the **anon** key
   - Check that the database URL has the correct password

## Security Notes

- ✅ Never commit `.env` files with real credentials to git
- ✅ Use Heroku config vars for sensitive data
- ✅ The service role key bypasses Row Level Security - keep it secret!
- ✅ Rotate keys if they're ever exposed

## Need Help?

If you encounter issues:
1. Check Heroku logs: `heroku logs --tail -a workhq-api-c0ff13762192`
2. Verify environment variables are set: `heroku config -a workhq-api-c0ff13762192`
3. Make sure your local `.env` has the correct values for testing

