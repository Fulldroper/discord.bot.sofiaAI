The purpose of the project was to create a Discord bot that implements ChatGPT in a text channel environment on a Discord server using an open API.

The project is useful as it provides an interactive and intelligent conversation agent within Discord text channels, enhancing user engagement and support.

## How the project works

The bot connects to a Discord server and listens for messages in specific text channels. When a user sends a message, the bot uses the ChatGPT API to generate a response, which it then posts back in the channel.

### Repository Link and Installation

You can find the repository and installation instructions at the following link:
[Discord Bot SofiaAI](https://github.com/Fulldroper/discord.bot.sofiaAI)

### Algorithm and Code Examples

1. **Connecting to Discord Server**
```javascript
const Discord = require('discord.js');
const client = new Discord.Client();
client.login('YOUR_BOT_TOKEN');
client.on('ready', () => {
  console.log('Logged in as ' + client.user.tag + '!');
});
```

2. **Listening for Messages**
```javascript
client.on('message', async message => {
  if (message.author.bot) return;
  const response = await getChatGPTResponse(message.content);
  message.channel.send(response);
});
```

3. **Getting ChatGPT Response**
```javascript
const fetch = require('node-fetch');

async function getChatGPTResponse(prompt) {
  const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 150
    })
  });
  const data = await response.json();
  return data.choices[0].text.trim();
}
```

## Skills Acquired

- Advanced JavaScript and Node.js programming
- Working with the Discord API
- Making API calls and handling asynchronous operations
- Integrating AI models into applications

