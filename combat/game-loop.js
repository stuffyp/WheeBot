const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { endBattle, getBattle, updateBattle, waitReady } = require('./battle-storage.js');
const { MS_MINUTE } = require('../util/constants.js');
const { newElo } = require('../util/math-func.js');
const { handleTurn } = require('./ui.js');
const { syncUpdate } = require('../manage-user.js');

const TIME_LIMIT = 5 * MS_MINUTE;

const chooseActionButton = new ButtonBuilder()
  .setCustomId('action')
  .setLabel('Choose Action')
  .setStyle(ButtonStyle.Primary);
const endTurnButton = new ButtonBuilder()
  .setCustomId('endTurn')
  .setLabel('End Turn')
  .setStyle(ButtonStyle.Secondary);
const forfeitButton = new ButtonBuilder()
  .setCustomId('forfeit')
  .setLabel('Forfeit')
  .setStyle(ButtonStyle.Danger);
const actionRow = new ActionRowBuilder()
  .addComponents(chooseActionButton)
  .addComponents(endTurnButton)
  .addComponents(forfeitButton);

const gameLoop = async (combatID, channel) => {
  const battle = getBattle(combatID);
  const { users, GM } = battle;

  let buttonCollector;

  while (true) {
    // get display from GM and write to channel
    const embeds = GM.display();
    const message = await channel.send({ 
      embeds: embeds,
      components: [actionRow],
    });
    
    // wait for commands from users -> queue to GM
    const messageFilter = (i) =>  ['action', 'endTurn', 'forfeit'].includes(i.customId) && users.includes(i.user.id);
    buttonCollector = message.createMessageComponentCollector({
      filter: messageFilter,
      time: TIME_LIMIT,
    });
    buttonCollector.on('collect', i => {
      if (battle.readyUsers.includes(i.user.id)) {
        i.deferUpdate();
        return;
      }
      handleTurn(i, (loser) => {
        const winner = users.find((u) => u !== loser);
        buttonCollector.stop();
        finishBattle(winner, combatID, channel);
      });
    });
    buttonCollector.on('end', () => {
      message.edit({ embeds: embeds, components: [] });
    });
  
    try {
      await waitReady(combatID);
    } catch (e) { 
      // TIMEOUT
      const winner = (acknowledgedUsers.length > 0) ? acknowledgedUsers[0] : null;
      finishBattle(winner, combatID, channel, true);
      return;
    }
    buttonCollector.stop();
    updateBattle(combatID);
    
    // when both users end turn, execute GM
    // write log to channel
    
    // check win
    if (GM.winner) {
      buttonCollector.stop();
      finishBattle(winner, combatID, channel);
      return;
    }
  }
}

const finishBattle = async (winner, combatID, channel, timeout=false) => {
  if (timeout) channel.send('Combat timed out.');
  const battle = getBattle(combatID);
  const { users, GM } = battle;
  
  if (winner) {
    const loser = users.find((u) => u !== winner);
    const winnerName = GM.users.find(u => u.id === winner).name;
    const loserName = GM.users.find(u => u.id === loser).name;
    let winnerELO;
    let loserELO;
    await syncUpdate(winner, loser, (winnerData, loserData) => {
      winnerELO = newElo(winnerData.stats.elo, loserData.stats.elo, 1);
      loserELO = newElo(loserData.stats.elo, winnerData.stats.elo, 0);
      winnerData.stats.elo = winnerELO;
      loserData.stats.elo = loserELO;
      return [winnerData, loserData];
    });
    channel.send(`${winnerName}: ${winnerELO}, ${loserName}: ${loserELO}`);
  };
  
  endBattle(combatID);
  // TODO
}

module.exports = {
  gameLoop,
}