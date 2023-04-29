const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { endBattle, getBattle } = require('./battle-storage.js');

const chooseActionButton = new ButtonBuilder()
  .setCustomId('action')
  .setLabel('Choose Action')
  .setStyle(ButtonStyle.Primary);
const endTurnButton = new ButtonBuilder()
  .setCustomId('endTurn')
  .setLabel('End Turn')
  .setStyle(ButtonStyle.Danger);
const actionRow = new ActionRowBuilder()
  .addComponents(chooseActionButton)
  .addComponents(endTurnButton);

const gameLoop = async (combatID, channel) => {
  const battle = getBattle(combatID);
  const { users, GM } = battle;

  while (true) {
    // get display from GM and write to channel
    channel.send({ 
      embeds: GM.display(),
      components: [actionRow],
    });
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