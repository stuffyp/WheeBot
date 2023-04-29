const { randInt } = require('../util/random.js');
const { MS_MINUTE } = require('../util/constants.js');

const TIMEOUT = 30 * MS_MINUTE;

const activeBattles = {};
const userToCombatID = {};

const refreshBattles = () => {
  Object.values(activeBattles).forEach((battle) => {
    if (battle.lastUpdated + TIMEOUT < Date.now()) endBattle(battle.combatID);
  });
}

const generateBattle = () => {
  let combatID = randInt(999_999_999);
  while (activeBattles[combatID]) combatID = randInt(999_999_999);
  activeBattles[combatID] = {
    lastUpdated: Date.now(),
    combatID: combatID,
    users: [],
    readyUsers: [],
    listeners: [],
    GM: null,
  }; // placeholder
  return combatID;
}

const endBattle = (combatID) => {
  const users = activeBattles[combatID].users;
  activeBattles[combatID] = null;
  users.forEach((u) => {
    userToCombatID[u] = null;
  });
}

const updateBattle = (combatID) => { 
  activeBattles[combatID].lastUpdated = Date.now();
};

const getBattle = (combatID) => activeBattles[combatID];

const setGM = (combatID, gm) => {
  activeBattles[combatID].GM = gm;
}

const getCombatID = (userId) => {
  return userToCombatID[userId];
}

const setCombatID = (userId, combatID) => {
  userToCombatID[userId] = combatID;
  activeBattles[combatID].users.push(userId);
}

const readyUser = (userId) => {
  const combatID = userToCombatID[userId];
  if (combatID === null) return;
  const battle = activeBattles[combatID];
  if (battle && !battle.readyUsers.includes(userId)) battle.readyUsers.push(userId);
  if (battle.readyUsers.length >= 2) {
    battle.listeners.forEach((resolve) => {
      resolve();
    });
    battle.listeners = [];
    battle.readyUsers = [];
  }
}

const waitReady = (combatId) => {
  return new Promise((resolve, reject) => {
    activeBattles[combatId].listeners.push(() => { resolve() });
    setTimeout(() => { reject() }, TIMEOUT);
  });
}

const dump = () => {
  return activeBattles;
}

module.exports = {
  generateBattle,
  endBattle,
  getCombatID,
  setCombatID,
  getBattle,
  updateBattle,
  setGM,
  refreshBattles,
  readyUser,
  waitReady,
  dump,
}