# Environment Setup Guide

## Quick Start

1. **Copy the example file**

   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Get your OpenAI API key**

   - Visit: https://platform.openai.com/api-keys
   - Create new secret key
   - Copy the key (starts with `sk-`)

3. **Edit `.env` file**

   ```bash
   # Open in your editor
   notepad .env  # Windows
   # or
   nano .env     # Linux/Mac
   ```

4. **Add your key**

   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

5. **Save and run**
   ```bash
   python main.py
   ```

## Troubleshooting

### Error: "The api_key client option must be set"

**Problem**: The `.env` file is missing or `OPENAI_API_KEY` is not set.

**Solution**:

1. Ensure `.env` file exists in `backend/` directory
2. Check that `OPENAI_API_KEY=` line has your actual key
3. No spaces around the `=` sign
4. No quotes needed around the key

### Error: "Invalid API key"

**Problem**: The API key is incorrect or expired.

**Solution**:

1. Generate a new key at https://platform.openai.com/api-keys
2. Update `.env` file with new key
3. Ensure no extra spaces or characters

### Error: Rate limit exceeded

**Problem**: You've exceeded OpenAI API rate limits.

**Solution**:

1. Wait a few minutes and try again
2. Check your usage at https://platform.openai.com/usage
3. Consider upgrading your OpenAI plan if needed

## Security Notes

⚠️ **IMPORTANT**: The `.env` file is gitignored for security reasons.

- **Never commit** `.env` file to git
- **Never share** your API key publicly
- **Rotate keys** regularly
- Use `.env.example` for documentation only

## Optional Configuration

### Organization ID (if applicable)

```
OPENAI_ORGANIZATION=org-your-org-id-here
```

### Custom Model (advanced)

To use a different model, edit `backend/graph.py`:

```python
def _load_llm():
    return init_chat_model("openai:gpt-4o", temperature=0)  # Change model here
```

Available models:

- `openai:gpt-4o-mini` (default, fast & cost-effective)
- `openai:gpt-4o` (more capable, slower, more expensive)
- `openai:gpt-4-turbo`

## Verification

Test your setup:

```bash
cd backend
python main.py
```

Expected output on success:

```
Loading cached vectorstore: standards
Loading cached vectorstore: improvements

BOT: [Introduction message...]
```

If you see this, you're all set! 🎉

## Cost Estimates

Approximate costs per session (4 standards):

- **Embeddings**: $0.0001 per 1K tokens (one-time, cached)
- **GPT-4o-mini**: ~$0.05-0.15 per session
- **GPT-4o**: ~$0.50-1.50 per session

For development/testing, gpt-4o-mini is recommended.

## Need Help?

- **OpenAI Documentation**: https://platform.openai.com/docs
- **API Key Issues**: https://help.openai.com/
- **LangChain Docs**: https://python.langchain.com/docs/
