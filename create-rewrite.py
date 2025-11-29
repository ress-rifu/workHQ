import subprocess
import os

# Define team members
team = [
    ("Kamrul Hasan Emon", "ekamrul152@gmail.com"),
    ("Asif Ali", "asifalidewan20@gmail.com"),
    ("Jahidul Nishat", "jahidulnishat111@gmail.com"),
    ("Khorshed Alam Shahin", "khorshedsadhin81@gmail.com"),
    ("Md Hasib Al Masud Rifat", "22235103225@cse.bubt.edu.bd"),
]

# Get all commits
result = subprocess.run(
    ["git", "rev-list", "--all", "--reverse"],
    capture_output=True,
    text=True,
    cwd="e:/Playground/workHQ"
)

commit_hashes = result.stdout.strip().split('\n')
print(f"Processing {len(commit_hashes)} commits...")

# Create the rewrite script
with open("e:/Playground/workHQ/rewrite.sh", "w", newline='\n') as f:
    f.write("#!/bin/bash\n\n")
    f.write("cd /e/Playground/workHQ\n\n")
    
    for i, commit_hash in enumerate(commit_hashes):
        member_idx = i % len(team)
        name, email = team[member_idx]
        
        f.write(f"# Commit {i+1}/{len(commit_hashes)}: {commit_hash[:7]} -> {name}\n")
        f.write(f'if [ "$GIT_COMMIT" = "{commit_hash}" ]; then\n')
        f.write(f'  export GIT_AUTHOR_NAME="{name}"\n')
        f.write(f'  export GIT_AUTHOR_EMAIL="{email}"\n')
        f.write(f'  export GIT_COMMITTER_NAME="{name}"\n')
        f.write(f'  export GIT_COMMITTER_EMAIL="{email}"\n')
        f.write('fi\n\n')

print("✓ Created rewrite.sh")
print("\nNow run:")
print('  cd e:/Playground/workHQ')
print('  git filter-branch -f --env-filter "source rewrite.sh" -- --all')
print('  git push --force --all origin')
