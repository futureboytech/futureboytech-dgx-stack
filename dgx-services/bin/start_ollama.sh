#!/usr/bin/env bash
set -e
PORT=11434

# Run Ollama in Docker
# We mount a volume for models so they persist
exec docker run --rm --gpus all \
  -p $PORT:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama:latest
