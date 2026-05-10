require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const Anthropic = require("@anthropic-ai/sdk");

// === INIT ===
const bot = new TelegramBot("8784548363:AAECpNc9oZnjsCsMi4gIi4vl3e2Eti6cDCU", { polling: true });
const client = new Anthropic({ apiKey: "AIzaSyCjYh5Plst2ftzZw1tw50YyhIIDbJEiptMYOUR_REAL_API_KEY_HERE" });

const SYSTEM_PROMPT = `You are an advanced AI assistant integrated into a Telegram chatbot.
Your goals:
1. Provide accurate, clear, and helpful answers to any user query.
2. When possible, include reliable links (official websites, documentation, or trusted sources).
3. Avoid hallucinating links. Only provide links if you are confident they are correct.
4. If unsure about a link, say "I may be mistaken" or suggest how the user can search instead.

Response Style:
- Keep answers clean, structured, and easy to read.
- Use bullet points or sections when helpful.
- For informational queries:
  • Give a direct answer first
  • Then add useful explanation
  • Then provide relevant links (if available)

Link Handling Rules:
- Always prefer official sources (e.g., company websites, documentation).
- Do NOT create fake or guessed URLs.

For coding questions:
- Provide working, clean code.
- Explain briefly what it does.

For unclear questions:
- Ask a short clarifying question before answering.

For real-time or unknown data:
- Say you may not have real-time info and suggest checking official sources.

Tone:
- Friendly, professional, and helpful.
- Not overly verbose.

Always prioritize correctness over sounding confident.`;

// === MEMORY (per user) ===
const userSessions = {};

// === HELPERS ===
function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function safeMarkdown(text) {
  // Try to send as Markdown, fallback to plain text
  return text;
}

// === START COMMAND ===
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "there";

  const welcome =
    `👋 *Hello, ${firstName}\\!* Welcome to your AI Assistant powered by Claude\\!\n\n` +
    `I can help you with:\n` +
    `💻 *Coding help* — Python, JS, Node\\.js, etc\\.\n` +
    `🔍 *Research & Info* — Any topic explained clearly\n` +
    `🔗 *Link\\-wise Answers* — Official docs & resources\n` +
    `🌐 *Tech & Science* — AI, blockchain, space & more\n` +
    `📱 *App Recommendations* — Best tools for any task\n\n` +
    `*Commands:*\n` +
    `/start \\- Show this welcome message\n` +
    `/clear \\- Clear conversation history\n` +
    `/help \\- Show help\n\n` +
    `Just type your question and I'll answer\\! 🚀`;

  bot.sendMessage(chatId, welcome, { parse_mode: "MarkdownV2" });
});

// === HELP COMMAND ===
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpText =
    `🆘 *Help Menu*\n\n` +
    `*Available Commands:*\n` +
    `/start \\- Welcome message\n` +
    `/clear \\- Clear your chat memory\n` +
    `/help \\- Show this menu\n\n` +
    `*How to use:*\n` +
    `• Just type any question naturally\n` +
    `• Ask for code, links, or explanations\n` +
    `• I remember your conversation history\n\n` +
    `*Example Questions:*\n` +
    `• "How do I center a div in CSS?"\n` +
    `• "Give me resources to learn Python"\n` +
    `• "What is quantum computing?"\n` +
    `• "Best free tools for UI design"`;

  bot.sendMessage(chatId, helpText, { parse_mode: "MarkdownV2" });
});

// === CLEAR COMMAND ===
bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  userSessions[userId] = [];
  bot.sendMessage(
    chatId,
    "🧹 *Conversation cleared\\!* Start fresh anytime\\. 😊",
    { parse_mode: "MarkdownV2" }
  );
});

// === MAIN MESSAGE HANDLER ===
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;

  // Skip if no text or if it's a command
  if (!userMessage || userMessage.startsWith("/")) return;

  // Init session if not exists
  if (!userSessions[userId]) {
    userSessions[userId] = [];
  }

  // Add user message to history
  userSessions[userId].push({
    role: "user",
    content: userMessage,
  });

  // Show typing indicator
  bot.sendChatAction(chatId, "typing");

  // Keep typing indicator alive for long responses
  const typingInterval = setInterval(() => {
    bot.sendChatAction(chatId, "typing");
  }, 4000);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: userSessions[userId],
    });

    clearInterval(typingInterval);

    const reply = response.content[0].text;

    // Add assistant reply to history
    userSessions[userId].push({
      role: "assistant",
      content: reply,
    });

    // Keep only last 20 messages (memory limit)
    if (userSessions[userId].length > 20) {
      userSessions[userId] = userSessions[userId].slice(-20);
    }

    // Try sending with Markdown, fallback to plain text
    try {
      await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
    } catch (markdownError) {
      await bot.sendMessage(chatId, reply);
    }
  } catch (error) {
    clearInterval(typingInterval);
    console.error("Claude API Error:", error.message);

    bot.sendMessage(
      chatId,
      "⚠️ *Something went wrong\\!* Please try again in a moment\\.",
      { parse_mode: "MarkdownV2" }
    );
  }
});

// === ERROR HANDLING ===
bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

console.log("🤖 Telegram Claude Bot is running...");
console.log("✅ Press Ctrl+C to stop");
