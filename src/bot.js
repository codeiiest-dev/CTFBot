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
        if (resp) {
          resp.data.forEach((ctf) => {
            // console.log(ctf.title);
            const eventEmbed = new MessageEmbed()
              .setTitle(ctf.title)
              .setURL(ctf.url)
              .setDescription(
                ctf.description +
                  "\n**Starts at:** " +
                  new Date(ctf.start).toLocaleString()
              );
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
    const channel = msg.channel;
    if (CMD.toLowerCase() === "future") {
      if (args.length === 0) {
        channel.send(PREFIX + "future <number less than 10>");
      } else {
        const strNum = args[0];
        // console.log(strNum, typeof strNum);
        const num = parseInt(strNum, 10);
        if (num < 0 || num > 10) {
          channel.send(
            "Please input a value b/w 1 and 10, don't want to overload CTFTime API :| "
          );
        } else {
          getEvents(num, channel);
        }
      }
    } else {
      channel.send(
        "Can't even type properly yet and want to do CTF's? **HAHAHAH**"
      );
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
