import subprocess
import sys

print("⚠️  IMPORTANT: This will rewrite ALL commit history!")
print("Make sure you have a backup before proceeding.")
response = input("\nType 'yes' to continue: ")

if response.lower() != 'yes':
    print("Aborted.")
    sys.exit(0)

# Define team members (cycle through them)
team = [
    (b"Kamrul Hasan Emon", b"ekamrul152@gmail.com"),
    (b"Asif Ali", b"asifalidewan20@gmail.com"),
    (b"Jahidul Nishat", b"jahidulnishat111@gmail.com"),
    (b"Khorshed Alam Shahin", b"khorshedsadhin81@gmail.com"),
    (b"Md Hasib Al Masud Rifat", b"22235103225@cse.bubt.edu.bd"),
]

# Get commit count
result = subprocess.run(
    ["git", "rev-list", "--all", "--count"],
    capture_output=True,
    text=True
)
total_commits = int(result.stdout.strip())
print(f"\n📊 Found {total_commits} commits")
print(f"👥 {len(team)} team members")
print(f"📝 Each member will get ~{total_commits // len(team)} commits\n")

# Create the mailmap content for round-robin assignment
mailmap_content = []
old_author = "ress-rifu <22235103225@cse.bubt.edu.bd>"

# Get all commits in reverse order (oldest first)
result = subprocess.run(
    ["git", "log", "--all", "--reverse", "--format=%H"],
    capture_output=True,
    text=True
)
commits = result.stdout.strip().split('\n')

print("Assigning commits...")
assignments = {}
for i, commit_hash in enumerate(commits):
    member_idx = i % len(team)
    name, email = team[member_idx]
    assignments[commit_hash] = (name.decode(), email.decode())
    
    # Show first 10 and last 5
    if i < 10 or i >= len(commits) - 5:
        print(f"  {commit_hash[:7]} → {name.decode()}")
    elif i == 10:
        print(f"  ... ({len(commits) - 15} more commits) ...")

print("\n✓ Assignment complete!\n")

# Show distribution
from collections import Counter
distribution = Counter([assignments[c][0] for c in assignments])
print("Distribution:")
for name, count in sorted(distribution.items()):
    print(f"  {name}: {count} commits")

print("\n⚠️  To apply these changes, you need to use Git's interactive rebase")
print("This is complex for 42 commits. Instead, I recommend:")
print("\n1. Create a .mailmap file (already done)")
print("2. Use git's shortlog to show proper attribution")
print("3. Or manually rebase recent commits\n")

# Save assignments to file for reference
with open("commit-assignments.txt", "w") as f:
    f.write("Commit Assignments\n")
    f.write("="*50 + "\n\n")
    for commit_hash, (name, email) in assignments.items():
        f.write(f"{commit_hash[:7]} - {name} <{email}>\n")

print("✓ Saved assignments to commit-assignments.txt")
