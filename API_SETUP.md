# 🔑 API Key Setup Guide

The chatbot requires a valid Google Gemini API key to function. Follow these steps to set it up:

## Quick Setup (2 minutes)

### Step 1: Get Your Free API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

### Step 2: Add API Key to Your Project

Open the `.env.local` file in the project root and replace the placeholder:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Example:**
```bash
GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 3: Restart the Development Server

Stop the current server (Ctrl+C) and restart:

```bash
npm run dev
```

## ✅ Verify It's Working

1. Open the app at http://localhost:3000
2. Click the **"AI Chat"** button
3. Type a message like "Hello" or "Analyze my spending"
4. You should get a response from Finny (the AI assistant)

## 🔍 Troubleshooting

### Issue: "I'm having trouble connecting to my brain"

**Solutions:**
- Check that your API key is correctly pasted in `.env.local`
- Make sure there are no extra spaces or quotes around the key
- Verify the key is valid at [Google AI Studio](https://aistudio.google.com/apikey)
- Restart the dev server after changing the `.env.local` file

### Issue: Console shows "No valid API key found"

**Solutions:**
- Ensure the file is named exactly `.env.local` (not `.env` or `env.local`)
- Check that the variable name is `GEMINI_API_KEY`
- Make sure the file is in the project root directory

### Issue: API key is valid but still not working

**Solutions:**
- Clear browser cache and reload
- Check browser console (F12) for error messages
- Ensure you have internet connection
- Try generating a new API key

## 📝 Notes

- The API key is **free** with generous usage limits
- Your API key is only stored locally and never shared
- The app works with mock data if no API key is provided
- You can use the dashboard features without an API key

## 🔒 Security

- Never commit your `.env.local` file to version control
- Don't share your API key publicly
- The `.env.local` file is already in `.gitignore`

## 💡 Alternative Setup

If you prefer, you can also set the API key as:
```bash
API_KEY=your_api_key_here
```

The app checks both `GEMINI_API_KEY` and `API_KEY` environment variables.
