require("dotenv").config();

const { Client, Message, MessageEmbed, Discord } = require("discord.js");
const axios = require("axios");
const client = new Client();

const PREFIX = "!ctf ";
const EVENT_URL = "https://ctftime.org/api/v1/events/?limit=";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64; rv:82.0) Gecko/20100101 Firefox/82.0",
};

getEvents = async (limit, channel) => {
  try {
    const data = await axios
      .get(EVENT_URL + limit, { headers: HEADERS })
      .then((resp) => {
        // console.log(resp);
        if (resp) {
          console.log("Data: ", resp.data);
          resp.data.forEach((ctf) => {
            console.log(ctf.title);
            const eventEmbed = new MessageEmbed()
              .setTitle(ctf.title)
              .setURL(ctf.url)
              .setDescription(ctf.description)
              .setTimestamp(new Date(ctf.start).toLocaleString());
            channel.send(eventEmbed);
          });
        }
        // return resp;
      });
  } catch (error) {
    console.error("Error: ", error);
  }
};

client.on("ready", () => {
  console.log(`${client.user.username} is logged in! ${client.user.tag}`);
});

client.on("message", (msg) => {
  if (msg.content.startsWith(PREFIX)) {
    const [CMD, ...args] = msg.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);
    console.log(CMD, args);

    getEvents(2, msg.channel);
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
