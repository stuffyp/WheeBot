const { randInt } = require('../util/random.js');

const activeBattles = {};

const getBattles = () => activeBattles;

const generateBattle = () => {
  let combatID = randInt(999_999_999);
  while (combatID in activeBattles) combatID = randInt(999_999_999);
  activeBattles[combatID] = {}; // placeholder
  return combatID;
}

module.exports = {
  generateBattle,
  getBattles,
}