# Quick Start Guide - Refactored Chatbot

## 🚀 Get Started in 3 Minutes

### Step 1: Setup (1 minute)

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

### Step 2: Run (30 seconds)

```bash
python main_refactored.py
```

### Step 3: Use (2 minutes)

```
Bot: Which standard would you like to start with?

You: Standard 1

Bot: Great! Can you describe how the learner demonstrated
     awareness of their scope of practice?

You: The student always asked for guidance when unsure and
     recognized their limitations clearly.

Bot: That's helpful. How did they respond to feedback?

You: They were receptive and implemented suggestions quickly.

Bot: Excellent. What improvement strategies would you suggest?

You: More exposure to complex cases.

Bot: Moving to Standard 2...
```

## ⚡ Key Commands

| Command    | What It Does           |
| ---------- | ---------------------- |
| `progress` | Show completion status |
| `help`     | Display help           |
| `tokens`   | View token usage       |
| `quit`     | Save and exit          |

## ✅ What You Get

After finishing, you'll have:

📄 **JSON file** - Structured data  
📊 **CSV file** - Spreadsheet format  
📝 **Summary** - AI-generated insights

## 🔒 Privacy Guaranteed

✅ No names collected  
✅ No facility identifiers  
✅ Completely anonymous  
✅ Focus on behaviors only

## 💡 Tips

1. **Be specific** - Give examples when possible
2. **Stay focused** - Talk about behaviors, not names
3. **Be honest** - Constructive feedback helps students grow
4. **Use commands** - Type 'progress' to see where you are

## 🆘 Troubleshooting

### "API key not found"

- Check your `.env` file exists
- Make sure it has `OPENAI_API_KEY=your-key`

### "Module not found"

- Run `pip install -r requirements.txt`

### "Connection error"

- Check your internet connection
- Verify your API key is valid

## 📚 More Info

- Full details: See [DOCUMENTATION.md](./DOCUMENTATION.md)
- Migration from old version: See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Original README: See [backend/README.md](./backend/README.md)

---

**Ready to start? Run `python main_refactored.py` now!**
