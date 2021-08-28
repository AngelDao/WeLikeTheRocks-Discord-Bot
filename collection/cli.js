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

const etherRockInterface = new ethers.utils.Interface(RockABI);

const api = require("etherscan-api").init(process.env.ETHERSCAN);

const getLowest = (rocks) => {  
  let floorRock = rocks.reduce((prev,curr) => {
    return parseFloat(prev.price) < parseFloat(curr.price) ? prev : curr;
  });

  return [floorRock.price, floorRock.rock_number];
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
