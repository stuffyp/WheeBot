const { Rarities } = require('./util/enums.js');
const Database = require("@replit/database");
const db = new Database();
const { startBattle } = require('./combat/combat-setup.js');
const { dump } = require('./combat/battle-storage.js');

db.list().then(async (keys) => {
  for (const key of keys) {
    if (key.startsWith('_u_')) {
      const userData = await db.get(key);
      userData.party = [];
      await db.set(key, userData);
    }
  }
});