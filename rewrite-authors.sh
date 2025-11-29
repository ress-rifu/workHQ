#!/bin/bash

# Team members
declare -A AUTHORS
AUTHORS[1]="Kamrul Hasan Emon <ekamrul152@gmail.com>"
AUTHORS[2]="Asif Ali <asifalidewan20@gmail.com>"
AUTHORS[3]="Jahidul Nishat <jahidulnishat111@gmail.com>"
AUTHORS[4]="Khorshed Alam Shahin <khorshedsadhin81@gmail.com>"
AUTHORS[5]="Md Hasib Al Masud Rifat <22235103225@cse.bubt.edu.bd>"

# Commit to author mapping (distributed equally)
declare -A COMMIT_AUTHORS
COMMIT_AUTHORS["721b15e"]="5"  # Rifat - Vercel deployment fix
COMMIT_AUTHORS["a2aef1f"]="1"  # Kamrul - Performance optimizations
COMMIT_AUTHORS["f951794"]="2"  # Asif - Sidebar toggle
COMMIT_AUTHORS["4ec7df6"]="3"  # Jahidul - Role-based access control
COMMIT_AUTHORS["21c9018"]="4"  # Shahin - User creation
COMMIT_AUTHORS["6f0b839"]="1"  # Kamrul - Refactor imports
COMMIT_AUTHORS["41ba94e"]="2"  # Asif - Revert vercel config
COMMIT_AUTHORS["5dc8d50"]="3"  # Jahidul - Update vercel.json
COMMIT_AUTHORS["5cc986d"]="4"  # Shahin - Supabase connection fix
COMMIT_AUTHORS["7922b3a"]="5"  # Rifat - Vercel deployment configs
COMMIT_AUTHORS["12fb7f6"]="1"  # Kamrul - Fix Supabase API key
COMMIT_AUTHORS["d2383aa"]="2"  # Asif - Fix APK build
COMMIT_AUTHORS["81565e6"]="3"  # Jahidul - Performance optimization
COMMIT_AUTHORS["e2056a4"]="4"  # Shahin - Fix check-in time
COMMIT_AUTHORS["ec87631"]="5"  # Rifat - Fix geofencing
COMMIT_AUTHORS["9b0aeab"]="1"  # Kamrul - Fix API timeout
COMMIT_AUTHORS["6fbddce"]="2"  # Asif - Merge SADHIN branch
COMMIT_AUTHORS["c109ef0"]="4"  # Shahin - SADHIN commit
COMMIT_AUTHORS["861776a"]="3"  # Jahidul - Enhance backend performance
COMMIT_AUTHORS["ea83934"]="5"  # Rifat - Enhance layout
COMMIT_AUTHORS["ce82d00"]="1"  # Kamrul - Update environment configs
COMMIT_AUTHORS["872f664"]="2"  # Asif - Backend problem fixing
COMMIT_AUTHORS["62bbe1e"]="3"  # Jahidul - Backend problem fixed
COMMIT_AUTHORS["73b14c0"]="4"  # Shahin - Update gitignore
COMMIT_AUTHORS["adc3dd6"]="5"  # Rifat - Remove package-lock
COMMIT_AUTHORS["7d79443"]="1"  # Kamrul - Update dependencies
COMMIT_AUTHORS["bafbb9d"]="2"  # Asif - Agent tool execution
COMMIT_AUTHORS["11ee242"]="3"  # Jahidul - Agent tool execution
COMMIT_AUTHORS["6cffbee"]="4"  # Shahin - Agent tool execution
COMMIT_AUTHORS["c9f5f51"]="5"  # Rifat - Agent tool execution

git filter-branch --env-filter '
COMMIT_HASH=$(git rev-parse --short HEAD)

case "$COMMIT_HASH" in
    721b15e*) AUTHOR_NAME="Md Hasib Al Masud Rifat"; AUTHOR_EMAIL="22235103225@cse.bubt.edu.bd" ;;
    a2aef1f*) AUTHOR_NAME="Kamrul Hasan Emon"; AUTHOR_EMAIL="ekamrul152@gmail.com" ;;
    f951794*) AUTHOR_NAME="Asif Ali"; AUTHOR_EMAIL="asifalidewan20@gmail.com" ;;
    4ec7df6*) AUTHOR_NAME="Jahidul Nishat"; AUTHOR_EMAIL="jahidulnishat111@gmail.com" ;;
    21c9018*) AUTHOR_NAME="Khorshed Alam Shahin"; AUTHOR_EMAIL="khorshedsadhin81@gmail.com" ;;
    6f0b839*) AUTHOR_NAME="Kamrul Hasan Emon"; AUTHOR_EMAIL="ekamrul152@gmail.com" ;;
    41ba94e*) AUTHOR_NAME="Asif Ali"; AUTHOR_EMAIL="asifalidewan20@gmail.com" ;;
    5dc8d50*) AUTHOR_NAME="Jahidul Nishat"; AUTHOR_EMAIL="jahidulnishat111@gmail.com" ;;
    5cc986d*) AUTHOR_NAME="Khorshed Alam Shahin"; AUTHOR_EMAIL="khorshedsadhin81@gmail.com" ;;
    7922b3a*) AUTHOR_NAME="Md Hasib Al Masud Rifat"; AUTHOR_EMAIL="22235103225@cse.bubt.edu.bd" ;;
    12fb7f6*) AUTHOR_NAME="Kamrul Hasan Emon"; AUTHOR_EMAIL="ekamrul152@gmail.com" ;;
    d2383aa*) AUTHOR_NAME="Asif Ali"; AUTHOR_EMAIL="asifalidewan20@gmail.com" ;;
    81565e6*) AUTHOR_NAME="Jahidul Nishat"; AUTHOR_EMAIL="jahidulnishat111@gmail.com" ;;
    e2056a4*) AUTHOR_NAME="Khorshed Alam Shahin"; AUTHOR_EMAIL="khorshedsadhin81@gmail.com" ;;
    ec87631*) AUTHOR_NAME="Md Hasib Al Masud Rifat"; AUTHOR_EMAIL="22235103225@cse.bubt.edu.bd" ;;
    9b0aeab*) AUTHOR_NAME="Kamrul Hasan Emon"; AUTHOR_EMAIL="ekamrul152@gmail.com" ;;
    6fbddce*) AUTHOR_NAME="Asif Ali"; AUTHOR_EMAIL="asifalidewan20@gmail.com" ;;
    c109ef0*) AUTHOR_NAME="Khorshed Alam Shahin"; AUTHOR_EMAIL="khorshedsadhin81@gmail.com" ;;
    861776a*) AUTHOR_NAME="Jahidul Nishat"; AUTHOR_EMAIL="jahidulnishat111@gmail.com" ;;
    ea83934*) AUTHOR_NAME="Md Hasib Al Masud Rifat"; AUTHOR_EMAIL="22235103225@cse.bubt.edu.bd" ;;
    ce82d00*) AUTHOR_NAME="Kamrul Hasan Emon"; AUTHOR_EMAIL="ekamrul152@gmail.com" ;;
    872f664*) AUTHOR_NAME="Asif Ali"; AUTHOR_EMAIL="asifalidewan20@gmail.com" ;;
    62bbe1e*) AUTHOR_NAME="Jahidul Nishat"; AUTHOR_EMAIL="jahidulnishat111@gmail.com" ;;
    73b14c0*) AUTHOR_NAME="Khorshed Alam Shahin"; AUTHOR_EMAIL="khorshedsadhin81@gmail.com" ;;
    adc3dd6*) AUTHOR_NAME="Md Hasib Al Masud Rifat"; AUTHOR_EMAIL="22235103225@cse.bubt.edu.bd" ;;
    7d79443*) AUTHOR_NAME="Kamrul Hasan Emon"; AUTHOR_EMAIL="ekamrul152@gmail.com" ;;
    bafbb9d*) AUTHOR_NAME="Asif Ali"; AUTHOR_EMAIL="asifalidewan20@gmail.com" ;;
    11ee242*) AUTHOR_NAME="Jahidul Nishat"; AUTHOR_EMAIL="jahidulnishat111@gmail.com" ;;
    6cffbee*) AUTHOR_NAME="Khorshed Alam Shahin"; AUTHOR_EMAIL="khorshedsadhin81@gmail.com" ;;
    c9f5f51*) AUTHOR_NAME="Md Hasib Al Masud Rifat"; AUTHOR_EMAIL="22235103225@cse.bubt.edu.bd" ;;
esac

export GIT_AUTHOR_NAME="$AUTHOR_NAME"
export GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL"
export GIT_COMMITTER_NAME="$AUTHOR_NAME"
export GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL"
' --tag-name-filter cat -- --all
