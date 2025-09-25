#!/bin/bash

# Setup script for Nursing Feedback AI Chatbot Backend
# Run this script to set up the development environment

echo "Setting up Nursing Feedback AI Chatbot Backend..."

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Linux/Mac
    source venv/bin/activate
fi

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create data directory for ChromaDB
echo "Creating data directory..."
mkdir -p data/chroma_db

# Copy environment template
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file and add your OpenAI API key!"
else
    echo ".env file already exists"
fi

echo ""
echo "Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your OpenAI API key"
echo "2. Activate virtual environment: source venv/bin/activate (Linux/Mac) or venv\\Scripts\\activate (Windows)"
echo "3. Run the application: python main.py"
echo "4. Visit http://localhost:8000/docs for API documentation"
echo ""