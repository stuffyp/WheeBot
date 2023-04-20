const { Rarities, Types } = require('./enums.js');

const VERSION_NUMBER = "1.0";

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
  
  ROLL_COOLDOWN: 0,//12 * MS_HOUR,
  COLLECTION_SIZE: 200,
  PARTY_SIZE: 8,
  
  USER_TEMPLATE: {
    collection: [],
    party: [],
    stats: {
      lastRoll: 0,
      coins: 0,
    },
    idSeed: 12345,
    version: VERSION_NUMBER,
  },

  CARD_DB_TEMPLATE: (id, fullID) => ({
    id: id,
    level: 1,
    exp: 0,
    fullID: fullID,
  }),

  RARITY_COLOR: {
    [`${Rarities.Common}`]: 0x80ED99,
    [`${Rarities.Rare}`]: 0x00B4D8,
    [`${Rarities.Epic}`]: 0x6930C3,
    [`${Rarities.Legendary}`]: 0xFFBA08,
  },
  ROLL_CHANCES: [0.4, 0.3, 0.2, 0.1],
}