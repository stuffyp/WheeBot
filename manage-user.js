const Database = require("@replit/database");
const db = new Database();
const { Mutex } = require('async-mutex');
const { SortBy } = require('./util/enums.js');

const idToKey = userId => '_u_' + userId;
const locks = {};


//encapsulates atomic database operations via a mutex
module.exports = {
  init: async () => {
    const userKeys = await db.list('_u_');
    userKeys.forEach(key => {
      locks[key.slice(3)] = new Mutex();
    });
  }, // initializes all mutexes
  
  hasUser: async (userId) => {
    const val = await db.get(idToKey(userId));
    return val !== null;
  },
  
  makeUser: (userId) => {
    locks[userId] = new Mutex();
  },
  
  getUser: async (userId) => {
    const val = await db.get(idToKey(userId));
    if (val) return val;
    console.error(`User ${userId} does not exist.`);
  },
  
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
      switch (sortBy) {
        case SortBy.ID:
          userData.collection = userData.collection.sort((a, b) => {
            return (a.id === b.id) ? a.level - b.level : a.id - b.id;
          });
          break;
        case SortBy.ID_r:
          userData.collection = userData.collection.sort((a, b) => {
            return (a.id === b.id) ? b.level - a.level : b.id - a.id;
          });
          break;
        case SortBy.Level:
          userData.collection = userData.collection.sort((a, b) => {
            return (a.level === b.level) ? a.id - b.id : a.level - b.level;
          });
          break;
        case SortBy.Level_r:
          userData.collection = userData.collection.sort((a, b) => {
            return (a.level === b.level) ? b.id - a.id : b.level - a.level;
          });
          break;
        default:
          throw new Error(`${sortBy} is not a valid parameter to sort by.`);
      }
      await db.set(idToKey(userId), userData);
    });
  },
}