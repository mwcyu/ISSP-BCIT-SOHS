# Nursing Preceptor Feedback Chatbot

A structured feedback collection system for nursing preceptors based on BCCNM 4 Standards.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure API Key

1. Copy the example configuration file:

   ```bash
   cp config.env.example config.env
   ```

2. Edit `config.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Run the Application

```bash
python main.py
```

## Usage

The chatbot will guide you through collecting structured feedback based on the 4 BCCNM Standards:

- **Standard 1**: Professional Responsibility and Accountability
- **Standard 2**: Knowledge-Based Practice
- **Standard 3**: Client-Focused Provision of Service
- **Standard 4**: Ethical Practice

### Commands

- Type your feedback normally
- Type `progress` to see completion status
- Type `done` when finished to save feedback
- Type `quit` to exit without saving
- Type `reset` to start over

## Output

The system generates feedback in multiple formats:

- JSON file for programmatic access
- CSV file for easy review
- Console summary for immediate feedback

## Security

- API keys are stored in environment variables (not in code)
- The `config.env` file should be added to `.gitignore` to prevent accidental commits
- Never share your API key publicly

## Environment Variables

| Variable         | Description         | Required |
| ---------------- | ------------------- | -------- |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes      |
| `DEBUG`          | Enable debug mode   | No       |
