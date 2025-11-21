const axios = require("axios");
require("dotenv").config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN not found in .env file");
  process.exit(1);
}

async function getChatId() {
  try {
    console.log("📡 Fetching updates from Telegram...\n");
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
    const response = await axios.get(url);

    if (!response.data.ok) {
      console.error("❌ Error:", response.data.description);
      return;
    }

    const updates = response.data.result;

    if (updates.length === 0) {
      console.log("📭 No updates found.");
      console.log("\n💡 To get your Chat ID:");
      console.log("   1. Send /start to your bot in Telegram");
      console.log("   2. Or send a message to your bot");
      console.log("   3. Then run this script again\n");
      return;
    }

    console.log("✅ Found updates:\n");

    const chatIds = new Map();

    updates.forEach((update, index) => {
      if (update.message) {
        const chat = update.message.chat;
        const chatId = chat.id;
        const chatType = chat.type; // 'private', 'group', 'supergroup', 'channel'
        const chatTitle =
          chat.title || chat.first_name || chat.username || "Unknown";

        if (!chatIds.has(chatId)) {
          chatIds.set(chatId, {
            type: chatType,
            title: chatTitle,
            username: chat.username || "N/A",
          });
        }
      }
    });

    console.log("📋 Available Chat IDs:\n");
    chatIds.forEach((info, chatId) => {
      const typeEmoji = {
        private: "👤",
        group: "👥",
        supergroup: "👥",
        channel: "📢",
      };

      console.log(`${typeEmoji[info.type] || "📌"} Chat ID: ${chatId}`);
      console.log(`   Type: ${info.type}`);
      console.log(`   Name: ${info.title}`);
      if (info.username !== "N/A") {
        console.log(`   Username: @${info.username}`);
      }
      console.log("");
    });

    console.log(
      "💡 Copy one of the Chat IDs above to your .env file as TELEGRAM_CHAT_ID"
    );
  } catch (error) {
    console.error(
      "❌ Error fetching updates:",
      error.response?.data || error.message
    );
  }
}

getChatId();
