require("dotenv").config();
const { ethers } = require("ethers");
const { EtherRock } = require("./utils/addresses");
const RockABI = require("./abis/Rock.json");
const pics = require("./utils/rockPICS");

let provider;

if (process.env.PROJECT_ID) {
  provider = new ethers.providers.InfuraProvider(
    "homestead",
    process.env.PROJECT_ID
  );
}

const abiCoder = ethers.utils.defaultAbiCoder;

const etherRock = new ethers.Contract(EtherRock, RockABI, provider);

const etherRockInterface = new ethers.utils.Interface(RockABI);

const api = require("etherscan-api").init(process.env.ETHERSCAN);

const getLowest = (rocks) => {
  let lowest;
  let rock;
  rocks.forEach((r) => {
    if (lowest) {
      if (r.price < lowest) {
        lowest = r.price;
        rock = r.rock_number;
      }
    } else {
      lowest = r.price;
      rock = r.rock_number;
    }
  });
  return [parseFloat(lowest), rock];
};

const CLI = {
  commands: async (message) => {
    await message.channel.send("```commands:\n!floor\n!rock [rocknumber]```");
  },
  floor: async (message, _client, rocks) => {
    const txs = (
      await api.account.txlist(EtherRock, 13105682, "latest", 1, 1000, "desc")
    ).result;
    // console.log(txs[0]);
    for (let i = 0; i < txs.length; i++) {
      let input;
      try {
        input = etherRockInterface.decodeFunctionData("buyRock", txs[i].input);
      } catch (e) {
        // console.log("not a buy");
      }
      if (input) {
        const rockNumber = parseInt(input.rockNumber.toString());
        const blockNumber = txs[i].blockNumber;
        const value = parseFloat(
          ethers.utils.formatUnits(txs[i].value.toString(), 18)
        );

        console.log(blockNumber);
        console.log(rockNumber, "rockNumber");
        console.log(value, "ETH");

        if (rockNumber < 100) {
          const [lowest, rock] = getLowest(rocks);
          await message.channel.send(
            `Last sold Rock was #**${rockNumber} at ${value}ETH**\n\nThe lowest available Rock is **#${rock} at ${lowest}ETH**`
          );
          break;
        }
      }
    }
  },

  rock: async (message, client) => {
    const number = message.content.split(" ")[1];
    message.channel.send(pics[number]);
  },
};

module.exports = CLI;
