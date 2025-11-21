const express = require("express");
const axios = require("axios");
const moment = require("moment-timezone");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Middleware: Parse JSON request body
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "TradingView Telegram Alarm Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint to receive TradingView webhook
app.post("/webhook", async (req, res) => {
  try {
    const { ticker, price, signal } = req.body;

    // Validate required fields
    if (!signal) {
      return res.status(400).json({
        error: "Missing required field: signal",
      });
    }

    // Format message
    const message = formatMessage({
      time: new Date().toISOString(),
      ticker: ticker || "N/A",
      price: price || "N/A",
      signal: signal,
    });

    // Send to Telegram
    const success = await sendToTelegram(message);

    if (success) {
      console.log(`✅ Signal sent: ${signal} - ${new Date().toISOString()}`);
      res.json({
        status: "success",
        message: "Signal successfully sent to Telegram",
      });
    } else {
      throw new Error("Failed to send to Telegram");
    }
  } catch (error) {
    console.error("❌ Error processing webhook:", error.message);
    res.status(500).json({
      error: "Error processing request",
      details: error.message,
    });
  }
});

// Format message content
function formatMessage({ time, ticker, price, signal }) {
  const emoji = getSignalEmoji(signal);

  return `${emoji} *Trading Alert*

📊 *Signal Type:* ${signal}
💰 *Price:* ${price}
📈 *Ticker:* ${ticker}
🕐 *HKT:* ${moment(time).format("YYYY-MM-DD HH:mm").tz("Asia/Shanghai")}
---
_From TradingView_Bot`;
}

// Return corresponding emoji based on signal type
function getSignalEmoji(signal) {
  const signalUpper = signal.toUpperCase();
  if (signalUpper.includes("BUY") || signalUpper.includes("LONG")) {
    return "🟢";
  } else if (signalUpper.includes("SELL") || signalUpper.includes("SHORT")) {
    return "🔴";
  } else {
    return "📢";
  }
}

// Send message to Telegram
async function sendToTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error(
      "❌ Telegram configuration missing: Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID"
    );
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });

    return response.data.ok === true;
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    const errorCode = error.response?.data?.error_code;
    const errorDescription = error.response?.data?.description || error.message;

    console.error("❌ Failed to send Telegram message:");
    console.error("Error details:", JSON.stringify(errorDetails, null, 2));
    if (error.response?.status) {
      console.error("HTTP Status:", error.response.status);
    }

    // Provide helpful error messages for common issues
    if (errorCode === 403) {
      if (errorDescription.includes("bots can't send messages to bots")) {
        console.error(
          "\n💡 Tip: The Chat ID appears to be a bot ID. Please use:"
        );
        console.error(
          "   - Your personal user Chat ID (if sending to yourself)"
        );
        console.error("   - A group Chat ID (if sending to a group)");
        console.error(
          "   - To get your Chat ID, send /start to your bot or use @userinfobot"
        );
      } else if (errorDescription.includes("chat not found")) {
        console.error("\n💡 Tip: Chat not found. Please ensure:");
        console.error(
          "   - You have started a conversation with the bot (send /start)"
        );
        console.error("   - Or the bot has been added to the group");
      } else if (errorDescription.includes("bot was blocked")) {
        console.error(
          "\n💡 Tip: The bot was blocked. Please unblock the bot first."
        );
      }
    } else if (errorCode === 400) {
      if (errorDescription.includes("chat_id is empty")) {
        console.error(
          "\n💡 Tip: Chat ID is empty. Please check your .env file."
        );
      }
    }

    return false;
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn(
      "⚠️  Warning: Telegram configuration not set, please check .env file"
    );
  }
});
