#!/usr/bin/env python3
"""
Quick setup script for the Nursing Feedback AI Chatbot
This script helps set up the development environment quickly
"""

import os
import sys
import subprocess
import platform

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during {description}")
        print(f"Command: {command}")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def setup_backend():
    """Set up the backend environment"""
    print("\n🏥 Setting up Nursing Feedback AI Chatbot Backend")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Change to backend directory
    os.chdir("backend")
    
    # Create virtual environment
    if not run_command("python -m venv venv", "Creating virtual environment"):
        return False
    
    # Activate virtual environment and install dependencies
    system = platform.system()
    if system == "Windows":
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\python -m pip"
    else:
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/python -m pip"
    
    # Upgrade pip
    if not run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install dependencies
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing Python dependencies"):
        return False
    
    # Create data directory
    os.makedirs("data/chroma_db", exist_ok=True)
    print("✅ Created data directory")
    
    # Copy environment file if it doesn't exist
    if not os.path.exists(".env"):
        if os.path.exists(".env.example"):
            import shutil
            shutil.copy(".env.example", ".env")
            print("✅ Created .env file from template")
        else:
            with open(".env", "w") as f:
                f.write("OPENAI_API_KEY=your_openai_api_key_here\n")
                f.write("CHROMA_DB_PATH=./data/chroma_db\n")
                f.write("LOG_LEVEL=INFO\n")
            print("✅ Created .env file")
    
    print("\n📝 Backend setup completed!")
    print("Next steps:")
    print("1. Edit .env file and add your OpenAI API key")
    print("2. Run: python main.py")
    print("3. Visit: http://localhost:8000/docs")
    
    return True

def test_setup():
    """Test if the setup was successful"""
    print("\n🧪 Testing setup...")
    
    # Check if virtual environment exists
    venv_path = "venv/Scripts/python" if platform.system() == "Windows" else "venv/bin/python"
    if not os.path.exists(venv_path):
        print("❌ Virtual environment not found")
        return False
    
    # Check if main dependencies are installed
    try:
        result = subprocess.run(
            [venv_path, "-c", "import fastapi, langchain, chromadb; print('Dependencies OK')"],
            capture_output=True, text=True, check=True
        )
        print("✅ Core dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Some dependencies are missing")
        return False
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("❌ .env file not found")
        return False
    
    # Check if OpenAI API key is set
    with open(".env", "r") as f:
        env_content = f.read()
        if "your_openai_api_key_here" in env_content:
            print("⚠️  OpenAI API key needs to be set in .env file")
        else:
            print("✅ .env file configured")
    
    return True

def main():
    """Main setup function"""
    print("🚀 Nursing Feedback AI Chatbot - Quick Setup")
    print("This script will set up the backend environment")
    print()
    
    # Check if we're in the right directory
    if not os.path.exists("backend"):
        print("❌ Please run this script from the project root directory")
        print("Expected structure: /project-root/backend/")
        return
    
    # Setup backend
    success = setup_backend()
    
    if success:
        # Test setup
        test_success = test_setup()
        
        if test_success:
            print("\n🎉 Setup completed successfully!")
            print("\n📋 Quick Start Commands:")
            print("1. Edit backend/.env and add your OpenAI API key")
            print("2. cd backend")
            print("3. python main.py  # Start the backend server")
            print("4. Visit http://localhost:8000/docs for API documentation")
            print("\n🧪 Test the setup:")
            print("   python test_chatbot.py")
            print("   python api_client_example.py")
        else:
            print("\n⚠️  Setup completed with warnings")
            print("Please check the issues above before proceeding")
    else:
        print("\n❌ Setup failed")
        print("Please check the errors above and try again")

if __name__ == "__main__":
    main()