const { Rarities, Types } = require('./enums.js');

const MS_SECOND = 1000;
const MS_MINUTE = 60 * MS_SECOND;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;

module.exports = {
  MS_SECOND: MS_SECOND,
  MS_MINUTE: MS_MINUTE,
  MS_HOUR: MS_HOUR,
  MS_DAY: MS_DAY,
  
  ROLL_COOLDOWN: 12 * MS_HOUR,
  COLLECTION_SIZE: 200,
  
  USER_TEMPLATE: {
    collection: [],
    stats: {
      lastRoll: 0,
    },
  },

  RARITY_COLOR: {
    [`${Rarities.Common}`]: 0x80ED99,
    [`${Rarities.Rare}`]: 0x00B4D8,
    [`${Rarities.Epic}`]: 0x6930C3,
    [`${Rarities.Legendary}`]: 0xFFBA08,
  },
}