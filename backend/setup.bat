@echo off
REM Setup script for Nursing Feedback AI Chatbot Backend (Windows)
REM Run this script to set up the development environment

echo Setting up Nursing Feedback AI Chatbot Backend...

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create data directory for ChromaDB
echo Creating data directory...
if not exist data\chroma_db mkdir data\chroma_db

REM Copy environment template
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please edit .env file and add your OpenAI API key!
) else (
    echo .env file already exists
)

echo.
echo Setup completed!
echo.
echo Next steps:
echo 1. Edit .env file and add your OpenAI API key
echo 2. Activate virtual environment: venv\Scripts\activate.bat
echo 3. Run the application: python main.py
echo 4. Visit http://localhost:8000/docs for API documentation
echo.
pause