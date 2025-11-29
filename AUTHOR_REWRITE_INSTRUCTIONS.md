# Git Author Rewrite Instructions

## ⚠️  WARNING
This will rewrite ALL commit history. Make sure:
1. Everyone has pushed their changes
2. You have a backup
3. All team members are aware this will happen

## Method 1: Using Git Bash (RECOMMENDED)

Open **Git Bash** (not PowerShell) and run:

```bash
cd /e/Playground/workHQ

# Backup first!
git branch backup-before-rewrite

# Set environment variable to suppress warning
export FILTER_BRANCH_SQUELCH_WARNING=1

# Run the filter
git filter-branch -f --env-filter '

COMMIT_NUM=$(git rev-list HEAD | grep -n "^$GIT_COMMIT$" | cut -d: -f1)
MEMBER_IDX=$((($COMMIT_NUM - 1) % 5))

case $MEMBER_IDX in
  0)
    export GIT_AUTHOR_NAME="Kamrul Hasan Emon"
    export GIT_AUTHOR_EMAIL="ekamrul152@gmail.com"
    export GIT_COMMITTER_NAME="Kamrul Hasan Emon"
    export GIT_COMMITTER_EMAIL="ekamrul152@gmail.com"
    ;;
  1)
    export GIT_AUTHOR_NAME="Asif Ali"
    export GIT_AUTHOR_EMAIL="asifalidewan20@gmail.com"
    export GIT_COMMITTER_NAME="Asif Ali"
    export GIT_COMMITTER_EMAIL="asifalidewan20@gmail.com"
    ;;
  2)
    export GIT_AUTHOR_NAME="Jahidul Nishat"
    export GIT_AUTHOR_EMAIL="jahidulnishat111@gmail.com"
    export GIT_COMMITTER_NAME="Jahidul Nishat"
    export GIT_COMMITTER_EMAIL="jahidulnishat111@gmail.com"
    ;;
  3)
    export GIT_AUTHOR_NAME="Khorshed Alam Shahin"
    export GIT_AUTHOR_EMAIL="khorshedsadhin81@gmail.com"
    export GIT_COMMITTER_NAME="Khorshed Alam Shahin"
    export GIT_COMMITTER_EMAIL="khorshedsadhin81@gmail.com"
    ;;
  4)
    export GIT_AUTHOR_NAME="Md Hasib Al Masud Rifat"
    export GIT_AUTHOR_EMAIL="22235103225@cse.bubt.edu.bd"
    export GIT_COMMITTER_NAME="Md Hasib Al Masud Rifat"
    export GIT_COMMITTER_EMAIL="22235103225@cse.bubt.edu.bd"
    ;;
esac

' -- --all

# Verify the changes
git log --format="%h - %an <%ae> - %s" -20

# If everything looks good, force push
git push --force --all origin
```

## Method 2: Clean Slate Approach (EASIER)

If the above doesn't work, create a fresh repository with proper authors:

```bash
# 1. Archive current work
cd /e/Playground/workHQ
git bundle create ../workhq-backup.bundle --all

# 2. Clone fresh
cd /e/Playground
git clone https://github.com/ress-rifu/workHQ workHQ-new

# 3. Manually re-commit with proper authors
# Have each team member commit their work with their own git config
```

## Verification

After rewriting, check the commit distribution:

```bash
git shortlog -sn --all
```

This should show all 5 team members with roughly equal commits.

## Notes

- The filter will cycle through team members in order
- Each gets ~8-9 commits out of 42 total
- Commit content stays the same, only author changes
- After force push, everyone must re-clone or reset their local copies
