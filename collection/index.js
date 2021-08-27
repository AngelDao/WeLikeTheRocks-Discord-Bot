require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const CLI = require("./cli");
const { getRocks } = require("./utils/getRocks");

let rocks;

client.on("ready", async (v, i) => {
  // rocks = await getRocks();
  await client.user.setActivity("ROCKS", { type: "WATCHING" });
});

client.on("message", async (message) => {
  const pattern = message.content.match(/^!{1}(rock)\s{1}[0-9]{1,2}$/i);
  console.log(pattern);
  console.log(message.content);
  if (message.author == client.user) {
    return;
  } else if (message.content === "!floor") {
    await CLI.floor(message, client, rocks);
    rocks = await getRocks();
  } else if (pattern) {
    console.log("matched");
    await CLI.rock(message, client);
  } else if (message.content === "!commands") {
    await CLI.commands(message, client);
  }
});

client.login(process.env.TOKEN);
