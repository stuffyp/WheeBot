const { endBattle, getBattle } = require('./battle-storage.js');

const gameLoop = (combatID, channel) => {
  const battle = getBattle(combatID);
  const { users, GM } = battle;

  while (true) {
    battle.readyUsers = [];
    // get display from GM and write to channel
    channel.send({ embeds: [GM.display()] });
    // wait for commands from users -> queue to GM
    // when both users end turn, execute GM
    // write log to channel
    // check win
    break;
  }
}

module.exports = {
  gameLoop,
}