#!/bin/bash

echo "====================================="
echo "Downloading All LLM Models"
echo "====================================="

# Create model folders if not exist
mkdir -p models/tiny
mkdir -p models/phi
mkdir -p models/qwen
mkdir -p models/mistral
mkdir -p models/gemma

# ---------------------------------------
# TinyLlama
# ---------------------------------------
echo "Downloading TinyLlama..."
huggingface-cli download TinyLlama/TinyLlama-1.1B-Chat-v1.0 \
  --local-dir models/tiny \
  --local-dir-use-symlinks False

# ---------------------------------------
# Phi-3 Mini
# ---------------------------------------
echo "Downloading Phi-3 Mini..."
huggingface-cli download microsoft/Phi-3-mini-4k-instruct \
  --local-dir models/phi \
  --local-dir-use-symlinks False

# ---------------------------------------
# Qwen 2.5 3B Instruct
# ---------------------------------------
echo "Downloading Qwen 2.5 3B..."
huggingface-cli download Qwen/Qwen2.5-3B-Instruct \
  --local-dir models/qwen \
  --local-dir-use-symlinks False

# ---------------------------------------
# Mistral 7B Instruct
# ---------------------------------------
echo "Downloading Mistral 7B..."
huggingface-cli download mistralai/Mistral-7B-Instruct-v0.2 \
  --local-dir models/mistral \
  --local-dir-use-symlinks False

# ---------------------------------------
# Gemma 2B Instruct
# ---------------------------------------
echo "Downloading Gemma 2B..."
huggingface-cli download google/gemma-2b-it \
  --local-dir models/gemma \
  --local-dir-use-symlinks False

echo "====================================="
echo "All models downloaded successfully ✅"
echo "====================================="