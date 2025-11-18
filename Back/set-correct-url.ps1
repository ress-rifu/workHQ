# Official Supabase Connection Pooler URL
$dbUrl = "postgresql://postgres.rdkgfezrowfnlrbtiekn:zptVbRfX0oAunTQj@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
Write-Output $dbUrl | vercel env add DATABASE_URL production
Write-Output $dbUrl | vercel env add DATABASE_URL preview
Write-Output $dbUrl | vercel env add DATABASE_URL development

