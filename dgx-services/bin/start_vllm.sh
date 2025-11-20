#!/usr/bin/env bash
set -e
MODEL="deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"
PORT=8000

# vLLM needs shared memory (ipc=host) to work well with PyTorch
# Added --gpu-memory-utilization 0.9 to ensure it doesn't try to grab 100% and fail
exec docker run --rm --gpus all \
  --ipc=host \
  -p $PORT:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:latest \
  --model $MODEL \
  --port 8000 \
  --gpu-memory-utilization 0.9 \
  --max-model-len 8192
