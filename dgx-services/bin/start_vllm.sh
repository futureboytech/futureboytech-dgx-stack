#!/usr/bin/env bash
set -e
MODEL="deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"
PORT=8000

# Workarounds for NVIDIA GB10 (Blackwell) / sm_121a support
# Disable Triton Flash Attention and Torch Compile to avoid PTXAS errors
export VLLM_USE_TRITON_FLASH_ATTN=0
export VLLM_TORCH_COMPILE_LEVEL=0

exec docker run --rm --gpus all \
  --ipc=host \
  -e VLLM_USE_TRITON_FLASH_ATTN=0 \
  -e VLLM_TORCH_COMPILE_LEVEL=0 \
  -p $PORT:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:latest \
  --model $MODEL \
  --port 8000 \
  --gpu-memory-utilization 0.9 \
  --max-model-len 8192 \
  --enforce-eager
