const { randInt } = require('../util/random.js');
const { updateUser } = require('../manage-user.js');

const activeBattles = {};

const generateBattle = () => {
  let combatID = randInt(999_999_999);
  while (combatID in activeBattles) combatID = randInt(999_999_999);
  activeBattles[combatID] = {}; // placeholder
  return combatID;
}

const endBattle = async (userId) => {
  await updateUser(userId, async (userData) => {
    if (userData.combatID === null) return null;
    delete activeBattles[userData.combatID];
    userData.combatID = null;
    return userData;
  });
}

const startBattle = async (user1, user2) => {
  // pass
  endBattle(user1);
  endBattle(user2);
}

module.exports = {
  generateBattle,
  startBattle,
}