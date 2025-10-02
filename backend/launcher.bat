@echo off
echo ====================================
echo   Clinical Feedback Helper Launcher
echo ====================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo Available options:
echo.
echo 1. Start Backend Server Only
echo 2. Start Terminal Client (Chat in Command Line)
echo 3. Open Web Client (Chat in Browser)
echo 4. Run Tests
echo 5. Run Demo (Automated Conversation)
echo 6. Install Dependencies
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo Starting backend server...
    echo.
    echo Server will be available at: http://localhost:8000
    echo API documentation at: http://localhost:8000/docs
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python main.py
) else if "%choice%"=="2" (
    echo Checking if server is running...
    python -c "import requests; requests.get('http://localhost:8000')" >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ERROR: Backend server is not running!
        echo Please start the server first with option 1, then run this again.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Starting terminal client...
    echo Type 'help' for commands, 'quit' to exit
    echo.
    python terminal_client.py
) else if "%choice%"=="3" (
    echo Checking if server is running...
    python -c "import requests; requests.get('http://localhost:8000')" >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ERROR: Backend server is not running!
        echo Please start the server first with option 1, then run this again.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Opening web client in your default browser...
    echo The server should be running at: http://localhost:8000
    echo.
    start web_client.html
) else if "%choice%"=="4" (
    echo Running tests...
    echo.
    python test_clinical_feedback.py
    echo.
    pause
) else if "%choice%"=="5" (
    echo Checking if server is running...
    python -c "import requests; requests.get('http://localhost:8000')" >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ERROR: Backend server is not running!
        echo Please start the server first with option 1, then run this again.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Running automated demo conversation...
    echo This shows a complete feedback session from start to finish.
    echo.
    python demo.py
    echo.
    pause
) else if "%choice%"=="6" (
    echo Installing dependencies...
    echo.
    pip install -r requirements.txt
    pip install colorama aiohttp requests
    echo.
    echo Dependencies installed!
    pause
) else (
    echo Invalid choice. Please run the script again.
    pause
)

echo.
echo Done!
pause