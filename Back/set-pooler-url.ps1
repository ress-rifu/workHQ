# Supabase Connection Pooler URL for Serverless
# Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
$poolerUrl = "postgresql://postgres.rdkgfezrowfnlrbtiekn:zptVbRfX0oAunTQj@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
Write-Output $poolerUrl | vercel env add DATABASE_URL production
Write-Output $poolerUrl | vercel env add DATABASE_URL preview  
Write-Output $poolerUrl | vercel env add DATABASE_URL development

