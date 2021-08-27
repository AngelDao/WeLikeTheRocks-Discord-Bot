require("dotenv").config();
const { ethers } = require("ethers");
const { EtherRock } = require("./addresses");
const RockABI = require("../abis/Rock.json");

const format = (rocks) => {
  return rocks.map((e) => [e.rock_number, e.price, e.owner, e.forSale]);
};

const getRocks = async () => {
  let provider;

  if (process.env.PROJECT_ID) {
    provider = new ethers.providers.InfuraProvider(
      "homestead",
      process.env.PROJECT_ID
    );
  }
  let order_book = [];
  const etherRock = new ethers.Contract(EtherRock, RockABI, provider);
  for (let i = 0; i < 100; i++) {
    const res = await etherRock.rocks(i);
    const price = ethers.utils.formatUnits(res.price.toString(), 18);
    const timesSold = res.timesSold.toString();
    const rock = {
      rock_number: i,
      owner: res.owner,
      forSale: res.currentlyForSale,
      price,
      timesSold,
    };
    // if (parseFloat(price) < 1 && res.currentlyForSale) {
    console.log(rock);
    order_book.push(rock);
    // }
  }
  console.log(order_book);
  return order_book;
};

module.exports = {
  getRocks,
};
