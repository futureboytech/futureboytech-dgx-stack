#!/usr/bin/env bash
set -e
# Expects model at /opt/models/Kimi-K2-Thinking-80B.gguf on host
MODEL_FILE="Kimi-K2-Thinking-80B.gguf"
PORT=8080

exec docker run --rm --gpus all \
  -p $PORT:8080 \
  -v /opt/models:/models \
  ghcr.io/ggerganov/llama.cpp:server-cuda \
  -m /models/$MODEL_FILE -c 8192 -ngl 99 --host 0.0.0.0 --port 8080
