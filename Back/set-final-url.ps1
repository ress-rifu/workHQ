# Correct Supabase Pooler URL (Session Mode for Prisma compatibility)
# Using the official AWS pooler URL with port 5432 for session mode
$dbUrl = "postgresql://postgres.rdkgfezrowfnlrbtiekn:zptVbRfX0oAunTQj@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
Write-Output $dbUrl | vercel env add DATABASE_URL production
Write-Output $dbUrl | vercel env add DATABASE_URL preview
Write-Output $dbUrl | vercel env add DATABASE_URL development

