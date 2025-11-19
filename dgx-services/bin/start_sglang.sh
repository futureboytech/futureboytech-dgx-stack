#!/usr/bin/env bash
set -e
MODEL="qwen/Qwen2.5-14B-Instruct"
PORT=30000
exec sglang-server --model $MODEL --port $PORT
