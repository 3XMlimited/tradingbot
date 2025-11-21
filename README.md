# Telegram Alarm Server

A simple Node.js server that receives trading signals from TradingView and automatically sends them to a Telegram group.

## Features

- ✅ Receive TradingView webhook signals
- ✅ Automatically format and send to Telegram group
- ✅ Support Markdown formatted messages
- ✅ Automatic signal type recognition (Buy/Sell)
- ✅ Error handling and logging

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Telegram Bot

#### Create Telegram Bot

1. Search for `@BotFather` in Telegram
2. Send `/newbot` command
3. Follow the prompts to set bot name and username
4. Save the Bot Token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Get Group Chat ID

1. Add your bot to the target Telegram group
2. Send any message in the group
3. Visit the following URL (replace `YOUR_BOT_TOKEN` with your Bot Token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Find `"chat":{"id":-123456789}` in the returned JSON, the `id` value is your group Chat ID

### 3. Configure Environment Variables

Copy `env.example` file and rename it to `.env`:

```bash
cp env.example .env
```

Edit the `.env` file and fill in your configuration:

```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PORT=3000
```

## Run Server

```bash
npm start
```

The server will start at `http://localhost:3000`.

## TradingView Webhook Configuration

In TradingView Alert settings:

1. **Webhook URL**: `http://your-server-ip:3000/webhook`
   - If deploying locally, use tools like ngrok to create a public tunnel
   - Example: `https://your-ngrok-url.ngrok.io/webhook`

2. **Alert Message** (JSON format):
```json
{
  "time": "{{timenow}}",
  "price": "{{close}}",
  "signal": "YourSignal",
  "volume": "{{volume}}"
}
```

### Example Signal Values

- `signal` can be: `"BUY"`, `"SELL"`, `"LONG"`, `"SHORT"`, etc.
- The system will automatically recognize signal types and add corresponding emojis

## API Endpoints

### POST /webhook

Receive TradingView signals.

**Request Body Example:**
```json
{
  "time": "2024-01-01T12:00:00Z",
  "price": "50000",
  "signal": "BUY",
  "volume": "1000"
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Signal successfully sent to Telegram"
}
```

### GET /

Health check endpoint, returns server status.

## Deployment Recommendations

### Using ngrok (Local Development)

```bash
# Install ngrok
brew install ngrok  # macOS
# Or download from https://ngrok.com/download

# Start tunnel
ngrok http 3000
```

Configure the ngrok URL in TradingView webhook.

### Using Cloud Services (Production)

Recommended deployment services:
- **Heroku**
- **Railway**
- **Render**
- **Vercel** (requires serverless adaptation)
- **DigitalOcean App Platform**

## Troubleshooting

1. **Messages not sent to Telegram**
   - Check if Token and Chat ID in `.env` file are correct
   - Confirm bot is added to the group
   - Check error messages in server logs

2. **Webhook not accessible**
   - Confirm server is running
   - Check firewall settings
   - If using local server, ensure using tools like ngrok for public access

3. **Message format issues**
   - Check if TradingView Alert Message is valid JSON
   - Confirm `signal` field is included

## License

MIT
# tradingbot
