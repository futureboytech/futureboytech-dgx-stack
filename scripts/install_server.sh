#!/usr/bin/env bash
set -e

echo "🚀 Starting DGX Server Installation..."

# 1. Create directories
echo "📂 Creating /opt/dgx_stack and /opt/models..."
sudo mkdir -p /opt/dgx_stack/bin
sudo mkdir -p /opt/dgx_stack/logs
sudo mkdir -p /opt/models
sudo chmod 777 /opt/models  # Allow easy copying of GGUF files

# 2. Install binaries/scripts
echo "📜 Installing startup scripts..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

sudo cp "$REPO_ROOT"/dgx-services/bin/* /opt/dgx_stack/bin/
sudo chmod +x /opt/dgx_stack/bin/*

# 3. Install systemd units
echo "⚙️ Installing systemd services..."
sudo cp "$REPO_ROOT"/dgx-services/systemd/*.service /etc/systemd/system/

# 4. Pull Docker Images
echo "🐳 Pulling Docker images (this may take a while)..."
echo "   - vLLM..."
sudo docker pull vllm/vllm-openai:latest
echo "   - SGLang..."
sudo docker pull lmsysorg/sglang:latest
echo "   - llama.cpp..."
sudo docker pull ghcr.io/ggerganov/llama.cpp:server-cuda
echo "   - Ollama..."
sudo docker pull ollama/ollama:latest

# 5. Reload and Enable
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

SERVICES=(vllm sglang llama_cpp ollama)
for service in "${SERVICES[@]}"; do
    echo "   - Enabling and starting $service.service..."
    sudo systemctl enable "$service.service"
    sudo systemctl restart "$service.service"
done

echo "✅ Installation Complete!"
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Download the Kimi-K2 GGUF model to /opt/models/Kimi-K2-Thinking-80B.gguf"
echo "2. Run 'docker exec -it ollama ollama pull llama3.1' (once the service is up) to get the Ollama model."
