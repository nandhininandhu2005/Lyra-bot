# 🤖 Telegram Claude Bot

A powerful Telegram chatbot powered by **Claude AI (Anthropic)** built with Node.js.

---

## ✨ Features

- 🧠 Claude AI integration (claude-sonnet-4)
- 💬 Conversation memory per user
- ⌨️ Typing indicator while processing
- 🔄 /clear command to reset memory
- ❓ /help command
- ✅ Error handling & Markdown support
- 🛡️ Graceful fallback for Markdown errors

---

## 📦 Requirements

- Node.js v18 or higher
- Telegram Bot Token (from @BotFather)
- Anthropic API Key (from console.anthropic.com)

---

## 🚀 Setup & Run

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```env
TELEGRAM_TOKEN=your_telegram_bot_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Run the bot

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

---

## 🤖 Get Your Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Follow the prompts to name your bot
4. Copy the token provided

---

## 🔑 Get Anthropic API Key

1. Go to: https://console.anthropic.com
2. Sign up / Log in
3. Go to **API Keys** section
4. Create a new key and copy it

---

## 💬 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | Show help menu |
| `/clear` | Clear conversation history |

---

## 🌐 Free Hosting Options

| Platform | Link |
|----------|------|
| Railway | https://railway.app |
| Render | https://render.com |
| Replit | https://replit.com |

---

## 📁 Project Structure

```
telegram-claude-bot/
├── index.js        ← Main bot file
├── .env            ← Your secret keys (don't share!)
├── .env.example    ← Template for .env
├── package.json    ← Dependencies
└── README.md       ← This file
```

---

## ⚠️ Important

- Never share your `.env` file or API keys publicly
- Add `.env` to your `.gitignore` if using Git

---

## 🛠️ Built With

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk)
- [dotenv](https://www.npmjs.com/package/dotenv)
