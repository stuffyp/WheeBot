const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { endBattle, getBattle, updateBattle, waitReady } = require('./battle-storage.js');
const { MS_MINUTE, MAX_CARD_LEVEL } = require('../util/constants.js');
const { updateGlicko } = require('../util/glicko.js');
const { handleTurn, displayExpUpdates } = require('./ui.js');
const { syncUpdate } = require('../database.js');
const { expToNextLevel, giveExp } = require('../util/math-func.js');

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

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // get display from GM and write to channel
    const embeds = GM.display();
    const message = await channel.send({
      embeds: embeds,
      components: [actionRow],
    });

    // wait for commands from users -> queue to GM
    const messageFilter = (i) => ['action', 'endTurn', 'forfeit'].includes(i.customId) && users.includes(i.user.id);
    buttonCollector = message.createMessageComponentCollector({
      filter: messageFilter,
      time: TIME_LIMIT,
    });
    buttonCollector.on('collect', i => {
      if (battle.readyUsers.includes(i.user.id)) {
        i.deferUpdate();
        return;
      }
      handleTurn(i, GM.turn, (loser) => {
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
    if (!log.length) await channel.send('Nothing happened...');
    while (log.length) {
      const chunk = log.splice(0, 10);
      await channel.send(chunk.join('\n'));
    }

    // check win
    if (GM.gameOver) {
      buttonCollector.stop();
      finishBattle(GM.winner, combatID, channel);
      return;
    }
  }
};

const finishBattle = async (winner, combatID, channel, timeout = false) => {
  const battle = getBattle(combatID);
  if (!battle) return;
  const { users, GM } = battle;
  const fullUsers = GM.users;

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
      .addFields({ name: loserName, value: `${loserNewElo} (-${loserOldElo - loserNewElo})`, inline: true });
    if (timeout) embed.setDescription('Combat timed out.');

    channel.send({ embeds: [embed] });
  } else {
    const embed = new EmbedBuilder()
      .setTitle('⭐⭐⭐\tGAME OVER\t⭐⭐⭐')
      .addFields({ name: fullUsers[0].name, value: String(Math.round(fullUsers[0].elo)), inline: true })
      .addFields({ name: '\u200B', value: '\u200B', inline: true })
      .addFields({ name: fullUsers[1].name, value: String(Math.round(fullUsers[1].elo)), inline: true });
    if (timeout) embed.setDescription('Combat timed out.');

    channel.send({ embeds: [embed] });
  }

  //give exp
  const allUnits = GM.allUnits();
  const totalLevel = allUnits.reduce((cur, u) => cur + u.level, 0);
  const [user1, user2] = users;
  const unitUpdates = { [`${user1}`]: [], [`${user2}`]: [] };
  await syncUpdate(user1, user2, (userData1, userData2) => {
    allUnits.forEach(u => {
      const {user, unit, fullID} = u;
      const collection = (user === user1) ? userData1.cardCollection : userData2.cardCollection;
      const cardData = collection.find((c) => c.fullID === fullID);
      const expGain = giveExp(GM.totalCommands, totalLevel);
      cardData.exp += expGain;
      let levelUp = false;
      while (cardData.exp >= expToNextLevel(cardData.level) && cardData.level < MAX_CARD_LEVEL) {
        cardData.exp -= expToNextLevel(cardData.level);
        cardData.level++;
        levelUp = true;
      }
      unitUpdates[user].push([unit.simpleName, cardData.level, levelUp, expGain]);
    });
    return [userData1, userData2];
  });
  channel.send({embeds: displayExpUpdates(fullUsers, unitUpdates)});

  endBattle(combatID);
  // TODO
};

module.exports = {
  gameLoop,
};