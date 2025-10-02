# Clinical Feedback Helper Launcher (PowerShell)
# Easy way to start the bot on Windows

Write-Host "====================================" -ForegroundColor Magenta
Write-Host "  Clinical Feedback Helper Launcher" -ForegroundColor Magenta  
Write-Host "====================================" -ForegroundColor Magenta
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ and try again" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Available options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend Server Only" -ForegroundColor White
Write-Host "2. Start Terminal Client (Chat in Command Line)" -ForegroundColor White
Write-Host "3. Open Web Client (Chat in Browser)" -ForegroundColor White
Write-Host "4. Run Tests" -ForegroundColor White
Write-Host "5. Install Dependencies" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "Starting backend server..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "API documentation at: http://localhost:8000/docs" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        python main.py
    }
    "2" {
        Write-Host "Checking if server is running..." -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000" -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "Server is running! Starting terminal client..." -ForegroundColor Green
            Write-Host ""
            Write-Host "Type 'help' for commands, 'quit' to exit" -ForegroundColor Cyan
            Write-Host ""
            python terminal_client.py
        }
        catch {
            Write-Host ""
            Write-Host "ERROR: Backend server is not running!" -ForegroundColor Red
            Write-Host "Please start the server first with option 1, then run this again." -ForegroundColor Red
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
    }
    "3" {
        Write-Host "Checking if server is running..." -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000" -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "Server is running! Opening web client..." -ForegroundColor Green
            Write-Host ""
            Write-Host "Opening web client in your default browser..." -ForegroundColor Cyan
            Write-Host "The server should be running at: http://localhost:8000" -ForegroundColor Cyan
            Write-Host ""
            Start-Process "web_client.html"
        }
        catch {
            Write-Host ""
            Write-Host "ERROR: Backend server is not running!" -ForegroundColor Red
            Write-Host "Please start the server first with option 1, then run this again." -ForegroundColor Red
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
    }
    "4" {
        Write-Host "Running tests..." -ForegroundColor Yellow
        Write-Host ""
        python test_clinical_feedback.py
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    "5" {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        Write-Host ""
        pip install -r requirements.txt
        pip install colorama aiohttp requests
        Write-Host ""
        Write-Host "Dependencies installed!" -ForegroundColor Green
        Read-Host "Press Enter to continue"
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
        Read-Host "Press Enter to continue"
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to exit"