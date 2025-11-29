import subprocess
import sys

# Team member distribution (rotating assignment)
team_members = [
    ("Kamrul Hasan Emon", "ekamrul152@gmail.com"),
    ("Asif Ali", "asifalidewan20@gmail.com"),
    ("Jahidul Nishat", "jahidulnishat111@gmail.com"),
    ("Khorshed Alam Shahin", "khorshedsadhin81@gmail.com"),
    ("Md Hasib Al Masud Rifat", "22235103225@cse.bubt.edu.bd"),
]

# Get all commits
result = subprocess.run(
    ["git", "log", "--format=%H|%s", "--all"],
    capture_output=True,
    text=True
)

commits = []
for line in result.stdout.strip().split('\n'):
    if '|' in line:
        hash_val, message = line.split('|', 1)
        commits.append((hash_val, message))

print(f"Found {len(commits)} commits")
print("\nAssigning commits to team members...")

# Assign commits in round-robin fashion
assignment = {}
for i, (commit_hash, message) in enumerate(commits):
    member_idx = i % len(team_members)
    name, email = team_members[member_idx]
    assignment[commit_hash] = (name, email)
    print(f"{commit_hash[:7]} -> {name}")

# Create bash script for filter-branch
script_lines = ['#!/bin/bash', '', 'case "$GIT_COMMIT" in']

for commit_hash, (name, email) in assignment.items():
    script_lines.append(f'  {commit_hash})')
    script_lines.append(f'    export GIT_AUTHOR_NAME="{name}"')
    script_lines.append(f'    export GIT_AUTHOR_EMAIL="{email}"')
    script_lines.append(f'    export GIT_COMMITTER_NAME="{name}"')
    script_lines.append(f'    export GIT_COMMITTER_EMAIL="{email}"')
    script_lines.append('    ;;')

script_lines.append('esac')

with open('git-filter-env.sh', 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(script_lines))

print("\n✓ Created git-filter-env.sh")
print("\nTo apply the changes, run:")
print("  git filter-branch -f --env-filter 'bash git-filter-env.sh' -- --all")
print("  git push --force --all origin")
print("\nWARNING: This will rewrite history. Make sure everyone is aware!")
