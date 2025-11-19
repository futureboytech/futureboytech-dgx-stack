#!/usr/bin/env bash
set -e
MODEL="deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"
PORT=8000
exec docker run --rm --gpus all -p $PORT:8000   -v ~/.cache/huggingface:/root/.cache/huggingface   vllm/vllm-openai:latest   --model $MODEL --port 8000
