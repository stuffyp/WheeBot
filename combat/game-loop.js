const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { endBattle, getBattle, updateBattle, waitReady } = require('./battle-storage.js');
const { MS_MINUTE } = require('../util/constants.js');
const { updateGlicko } = require('../util/glicko.js');
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
      const winner = (battle.readyUsers.length > 0) ? battle.readyUsers[0] : null;
      finishBattle(winner, combatID, channel, true);
      return;
    }
    buttonCollector.stop();
    updateBattle(combatID);
    
    // when both users end turn, execute GM
    GM.executeCommands();
    
    // write log to channel
    const log = GM.getLog();
    while (log.length) {
      const chunk = log.splice(0, 5);
      await channel.send(chunk.join('\n'));
    }
    
    // check win
    if (GM.gameOver) {
      buttonCollector.stop();
      finishBattle(GM.winner, combatID, channel);
      return;
    }
  }
}

const finishBattle = async (winner, combatID, channel, timeout=false) => {
  const battle = getBattle(combatID);
  if (!battle) return;
  const { users, GM } = battle;
  
  if (winner) {
    const loser = users.find((u) => u !== winner);
    const winnerName = GM.users.find(u => u.id === winner).name;
    const loserName = GM.users.find(u => u.id === loser).name;
    let winnerOldElo, loserOldElo, winnerNewElo, loserNewElo;
    await syncUpdate(winner, loser, (winnerData, loserData) => {
      winnerOldElo = Math.round(winnerData.stats.glicko.elo);
      loserOldElo = Math.round(loserData.stats.glicko.elo);
      updateGlicko(winnerData.stats.glicko, loserData.stats.glicko);
      winnerNewElo = Math.round(winnerData.stats.glicko.elo);
      loserNewElo = Math.round(loserData.stats.glicko.elo);
      return [winnerData, loserData];
    });
    const embed = new EmbedBuilder()
      .setTitle('⭐⭐⭐\tGAME OVER\t⭐⭐⭐')
      .addFields({ name: '🏆 ' + winnerName, value: `${winnerNewElo} (+${winnerNewElo - winnerOldElo})`, inline: true })
      .addFields({ name: '\u200B', value: '\u200B', inline: true })
      .addFields({ name: loserName, value: `${loserNewElo} (-${loserOldElo - loserNewElo})`, inline: true })
    if (timeout) embed.setDescription('Combat timed out.');

    channel.send({ embeds: [embed] });
  } else {
    const fullUsers = GM.users;
    const embed = new EmbedBuilder()
      .setTitle('⭐⭐⭐\tGAME OVER\t⭐⭐⭐')
      .addFields({ name: fullUsers[0].name, value: String(Math.round(fullUsers[0].elo)), inline: true })
      .addFields({ name: '\u200B', value: '\u200B', inline: true })
      .addFields({ name: fullUsers[1].name, value: String(Math.round(fullUsers[1].elo)), inline: true })
    if (timeout) embed.setDescription('Combat timed out.');

    channel.send({ embeds: [embed] });
  };
  
  endBattle(combatID);
  // TODO
}

module.exports = {
  gameLoop,
}