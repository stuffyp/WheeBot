const Database = require("@replit/database");
const db = new Database();
const { Mutex } = require('async-mutex');

const { SortBy } = require('./util/enums.js');

const { SHOP_SIZE, SHOP_REFRESH } = require('./util/constants.js');
const { rollItems } = require('./items/read-items.js');
const { getRarity } = require('./cards/read-cards.js');


const idToKey = userId => '_u_' + userId;
const locks = {};
const globalLock = new Mutex();


//encapsulates atomic database operations via a mutex
module.exports = {
  init: async () => {
    const userKeys = await db.list('_u_');
    userKeys.forEach(key => {
      locks[key.slice(3)] = new Mutex();
    });
    await db.set('shop', {
      lastUpdated: 0,
      items: [],
    })
  }, // initializes all mutexes

  makeUser: (userId) => {
    locks[userId] = new Mutex();
  },

  getUser: async (userId) => {
    const val = await db.get(idToKey(userId));
    return val;
  }, // returns null if user doesn't exist

  setUser: async (userId, value) => {
    await locks[userId].runExclusive(async () => {
      await db.set(idToKey(userId), value);
    });
  }, // should not be used after a call to getUser; use updateUser instead

  updateUser: async (userId, func) => {
    await locks[userId].runExclusive(async () => {
      const user = await db.get(idToKey(userId));
      const update = await func(user);
      if (update) await db.set(idToKey(userId), update);
    });
  },

  sortUser: async (userId, sortBy) => {
    await locks[userId].runExclusive(async () => {
      const userData = await db.get(idToKey(userId));
      if (userData === null) return;
      switch (sortBy) {
        case SortBy.ID:
          userData.collection = userData.collection.sort((a, b) => {
            const [aRarity, bRarity] = [getRarity(a.id), getRarity(b.id)];
            return aRarity - bRarity || a.id.localeCompare(b.id) || a.level - b.level;
          });
          break;
        case SortBy.ID_r:
          userData.collection = userData.collection.sort((a, b) => {
            const [aRarity, bRarity] = [getRarity(a.id), getRarity(b.id)];
            return bRarity - aRarity || b.id.localeCompare(a.id) || b.level - a.level;
          });
          break;
        case SortBy.Level:
          userData.collection = userData.collection.sort((a, b) => {
            const [aRarity, bRarity] = [getRarity(a.id), getRarity(b.id)];
            return a.level - b.level || aRarity - bRarity || a.id.localeCompare(b.id);
          });
          break;
        case SortBy.Level_r:
          userData.collection = userData.collection.sort((a, b) => {
            const [aRarity, bRarity] = [getRarity(a.id), getRarity(b.id)];
            return b.level - a.level || bRarity - aRarity || b.id.localeCompare(a.id);
          });
          break;
        default:
          throw new Error(`${sortBy} is not a valid parameter to sort by.`);
      }
      await db.set(idToKey(userId), userData);
    });
  },


  getShop: async () => {
    const shop = await db.get('shop');
    if (Date.now() > shop.lastUpdated + SHOP_REFRESH) {
      await globalLock.runExclusive(async () => {
        if (Date.now() <= shop.lastUpdated + SHOP_REFRESH) return; // someone else already refreshed
        shop.lastUpdated = Date.now() - Date.now() % SHOP_REFRESH;
        shop.items = rollItems(SHOP_SIZE);
        await db.set('shop', shop);
      });
    }
    return shop;
  }
}