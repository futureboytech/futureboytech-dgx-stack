#!/usr/bin/env bash
set -euo pipefail

pattern="ssh -L 18000:localhost:8000"

if ! pgrep -f "$pattern" >/dev/null 2>&1; then
  echo "No dgx-connect tunnels found."
  exit 0
fi

pids=$(pgrep -f "$pattern" | tr '\n' ' ')
echo "Killing tunnels: $pids"
pkill -f "$pattern"
echo "Tunnels stopped."
