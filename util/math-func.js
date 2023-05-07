const { Types, Rarities } = require('./enums.js');
const { randRange } = require('./random.js');
const { MAX_CARD_LEVEL } = require('./constants.js');

const TYPE_ADVANTAGE = {
  [`${Types.Fire}`]: {
    [`${Types.Fire}`]: 1,
    [`${Types.Water}`]: 0.5,
    [`${Types.Plant}`]: 2,
    [`${Types.Earth}`]: 1,
    [`${Types.Wind}`]: 0.5,
    [`${Types.Shock}`]: 1,
    [`${Types.Beast}`]: 2,
    [`${Types.Mystic}`]: 1,
    [`${Types.None}`]: 1,
  },
  [`${Types.Water}`]: {
    [`${Types.Fire}`]: 2,
    [`${Types.Water}`]: 1,
    [`${Types.Plant}`]: 0.5,
    [`${Types.Earth}`]: 2,
    [`${Types.Wind}`]: 1,
    [`${Types.Shock}`]: 0.5,
    [`${Types.Beast}`]: 1,
    [`${Types.Mystic}`]: 1,
    [`${Types.None}`]: 1,
  },
  [`${Types.Plant}`]: {
    [`${Types.Fire}`]: 0.5,
    [`${Types.Water}`]: 2,
    [`${Types.Plant}`]: 1,
    [`${Types.Earth}`]: 2,
    [`${Types.Wind}`]: 1,
    [`${Types.Shock}`]: 1,
    [`${Types.Beast}`]: 0.5,
    [`${Types.Mystic}`]: 1,
    [`${Types.None}`]: 1,
  },
  [`${Types.Earth}`]: {
    [`${Types.Fire}`]: 1,
    [`${Types.Water}`]: 0.5,
    [`${Types.Plant}`]: 0.5,
    [`${Types.Earth}`]: 1,
    [`${Types.Wind}`]: 1,
    [`${Types.Shock}`]: 2,
    [`${Types.Beast}`]: 2,
    [`${Types.Mystic}`]: 1,
    [`${Types.None}`]: 1,
  },
  [`${Types.Wind}`]: {
    [`${Types.Fire}`]: 2,
    [`${Types.Water}`]: 1,
    [`${Types.Plant}`]: 1,
    [`${Types.Earth}`]: 1,
    [`${Types.Wind}`]: 1,
    [`${Types.Shock}`]: 1,
    [`${Types.Beast}`]: 1,
    [`${Types.Mystic}`]: 0.5,
    [`${Types.None}`]: 1,
  },
  [`${Types.Shock}`]: {
    [`${Types.Fire}`]: 1,
    [`${Types.Water}`]: 2,
    [`${Types.Plant}`]: 1,
    [`${Types.Earth}`]: 0.5,
    [`${Types.Wind}`]: 1,
    [`${Types.Shock}`]: 1,
    [`${Types.Beast}`]: 1,
    [`${Types.Mystic}`]: 1,
    [`${Types.None}`]: 1,
  },
  [`${Types.Beast}`]: {
    [`${Types.Fire}`]: 0.5,
    [`${Types.Water}`]: 1,
    [`${Types.Plant}`]: 2,
    [`${Types.Earth}`]: 0.5,
    [`${Types.Wind}`]: 1,
    [`${Types.Shock}`]: 1,
    [`${Types.Beast}`]: 1,
    [`${Types.Mystic}`]: 2,
    [`${Types.None}`]: 1,
  },
  [`${Types.Mystic}`]: {
    [`${Types.Fire}`]: 1,
    [`${Types.Water}`]: 1,
    [`${Types.Plant}`]: 1,
    [`${Types.Earth}`]: 1,
    [`${Types.Wind}`]: 2,
    [`${Types.Shock}`]: 1,
    [`${Types.Beast}`]: 0.5,
    [`${Types.Mystic}`]: 1,
    [`${Types.None}`]: 1,
  },
  [`${Types.None}`]: {
    [`${Types.Fire}`]: 1,
    [`${Types.Water}`]: 1,
    [`${Types.Plant}`]: 1,
    [`${Types.Earth}`]: 1,
    [`${Types.Wind}`]: 1,
    [`${Types.Shock}`]: 1,
    [`${Types.Beast}`]: 1,
    [`${Types.Mystic}`]: 1,
    [`${Types.None}`]: 1,
  },
};

const RARITY_COIN_MULT = {
  [`${Rarities.Common}`]: 1,
  [`${Rarities.Rare}`]: 2,
  [`${Rarities.Epic}`]: 4,
  [`${Rarities.Legendary}`]: 8,
};

const retireCoins = (rarity, level) => {
  return Math.floor(Math.pow(level + 20, 2) * RARITY_COIN_MULT[rarity] * randRange(75, 125) / 400);
};

const typeAdvantage = (attackType, defenseTypes) => {
  return defenseTypes.reduce((cur, dType) => cur * TYPE_ADVANTAGE[attackType][dType], 1);
};

const damageCalc = (power, attack, defense, attackType, defenseTypes) => {
  return Math.ceil(power * attack * typeAdvantage(attackType, defenseTypes) / defense);
};

const expToNextLevel = (level) => level === MAX_CARD_LEVEL ? 0 : 10 * Math.round((9 + level)**3 / 100);

const giveExp = (totalCommands, totalLevel) => {
  return Math.round((15 + totalLevel) * (10 + totalCommands) * (1.5 + Math.random()) / 20);
}

module.exports = {
  retireCoins,
  typeAdvantage,
  damageCalc,
  expToNextLevel,
  giveExp,
};