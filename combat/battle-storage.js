const { randInt } = require('../util/random.js');

const activeBattles = {};

const getBattles = () => activeBattles;

const generateBattle = () => {
  let combatID = randInt(999_999_999);
  while (activeBattles[combatID]) combatID = randInt(999_999_999);
  activeBattles[combatID] = '0xDEADBEEF'; // placeholder
  return combatID;
}

const endBattle = (combatID) => {
  activeBattles[combatID] = null;
}

const registerGM = (combatID, gm) => {
  activeBattles[combatID] = gm;
}

module.exports = {
  generateBattle,
  getBattles,
  endBattle,
  registerGM,
}