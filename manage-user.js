const Database = require("@replit/database");
const db = new Database();
const { Mutex } = require('async-mutex');

const idToKey = userId => '_u_' + userId;
const locks = {};

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
}