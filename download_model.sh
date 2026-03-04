#!/bin/bash

echo "======================================="
echo "🚀 LLM Platform Model Downloader"
echo "======================================="

# Create models directory if not exists
mkdir -p models/tiny
mkdir -p models/phi

# Check huggingface-cli
if ! command -v huggingface-cli &> /dev/null
then
    echo "Installing huggingface_hub..."
    pip install huggingface_hub
fi

echo ""
echo "⚠️  Make sure you are logged into HuggingFace"
echo "If not, run: huggingface-cli login"
echo ""

read -p "Press Enter to continue..."

# ----------------------------------------
# Download TinyLlama
# ----------------------------------------
echo ""
echo "⬇️ Downloading TinyLlama 1.1B..."

huggingface-cli download TinyLlama/TinyLlama-1.1B-Chat-v1.0 \
  --local-dir models/tiny \
  --local-dir-use-symlinks False

echo "✅ TinyLlama downloaded"
echo ""

# ----------------------------------------
# Download Phi-3 Mini
# ----------------------------------------
echo "⬇️ Downloading Phi-3 Mini..."

huggingface-cli download microsoft/Phi-3-mini-4k-instruct \
  --local-dir models/phi \
  --local-dir-use-symlinks False

echo "✅ Phi-3 Mini downloaded"
echo ""

echo "======================================="
echo "🎉 All models downloaded successfully!"
echo "======================================="