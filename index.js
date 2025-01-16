const express = require('express');
const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { Attendancebot } = require('./attendancebot');

// Create an Express app
const app = express();
const port = 3978;

// Create memory storage to persist conversation state
const memoryStorage = new MemoryStorage();

// Create conversation state
const conversationState = new ConversationState(memoryStorage);

// Create the adapter
const adapter = new BotFrameworkAdapter();

// Handle incoming requests
app.post('/api/messages', async (req, res) => {
    await adapter.processActivity(req, res, async (context) => {
        const attendancebot = new Attendancebot(conversationState); // Create bot instance for each request
        await attendancebot.run(context);
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Bot is running at http://localhost:${port}/api/messages`);
});
