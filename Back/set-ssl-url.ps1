# Alternative Supabase Connection Pooler (Transaction mode with pgbouncer)
$dbUrl = "postgresql://postgres:zptVbRfX0oAunTQj@db.rdkgfezrowfnlrbtiekn.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
Write-Output $dbUrl | vercel env add DATABASE_URL production
Write-Output $dbUrl | vercel env add DATABASE_URL preview
Write-Output $dbUrl | vercel env add DATABASE_URL development

