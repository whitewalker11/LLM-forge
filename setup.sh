#!/bin/bash

echo "========================================="
echo "Setting up LLM Platform Environment"
echo "========================================="

# -------------------------------
# Check Python
# -------------------------------
if ! command -v python3 &> /dev/null
then
    echo "Python3 is required but not installed."
    exit
fi

echo "Python3 found"

# -------------------------------
# Create Virtual Environment
# -------------------------------
echo "Creating Python virtual environment..."

python3 -m venv venv

source venv/bin/activate

echo "Virtual environment activated"

# -------------------------------
# Upgrade pip
# -------------------------------
pip install --upgrade pip

# -------------------------------
# Install Backend Dependencies
# -------------------------------
echo "Installing backend dependencies..."

pip install \
fastapi \
uvicorn \
transformers \
torch \
accelerate \
sentencepiece \
protobuf \
tiktoken \
huggingface_hub \
faiss-cpu \
python-multipart

echo "Backend dependencies installed"

# -------------------------------
# Create Model Folders
# -------------------------------
echo "Creating model directories..."

mkdir -p models/tiny
mkdir -p models/phi
mkdir -p models/qwen
mkdir -p models/mistral
mkdir -p models/gemma

# -------------------------------
# Install Node for React
# -------------------------------
if command -v npm &> /dev/null
then
    echo "Node already installed"
else
    echo "⚠ Node.js not found. Please install Node.js (v18+) manually."
fi

# -------------------------------
# Install Frontend Dependencies
# -------------------------------
if [ -d "frontend" ]; then
    echo "Installing frontend packages..."

    cd frontend
    npm install
    cd ..

    echo "Frontend installed"
else
    echo "Frontend folder not found. Skipping..."
fi

# -------------------------------
# Install HuggingFace CLI
# -------------------------------
pip install huggingface_hub

echo ""
echo "Login to HuggingFace to download models"
echo "Run: huggingface-cli login"
echo ""

echo "========================================="
echo "Environment setup complete ✅"
echo "========================================="
