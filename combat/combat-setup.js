const {
  ActionRowBuilder,
  ButtonBuilder, ButtonStyle,
  // ModalBuilder,
  // TextInputBuilder, TextInputStyle,
  EmbedBuilder,
} = require('discord.js');
const { getUser } = require('../database.js');
const {
  getCombatID,
  // setCombatID,
  setGM,
  getBattle,
  updateBattle,
  waitReady,
} = require('./battle-storage.js');
const { parseParty } = require('../util/ui-logic.js');
const { MS_MINUTE } = require('../util/constants.js');
const GameMaster = require('../game-classes/game-master.js');
const { teamSelect } = require('./ui.js');
const { gameLoop } = require('./game-loop.js');

const chooseTeamButton = new ButtonBuilder()
  .setCustomId('team')
  .setLabel('Choose Starting Team')
  .setStyle(ButtonStyle.Primary);
const chooseTeamRow = new ActionRowBuilder().addComponents(chooseTeamButton);

const TIME_LIMIT = 5 * MS_MINUTE;

const startBattle = async (userId1, userId2, name1, name2, channel) => {
  const combatID = getCombatID(userId1);
  const user1 = await getUser(userId1);
  const user2 = await getUser(userId2);
  const gm = new GameMaster(channel)
    .loadUser(userId1, name1, user1.stats.glicko.elo)
    .loadUser(userId2, name2, user2.stats.glicko.elo);
  parseParty(user1).reduce((cur, card) => cur.loadUnit(card, userId1), gm);
  parseParty(user2).reduce((cur, card) => cur.loadUnit(card, userId2), gm);

  setGM(combatID, gm);
  const battle = getBattle(combatID);

  const embed = new EmbedBuilder()
    .setTitle('⚠️⚠️⚠️\tBATTLE\t⚠️⚠️⚠️')
    .addFields({ name: name1, value: `(${Math.round(user1.stats.glicko.elo)} R)`, inline: true })
    .addFields({ name: '\u200B', value: '\u200B', inline: true })
    .addFields({ name: name2, value: `(${Math.round(user2.stats.glicko.elo)} R)`, inline: true });

  const message = await channel.send({ embeds: [embed], components: [chooseTeamRow] });

  const messageFilter = (i) => [userId1, userId2].includes(i.user.id);
  const buttonCollector = message.createMessageComponentCollector({
    filter: messageFilter,
    time: TIME_LIMIT,
  });

  buttonCollector.on('collect', async i => {
    if (battle.readyUsers.includes(i.user.id)) {
      i.deferUpdate();
      return;
    }
    await teamSelect(i);
  });

  buttonCollector.on('end', () => {
    message.edit({ embeds: [embed], components: [] });
  });

  try {
    await waitReady(combatID);
  } catch (e) {
    return;
  }
  buttonCollector.stop();
  updateBattle(combatID);
  gameLoop(combatID, channel);
};

module.exports = {
  startBattle,
};