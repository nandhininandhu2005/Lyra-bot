const TelegramBot = require("node-telegram-bot-api");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// === CONFIG ===
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// === MEMORY (per user) ===
const userSessions = {};

// === START COMMAND ===
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "there";

  const welcome =
    `👋 *Hello, ${firstName}!* Welcome to *Lyra AI Assistant!*\n\n` +
    `I can help you with:\n` +
    `💻 *Coding help* — Python, JS, Node.js, etc.\n` +
    `🔍 *Research & Info* — Any topic explained clearly\n` +
    `🔗 *Link-wise Answers* — Official docs & resources\n` +
    `🌐 *Tech & Science* — AI, blockchain, space & more\n` +
    `📱 *App Recommendations* — Best tools for any task\n\n` +
    `*Commands:*\n` +
    `/start - Show this welcome message\n` +
    `/clear - Clear conversation history\n` +
    `/help - Show help\n\n` +
    `Just type your question and I'll answer! 🚀`;

  bot.sendMessage(chatId, welcome, { parse_mode: "Markdown" });
});

// === HELP COMMAND ===
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpText =
    `🆘 *Help Menu*\n\n` +
    `*Available Commands:*\n` +
    `/start - Welcome message\n` +
    `/clear - Clear your chat memory\n` +
    `/help - Show this menu\n\n` +
    `*How to use:*\n` +
    `• Just type any question naturally\n` +
    `• Ask for code, links, or explanations\n` +
    `• I remember your conversation history\n\n` +
    `*Example Questions:*\n` +
    `• "Who is the CM of Tamil Nadu?"\n` +
    `• "Write hello world in Python"\n` +
    `• "What is quantum computing?"`;

  bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
});

// === CLEAR COMMAND ===
bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  userSessions[userId] = [];
  bot.sendMessage(chatId, "🧹 *Conversation cleared!* Start fresh anytime. 😊", {
    parse_mode: "Markdown",
  });
});

// === MAIN MESSAGE HANDLER ===
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;

  if (!userMessage || userMessage.startsWith("/")) return;

  if (!userSessions[userId]) {
    userSessions[userId] = [];
  }

  // Show typing indicator
  bot.sendChatAction(chatId, "typing");
  const typingInterval = setInterval(() => {
    bot.sendChatAction(chatId, "typing");
  }, 4000);

  try {
    // Gemini model with system instruction (correct format)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "You are Lyra, an advanced AI assistant in a Telegram chatbot. Provide accurate, clear, helpful answers. Include reliable links when possible. Use bullet points when helpful. For coding questions provide working code with brief explanation. Be friendly and professional.",
    });

    // Build history
    const history = userSessions[userId].map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: { maxOutputTokens: 1024 },
    });

    const result = await chat.sendMessage(userMessage);
    const reply = result.response.text();

    clearInterval(typingInterval);

    // Save to memory
    userSessions[userId].push({ role: "user", content: userMessage });
    userSessions[userId].push({ role: "assistant", content: reply });

    // Keep last 20 messages
    if (userSessions[userId].length > 20) {
      userSessions[userId] = userSessions[userId].slice(-20);
    }

    // Send reply
    try {
      await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
    } catch {
      await bot.sendMessage(chatId, reply);
    }

  } catch (error) {
    clearInterval(typingInterval);
    console.error("Gemini API Error:", error.message);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again!");
  }
});

// === ERROR HANDLING ===
bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

console.log("🤖 Lyra AI Bot (Gemini) is running...");
console.log("✅ Press Ctrl+C to stop");