#!/bin/bash
cd /e/Playground/workHQ

export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --env-filter '
COMMIT_NUM=$(git rev-list HEAD | grep -n "^$GIT_COMMIT$" | cut -d: -f1)
MEMBER_IDX=$(((($COMMIT_NUM - 1) % 5)))

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

echo ""
echo "✓ Author rewrite complete!"
echo ""
echo "Checking results..."
git log --format="%h - %an <%ae> - %s" -20
echo ""
echo "Commit distribution:"
git shortlog -sn --all
