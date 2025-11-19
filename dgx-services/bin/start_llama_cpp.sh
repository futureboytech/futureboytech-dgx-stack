#!/usr/bin/env bash
set -e
MODEL="/opt/models/Kimi-K2-Thinking-80B.gguf"
PORT=8080
exec llama.cpp-server -m $MODEL -c 8192 -ngl 99 --port $PORT
