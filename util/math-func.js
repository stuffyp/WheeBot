const { Rarities } = require('./enums.js');

const RARITY_COIN_MULT = {
  [`${Rarities.Common}`]: 1,
  [`${Rarities.Rare}`]: 2,
  [`${Rarities.Epic}`]: 4,
  [`${Rarities.Legendary}`]: 8,
};

module.exports = {
  retireCoins: (rarity, level) => {
    return Math.floor(Math.pow(level + 20, 2) * RARITY_COIN_MULT[rarity] / 400) * 100;
  }
}