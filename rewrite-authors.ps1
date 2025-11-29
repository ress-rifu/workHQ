# PowerShell script to rewrite git commit authors
# This will distribute commits equally among team members

$commits = @{
    "721b15e" = @{Name="Md Hasib Al Masud Rifat"; Email="22235103225@cse.bubt.edu.bd"}
    "a2aef1f" = @{Name="Kamrul Hasan Emon"; Email="ekamrul152@gmail.com"}
    "f951794" = @{Name="Asif Ali"; Email="asifalidewan20@gmail.com"}
    "4ec7df6" = @{Name="Jahidul Nishat"; Email="jahidulnishat111@gmail.com"}
    "21c9018" = @{Name="Khorshed Alam Shahin"; Email="khorshedsadhin81@gmail.com"}
    "6f0b839" = @{Name="Kamrul Hasan Emon"; Email="ekamrul152@gmail.com"}
    "41ba94e" = @{Name="Asif Ali"; Email="asifalidewan20@gmail.com"}
    "5dc8d50" = @{Name="Jahidul Nishat"; Email="jahidulnishat111@gmail.com"}
    "5cc986d" = @{Name="Khorshed Alam Shahin"; Email="khorshedsadhin81@gmail.com"}
    "7922b3a" = @{Name="Md Hasib Al Masud Rifat"; Email="22235103225@cse.bubt.edu.bd"}
    "12fb7f6" = @{Name="Kamrul Hasan Emon"; Email="ekamrul152@gmail.com"}
    "d2383aa" = @{Name="Asif Ali"; Email="asifalidewan20@gmail.com"}
    "81565e6" = @{Name="Jahidul Nishat"; Email="jahidulnishat111@gmail.com"}
    "e2056a4" = @{Name="Khorshed Alam Shahin"; Email="khorshedsadhin81@gmail.com"}
    "ec87631" = @{Name="Md Hasib Al Masud Rifat"; Email="22235103225@cse.bubt.edu.bd"}
    "9b0aeab" = @{Name="Kamrul Hasan Emon"; Email="ekamrul152@gmail.com"}
    "6fbddce" = @{Name="Asif Ali"; Email="asifalidewan20@gmail.com"}
    "c109ef0" = @{Name="Khorshed Alam Shahin"; Email="khorshedsadhin81@gmail.com"}
    "861776a" = @{Name="Jahidul Nishat"; Email="jahidulnishat111@gmail.com"}
    "ea83934" = @{Name="Md Hasib Al Masud Rifat"; Email="22235103225@cse.bubt.edu.bd"}
    "ce82d00" = @{Name="Kamrul Hasan Emon"; Email="ekamrul152@gmail.com"}
    "872f664" = @{Name="Asif Ali"; Email="asifalidewan20@gmail.com"}
    "62bbe1e" = @{Name="Jahidul Nishat"; Email="jahidulnishat111@gmail.com"}
    "73b14c0" = @{Name="Khorshed Alam Shahin"; Email="khorshedsadhin81@gmail.com"}
    "adc3dd6" = @{Name="Md Hasib Al Masud Rifat"; Email="22235103225@cse.bubt.edu.bd"}
    "7d79443" = @{Name="Kamrul Hasan Emon"; Email="ekamrul152@gmail.com"}
    "bafbb9d" = @{Name="Asif Ali"; Email="asifalidewan20@gmail.com"}
    "11ee242" = @{Name="Jahidul Nishat"; Email="jahidulnishat111@gmail.com"}
    "6cffbee" = @{Name="Khorshed Alam Shahin"; Email="khorshedsadhin81@gmail.com"}
    "c9f5f51" = @{Name="Md Hasib Al Masud Rifat"; Email="22235103225@cse.bubt.edu.bd"}
}

Write-Host "This will rewrite git history. Make sure you have a backup!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to cancel or Enter to continue..."
Read-Host

# Build the filter script
$filterScript = @"
`$commitHash = git rev-parse --short HEAD

switch -Wildcard (`$commitHash) {
"@

foreach ($hash in $commits.Keys) {
    $name = $commits[$hash].Name
    $email = $commits[$hash].Email
    $filterScript += @"

    "$hash*" {
        `$env:GIT_AUTHOR_NAME = "$name"
        `$env:GIT_AUTHOR_EMAIL = "$email"
        `$env:GIT_COMMITTER_NAME = "$name"
        `$env:GIT_COMMITTER_EMAIL = "$email"
    }
"@
}

$filterScript += @"

}
"@

# Save the filter script
$filterScript | Out-File -FilePath "git-filter.ps1" -Encoding UTF8

Write-Host "Running git filter-branch..." -ForegroundColor Green

git filter-branch -f --env-filter "powershell -ExecutionPolicy Bypass -File git-filter.ps1" --tag-name-filter cat -- --all

Write-Host "Done! Commit authors have been updated." -ForegroundColor Green
Write-Host "To push force to remote: git push --force --all origin" -ForegroundColor Yellow

# Clean up
Remove-Item "git-filter.ps1" -ErrorAction SilentlyContinue
