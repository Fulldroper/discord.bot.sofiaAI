const axios = require("axios");

// aplication runner
(async () => {
  // env configuration
  process.env.NODE_ENV || (await require("dotenv").config({ debug: false }));
  // req discord framework
  const bot = new (require('discord.js-selfbot-v13').Client)({
    checkUpdate: false,
  });
  const trigger = ['Софія','софія','Софа','софа','Софійка','софійка','Софочка','софочка'] 
  const TIMEOUT = 5000
  const timeout = {}

  const { Configuration, OpenAIApi } = require("openai");
  const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }));

  // error handle hook
  bot.error = (x) => {
    console.log(x)
    axios({
      method: 'post',
      url: process.env.ERROR_WEBHOOK_URL,
      headers:{
        "Content-Type": "multipart/form-data"
      },
      data: { 
        content:`\`\`\`js\n${x?.stack || x}\`\`\``,
        username: this?.user?.username || process.env.npm_package_name,
        avatar_url: this?.user?.avatarURL() || ''
      }
    })
  }
  // error handle
  bot.on("error", bot.error)

  bot.on("messageCreate", async (msg) => {
    if (msg.author.id === bot.user.id || msg.author.bot) return;

    const parser = msg.content.split(' ').some(w => trigger.includes(w));

    if ((!msg?.mentions?.users?.has(bot.user.id)) && (!parser)) {
      console.log("скип");
      return;
    };

    const prompt = parser ? msg.content.replace(/(софія||Софія||софа||Софа||Софійка||софійка||Софочка||софочка)/gm ,'').trim() : msg.content.replace(`<@${bot.user.id}>`,'').trim();

    if (prompt?.length <= 0) return;

    const typing = setInterval(() => msg.channel.sendTyping, 12000, msg);

    const currTime = new Date().getTime()

    if (timeout[msg.author.id] && currTime - timeout[msg.author.id] < TIMEOUT) {
      clearInterval(typing)
      msg.reply("Я зараз зайнята, поговоримо пізніше")
      return
    } else timeout[msg.author.id] = currTime;

    if (/.*(намалюй).*/gm.test(prompt)) {
      const response = await openai.createImage({
        prompt,
        n: 1,
        size: "1024x1024",
      });
      // response.data.data[0].url
      clearInterval(typing)
      msg.reply(response.data.data[0].url)
        .catch(() => {
          msg.reply("щось не можу відправити, я спробую тобі в пп")
          msg.author.send(response.data.data[0].url).catch(() => {
            msg.reply(`щось не можу відправити тобі в пп, спробуй це посилання \`\`\`${response.data.data[0].url}\`\`\``)

          })
        })
    } else {
      try {
        const { data } = await openai.createCompletion({
          model: "text-davinci-003", prompt,
          max_tokens: 2048,
          temperature: 0
        },{
          timeout: process.env.TIMEOUT
        });
  
        const text = data.choices[0].text.trim()
  
        try {
         const {data} = await axios({
          url: `https://api-translate.systran.net/translation/text/translate?target=uk&input="${text}"`,
          method: "post",
          headers: {
            "Authorization": `Key ${process.env.TRANSLATE_TOKEN}`
          }
         })
        //  console.log(data.outputs[0].output);
         clearInterval(typing)
         msg.reply(data.outputs[0].output.slice(1,-1).replace("Росії",'на болоті').replace("Росія",'болото').replace("росії",'на болоті').replace("росія",'болото'))
        } catch (error) {
          clearInterval(typing)
          msg.reply(text)
        }
      } catch (error) {
        clearInterval(typing)
        msg.reply("Я щось тріш зморилась. Пізніше поговорим")
      }
    }
       
  });
   
  bot.login(process.env.TOKEN);
})();
