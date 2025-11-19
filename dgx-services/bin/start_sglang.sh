#!/usr/bin/env bash
set -e
MODEL="qwen/Qwen2.5-14B-Instruct"
PORT=30000

# Use Docker for SGLang
exec docker run --rm --gpus all \
  --ipc=host \
  -p $PORT:30000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  lmsysorg/sglang:latest \
  python3 -m sglang.launch_server --model-path $MODEL --port 30000 --host 0.0.0.0
