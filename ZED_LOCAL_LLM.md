# Wire Zed to DGX Spark LLMs (OpenAI-Compatible)

## Prereqs
- Local tunnel up: `dgx-connect` (forwards 18000=vLLM, 33000=SGLang, 18080=llama.cpp, 11435=Ollama).
- Services running on DGX (`docker ps` there should show vLLM/Ollama and optionally SGLang/llama.cpp).
- Health checks reachable from your workstation (examples below).

## Endpoints & Models
- vLLM: `http://localhost:18000/v1` — model `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`
- SGLang (if running): `http://localhost:33000/v1` — choose your deployed model
- Ollama OpenAI bridge: `http://localhost:11435/v1` — models from `curl http://localhost:11435/api/tags`

## Set a Key for Zed
Zed expects a key; use an env var (dummy is fine locally):
```bash
export ZED_AI_KEY="local-llm"
```
Add this to your shell rc to persist.

## Configure Zed
Edit `~/.config/zed/settings.json` and add a provider. Example for vLLM:
```json
{
  "assistant": {
    "providers": [
      {
        "id": "local-vllm",
        "type": "openai",
        "api_url": "http://localhost:18000/v1",
        "api_key": "env:ZED_AI_KEY",
        "default_model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"
      }
    ],
    "default_provider": "local-vllm"
  }
}
```
Add additional providers for SGLang or Ollama by appending to `providers` and switch via Zed’s AI palette.

## Validate
- Confirm tunnel listeners: `ss -ltn '( sport = :18000 or sport = :11435 )'`
- vLLM health: `curl http://localhost:18000/health`
- Ollama models: `curl http://localhost:11435/api/tags`
- Restart Zed, open the Assistant, send "ping"; expect a response from the configured model.

## Tips
- If you see connection errors, run `dgx-kill-tunnel` then `dgx-connect` to refresh forwards.
- For remote models with different names, only the `default_model` needs updating; keep `api_url` pointed at the chosen service.
- Use small test prompts first to confirm latency and routing before long runs.
