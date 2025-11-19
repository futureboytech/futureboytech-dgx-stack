#!/usr/bin/env bash
# Client-side setup script for DGX Stack

TARGET=$1

if [ -z "$TARGET" ]; then
  echo "Usage: $0 [mac|omarchy]"
  exit 1
fi

echo "🔧 Setting up DGX Client for $TARGET..."

# Common setup
# (e.g. copying OpenCode tools if we were doing that automatically)

if [ "$TARGET" == "mac" ]; then
  echo "🍎 Configuring for macOS..."
  # Add alias to zshrc if not present
  if ! grep -q "alias dgx-connect" ~/.zshrc; then
    echo "alias dgx-connect='ssh -L 18000:localhost:8000 -L 33000:localhost:30000 -L 18080:localhost:8080 -L 11435:localhost:11434 dgx'" >> ~/.zshrc
    echo "✅ Added dgx-connect alias to ~/.zshrc"
  else
    echo "ℹ️ dgx-connect alias already exists. Please verify ports manually if needed."
  fi

elif [ "$TARGET" == "omarchy" ]; then
  echo "🐧 Configuring for Omarchy/Linux..."
  # Add alias to bashrc/zshrc
  RC_FILE=~/.bashrc
  [ -f ~/.zshrc ] && RC_FILE=~/.zshrc
  
  if ! grep -q "alias dgx-connect" "$RC_FILE"; then
    echo "alias dgx-connect='ssh -L 18000:localhost:8000 -L 33000:localhost:30000 -L 18080:localhost:8080 -L 11435:localhost:11434 dgx'" >> "$RC_FILE"
    echo "✅ Added dgx-connect alias to $RC_FILE"
  else
    echo "ℹ️ dgx-connect alias already exists. Please verify ports manually if needed."
  fi

else
  echo "❌ Unknown target: $TARGET"
  exit 1
fi

echo "🎉 Setup complete! Open a new shell to use 'dgx-connect'."
