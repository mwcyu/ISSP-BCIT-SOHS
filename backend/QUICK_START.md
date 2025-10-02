# 🚀 Quick Start Guide - Clinical Feedback Helper

## 🎯 Simple Ways to Use the Bot

I've created **4 easy ways** for you to use the Clinical Feedback Helper bot:

### ⚡ Option 1: CLI REPL (NEW - Direct Terminal Testing)

**Best for:** Testing during development, quick feedback without server

```bash
# Just run this single command - no server needed!
python cli_repl.py
```

**Features:**

- ✅ Direct interaction with AI agent
- ✅ No separate server needed
- ✅ Instant startup
- ✅ Perfect for development and testing
- ✅ Type `help`, `sections`, `progress`, `quit`

### 🖥️ Option 2: Terminal Client (Command Line Chat)

**Best for:** Quick testing, developers, command-line users

```bash
# 1. Start the backend server (in one terminal)
python main.py

# 2. Start the terminal client (in another terminal)
python terminal_client.py
```

**Features:**

- ✅ Colorful chat interface in your terminal
- ✅ Progress tracking
- ✅ Built-in help commands
- ✅ Type `help`, `progress`, `quit`

### 🌐 Option 2: Web Client (Browser Interface)

**Best for:** Easy use, non-technical users, nice interface

```bash
# 1. Start the backend server
python main.py

# 2. Open web_client.html in your browser
# (or double-click the file)
```

**Features:**

- ✅ Beautiful, responsive web interface
- ✅ Visual progress bar
- ✅ Real-time chat with the bot
- ✅ Mobile-friendly design
- ✅ No installation needed - just open in browser!

### 🔧 Option 4: Launcher Script (Super Easy!)

**Best for:** Beginners, one-click operation

```bash
# Just run this and pick what you want:
launcher.bat
```

**Menu Options:**

1. **Start Backend Server Only** - Just the API
2. **Start Terminal Client** - Chat in command line
3. **Open Web Client** - Chat in browser
4. **Run Tests** - Verify everything works
5. **Install Dependencies** - Install required packages

---

## 📋 Step-by-Step Instructions

### For Complete Beginners:

1. **Open Command Prompt/PowerShell** in the `backend` folder
2. **Run the launcher:** `launcher.bat`
3. **Choose option 5** to install dependencies (first time only)
4. **Choose option 1** to start the server
5. **Open a new terminal** and run `launcher.bat` again
6. **Choose option 2** (terminal) or **option 3** (web) to chat with the bot

### For Quick Testing (NEW - Recommended):

```bash
# Single command - no server needed!
python cli_repl.py
```

### For Testing with Server:

```bash
# Terminal 1: Start server
python main.py

# Terminal 2: Chat with bot
python terminal_client.py
```

### For Web Interface:

```bash
# Terminal: Start server
python main.py

# Browser: Open web_client.html
# (Just double-click the file or drag to browser)
```

---

## 🎮 How to Use the Bot

### 1. **Start a Session**

- The bot will greet you and explain BCCNM standards
- You'll be asked: "Is this a Weekly, Midterm, or Final feedback submission?"

### 2. **Choose Feedback Type**

- **Weekly:** 8 core sections (standard feedback)
- **Midterm:** 16 sections (comprehensive mid-term evaluation)
- **Final:** 16 sections (comprehensive final evaluation)

### 3. **Go Through Each Section**

The bot guides you through sections like:

- Clinical Skills & Knowledge
- Critical Thinking & Clinical Judgment
- Communication & Interpersonal Skills
- Professionalism & Responsibility
- Organization & Time Management
- Initiative & Engagement
- Safety & Quality of Care
- Additional Comments

### 4. **Provide Detailed Responses**

- Minimum 100 characters per response
- Include specific examples
- Focus on actionable feedback

### 5. **Review & Submit**

- Bot asks if you want to review your responses
- Provide email address for delivery
- Receive professional summary report

---

## 🆘 Troubleshooting

### "Cannot connect to server"

- Make sure backend is running: `python main.py`
- Server should show: `Uvicorn running on http://0.0.0.0:8000`

### "Import errors" (red underlines)

- Install dependencies: `pip install -r requirements.txt`
- For terminal client: `pip install colorama aiohttp`

### "Python not found"

- Make sure Python 3.8+ is installed
- Check: `python --version`

### Web client not working

- Ensure backend server is running on port 8000
- Check browser console for errors (F12)
- Try refreshing the page

---

## 🎯 Quick Commands Reference

### Terminal Client Commands:

- `help` - Show available commands
- `progress` - Show current progress through sections
- `quit` / `exit` / `bye` - End session

### Web Client Features:

- **Start Session** - Begin new feedback session
- **Show Progress** - View current progress
- **Reset Session** - Start over
- **Send** - Send message to bot

---

## 📁 Files Overview

- `main.py` - Backend server (FastAPI)
- `cli_repl.py` - **NEW**: Direct CLI REPL for terminal testing (no server needed)
- `terminal_client.py` - Command-line chat interface (requires server)
- `web_client.html` - Browser-based chat interface
- `launcher.bat` - Easy launcher script
- `test_clinical_feedback.py` - Test suite
- `test_migration.py` - **NEW**: Test LangChain v1 migration

---

## 🎉 Ready to Go!

Your Clinical Feedback Helper is now ready to use! Pick your preferred method:

- **⚡ CLI REPL (NEW):** `python cli_repl.py` - Fastest for testing!
- **🖥️ Terminal:** `python terminal_client.py` (requires server)
- **🌐 Web:** Open `web_client.html` (requires server)
- **🔧 Launcher:** `launcher.bat`

**Updated for LangChain v1!** 🎯✨

Happy feedback collecting! 🏥✨
