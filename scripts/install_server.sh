#!/usr/bin/env bash
set -e

echo "🚀 Starting DGX Server Installation..."

# 1. Create directories
echo "📂 Creating /opt/dgx_stack..."
sudo mkdir -p /opt/dgx_stack/bin
sudo mkdir -p /opt/dgx_stack/logs

# 2. Install binaries/scripts
echo "📜 Installing startup scripts..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

sudo cp "$REPO_ROOT"/dgx-services/bin/* /opt/dgx_stack/bin/
sudo chmod +x /opt/dgx_stack/bin/*

# 3. Install systemd units
echo "⚙️ Installing systemd services..."
sudo cp "$REPO_ROOT"/dgx-services/systemd/*.service /etc/systemd/system/

# 4. Reload and Enable
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

SERVICES=(vllm sglang llama_cpp ollama)
for service in "${SERVICES[@]}"; do
    echo "   - Enabling and starting $service.service..."
    sudo systemctl enable "$service.service"
    sudo systemctl restart "$service.service"
done

echo "✅ Installation Complete!"
echo "   Check status with: systemctl status vllm sglang llama_cpp ollama"
