#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="futureboytech-dgx-stack"
GH_USER="futureboytech"

gh auth status || gh auth login

if [ ! -d .git ]; then
  git init
  git branch -m main
fi

git add .
git commit -m "Initial commit" || true

if gh repo view "$GH_USER/$REPO_NAME" >/dev/null 2>&1; then
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
else
  gh repo create "$GH_USER/$REPO_NAME" --public --source=. --remote=origin
fi

git push -u origin main
