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
              .addField("Weight: ", ctf.weight, true)
              .addField(
                "Start Date: ",
                new Date(ctf.start).toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }),
                true
              )
              .addField(
                "Start Time: ",
                new Date(ctf.start).toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }),
                true
              )
              .addField("CTFTime URL: ", ctf.ctftime_url, true)
              .addField("Type: ", ctf.format, true)
              .setURL(ctf.url)
              .setFooter("Times in IST (+5:30)")
              .setDescription(
                ctf.description.slice(0, Math.min(140, ctf.description.length))
              );
            channel.send(eventEmbed);
          });
        }
      });
  } catch (error) {
    console.error("Error: ", error);
  }
};

client.on("ready", () => {
  console.log(` ${client.user.tag} is logged in!`);
  client.user
    .setPresence({
      activity: {
        name: "sadn1ck segfault | !ctf",
        type: "WATCHING",
        details: "(1001)",
      },
    })
    .then(console.log)
    .catch(console.error);
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
        // if no args
      } else {
        const strNum = args[0];
        const num = parseInt(strNum, 10);
        if (num <= 0 || num > 10) {
          channel.send(
            "Please input a value b/w 1 and 10, don't want to overload CTFTime API ┬─┬ ノ( ゜-゜ノ)"
          );
        } else {
          getEvents(num, channel);
        }
      }
    } else if (CMD.toLowerCase() === "help") {
      const helpEmbed = new MessageEmbed()
        .setTitle("Usage:\n!ctf <command> [...args]")
        .addField("!ctf future n (n ∈ [1, 10]): ", "Displays n upcoming CTFs");
      channel.send(helpEmbed);
    } else {
      channel.send("INVALID COMMAND (╯°□°）╯︵ ┻━┻");
    }
  }
});

client.login(process.env.TOKEN);
