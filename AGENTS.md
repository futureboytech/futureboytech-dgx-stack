# Repository Guidelines

## Project Structure & Module Organization
- `scripts/` holds operational helpers: `install_server.sh`, `restart-all.sh`, `gpu-dashboard.sh`, and `health-probe.sh`; run from repo root on the appropriate host (DGX or client) per script notes.
- `dgx-services/bin` contains runtime startup scripts; `dgx-services/systemd` has unit files meant for `/etc/systemd/system`.
- `.opencode/tool/` houses the Node.js router/backends used by OpenCode; CommonJS modules rely on the native `http` library.
- `configs/nginx-proxy.conf` is a starter HTTPS gateway template; adjust hosts/ports before deployment.
- `.github/workflows/` currently contains stubs for CI and release; extend with lint/test jobs alongside code changes.

## Build, Test, and Development Commands
- `./scripts/install_server.sh` (DGX, sudo) provisions `/opt/dgx_stack`, installs systemd units, and pulls container images.
- `./setup_dgx_stack.sh mac|omarchy` sets local SSH aliases and helpers for clients.
- `./scripts/restart-all.sh` restarts `vllm`, `sglang`, `llama_cpp`, and `ollama` services.
- `./scripts/health-probe.sh` curls `http://localhost:8000/health` for a quick vLLM liveness check.
- `./scripts/gpu-dashboard.sh` streams `nvidia-smi` for live GPU visibility.

## Coding Style & Naming Conventions
- Shell: start with `#!/usr/bin/env bash`, prefer `set -euo pipefail`, and keep indentation consistent (2–4 spaces). Use kebab-case for script names.
- Node tools: CommonJS `require`, 4-space indents, double quotes, and no external deps; validate inputs and prefix logs with `[DEBUG ...]`.
- Configs: keep port mappings aligned with service scripts; document overrides inline.

## Testing Guidelines
- No automated suite yet; add targeted smoke checks when touching tooling.
- After runtime changes: run `./scripts/restart-all.sh`, then `./scripts/health-probe.sh`, and issue a sample router prompt (e.g., "ping") via OpenCode or curl to confirm routing.
- For systemd edits: `sudo systemctl daemon-reload` then `sudo systemctl status <service>` to verify state.

## Commit & Pull Request Guidelines
- Use conventional commits as in history (`feat:`, `chore:`, `refactor:`); imperative mood and concise scope.
- PRs should include a summary, affected services/scripts, and verification steps (commands plus observed output). Add screenshots only for dashboard/log changes.
- Avoid committing secrets or host-specific IPs; keep Tailscale and API keys in local env vars.
