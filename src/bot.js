require("dotenv").config();

const { Client, Message, MessageEmbed, Discord } = require("discord.js");
const axios = require("axios");
const client = new Client();
const { teamRegister, getTeamId } = require("./db");

const PREFIX = "!ctf ";
const EVENT_URL = "https://ctftime.org/api/v1/events/?limit=";
const TEAM_URL = "https://ctftime.org/api/v1/teams/";
const PAST_EVENTS_URL = "https://ctftime.org/api/v1/events/?start=";
const END_URL = "&finish=";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64; rv:82.0) Gecko/20100101 Firefox/82.0",
};

// @TODO: Add duration
getEvents = async (limit, channel) => {
  try {
    axios.get(EVENT_URL + limit, { headers: HEADERS }).then((resp) => {
      if (resp) {
        resp.data.forEach((ctf) => {
          const eventEmbed = new MessageEmbed()
            .setThumbnail(ctf.logo)
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
            .addField(
              "Duration: ",
              `${ctf.duration.days} day(s) ${ctf.duration.hours} hours`,
              true
            )
            .addField(
              "Finish Date: ",
              new Date(ctf.finish).toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
              }),
              true
            )
            .addField(
              "Finish Time: ",
              new Date(ctf.finish).toLocaleTimeString("en-IN", {
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

getPastEvents = async (limit, channel) => {
  try {
    let d = new Date();
    let timestamp = d.getTime();
    timestamp = Math.round(timestamp / 1000);
    let seconds = timestamp - limit * 86400;

    axios
      .get(PAST_EVENTS_URL + seconds + END_URL + timestamp, {
        headers: HEADERS,
      })
      .then((resp) => {
        if (resp.data.length > 0) {
          resp.data.forEach((ctf) => {
            const eventEmbed = new MessageEmbed()
              .setThumbnail(ctf.logo)
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
              .addField(
                "Duration: ",
                `${ctf.duration.days} day(s) ${ctf.duration.hours} hours`,
                true
              )
              .addField(
                "Finish Date: ",
                new Date(ctf.finish).toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }),
                true
              )
              .addField(
                "Finish Time: ",
                new Date(ctf.finish).toLocaleTimeString("en-IN", {
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
        } else {
          channel.send("There has been no ctfs in past " + limit + " days.");
        }
      });
  } catch (error) {
    console.log("Error: ", error);
  }
};
getTeamInfo = async (teamId, channel) => {
  console.log(teamId);
  try {
    const data = await axios
      .get(`${TEAM_URL}${teamId}/`, { headers: HEADERS })
      .then((resp) => {
        if (resp) {
          const teamData = resp.data;
          console.log(teamData);
          const ratingYear = Object.keys(teamData.rating[0])[0];
          const rating = teamData.rating[0][ratingYear];
          const eventEmbed = new MessageEmbed()
            .setTitle(teamData.name)
            .addField("ID: ", teamData.id, true)
            .addField(
              `Rating (${ratingYear})`,
              parseFloat(rating.rating_points).toFixed(2),
              true
            )
            .addField(`Rank (${ratingYear})`, rating.rating_place, true)
            .addField("Country: ", teamData.country, true)
            .addField(
              "Aliases: ",
              teamData.aliases.slice(0, 2).join(" , "),
              true
            )
            .setURL(`https://ctftime.org/team/${teamId}`);
          channel.send(eventEmbed);
        }
      });
  } catch (error) {
    console.error("Error: ", error);
    channel.send("Team name not registered.");
  }
};

client.on("ready", () => {
  console.log(` ${client.user.tag} is logged in!`);
  client.user
    .setPresence({
      activity: {
        name: "!ctf help",
        type: "WATCHING",
        details: "(1001)",
      },
    })
    .then(console.log)
    .catch(console.error);
});

client.on("message", async (msg) => {
  if (msg.content.startsWith(PREFIX)) {
    const [CMD, ...args] = msg.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    const channel = msg.channel;
    if (CMD.toLowerCase() === "future") {
      if (args.length === 0) {
        channel.send("Missing argument: n (no. of results wanted)");
        // if no args
      } else {
        const strNum = args[0];
        const num = parseInt(strNum, 10);
        if (num >= 1 && num <= 10 && num != NaN) {
          getEvents(num, channel);
        } else {
          channel.send(
            "Please input a value b/w 1 and 10, don't want to overload CTFTime API ┬─┬ ノ( ゜-゜ノ)"
          );
        }
      }
    } else if (CMD.toLowerCase() === "help") {
      const helpEmbed = new MessageEmbed()
        .setTitle("Usage:\n!ctf <command> [...args]")
        .addField("!ctf future n (n ∈ [1, 10])", "Displays n upcoming CTFs")
        .addField(
          "!ctf register <TeamName> <TeamID>",
          "Register team name with the CTFtime id"
        )
        .addField("!ctf showoff <TeamName>", "Displays team details");
      channel.send(helpEmbed);
    } else if (CMD.toLowerCase() === "register") {
      if (args.length != 2) {
        channel.send(PREFIX + "register <TeamName> <TeamID>");
      } else {
        const teamName = args[0];
        const teamId = args[1];
        teamRegister(teamName, teamId);
        channel.send(`Team ${teamName} registered with ID ${teamId}`);
      }
    } else if (CMD.toLowerCase() === "showoff") {
      if (args.length != 1) {
        channel.send(PREFIX + "showoff <team-name>");
      } else {
        const teamName = args[0];
        const teamId = await getTeamId(teamName);
        getTeamInfo(teamId, channel);
      }
    } else if (CMD.toLowerCase() === "past") {
      if (args.length === 0) {
        channel.send("Missing argument: n (no. of results wanted)");
        // if no args
      } else {
        const strNum = args[0];
        const num = parseInt(strNum, 10);

        if (num >= 1 && num <= 10 && num != NaN) {
          getPastEvents(num, channel);
        } else {
          channel.send(
            "Please input a value b/w 1 and 10, don't want to overload CTFTime API ┬─┬ ノ( ゜-゜ノ)"
          );
        }
      }
    } else {
      channel.send("INVALID COMMAND (╯°□°）╯︵ ┻━┻");
    }
  }
});

client.login(process.env.TOKEN);
