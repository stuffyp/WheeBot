const { Rarities, Types } = require('./enums.js');
// const { Modifier } = require('../game-classes/modifier.js');
// const { Listener } = require('../game-classes/listener.js');

const VERSION_NUMBER = '1.0';

const MS_SECOND = 1000;
const MS_MINUTE = 60 * MS_SECOND;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;

module.exports = {
  VERSION_NUMBER: VERSION_NUMBER,

  MS_SECOND: MS_SECOND,
  MS_MINUTE: MS_MINUTE,
  MS_HOUR: MS_HOUR,
  MS_DAY: MS_DAY,

  // 12 * MS_HOUR
  ROLL_COOLDOWN: 0,
  COLLECTION_SIZE: 200,
  PARTY_SIZE: 7,

  RARITY_COLOR: {
    [`${Rarities.Common}`]: 0x80ED99,
    [`${Rarities.Rare}`]: 0x00B4D8,
    [`${Rarities.Epic}`]: 0x6930C3,
    [`${Rarities.Legendary}`]: 0xFFBA08,
  },

  TYPE_EMOJI: {
    [`${Types.Fire}`]: '🔴',
    [`${Types.Water}`]: '🔵',
    [`${Types.Plant}`]: '🟢',
    [`${Types.Earth}`]: '🟤',
    [`${Types.Wind}`]: '⚪',
    [`${Types.Shock}`]: '🟡',
    [`${Types.Beast}`]: '🟠',
    [`${Types.Mystic}`]: '🟣',
    [`${Types.None}`]: '🔘',
  },

  ROLL_CHANCES: [0.5, 0.3, 0.15, 0.05],

  SHOP_REFRESH: 12 * MS_HOUR,
  SHOP_SIZE: 5,
};