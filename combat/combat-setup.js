const { 
  ActionRowBuilder, 
  ButtonBuilder, ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, TextInputStyle,
  EmbedBuilder 
} = require('discord.js');
const { getUser } = require('../manage-user.js');
const { 
  endBattle, 
  getCombatID, 
  setCombatID, 
  setGM, 
  getBattle,
  trueStartBattle,
} = require('./battle-storage.js');
const { parseParty } = require('../util/ui-logic.js');
const { MS_MINUTE } = require('../util/constants.js');
const GameMaster = require('../game-classes/game-master.js');
const { teamSelect } = require('./ui.js');

const chooseTeamButton = new ButtonBuilder()
  .setCustomId('team')
  .setLabel('Choose Starting Team')
  .setStyle(ButtonStyle.Primary);
const chooseTeamRow = new ActionRowBuilder().addComponents(chooseTeamButton);

const TIME_LIMIT = 5 * MS_MINUTE;

const startBattle = async (user1, user2, name1, name2, channel) => {
  const combatID = getCombatID(user1);
  const userData1 = await getUser(user1);
  const userData2 = await getUser(user2);
  const gm = new GameMaster(channel)
    .loadUser(user1, name1)
    .loadUser(user2, name2)
  parseParty(userData1).reduce((cur, card) => cur.loadUnit(card, user1), gm);
  parseParty(userData2).reduce((cur, card) => cur.loadUnit(card, user2), gm);

  setGM(combatID, gm);
  const battle = getBattle(combatID);

  const embed = new EmbedBuilder()
    .setTitle('⚠️⚠️⚠️\tBATTLE\t⚠️⚠️⚠️')
    .addFields({ name: name1, value: `(${userData1.stats.elo} R)`, inline: true })
    .addFields({ name: '\u200B', value: '\u200B', inline: true })
    .addFields({ name: name2, value: `(${userData2.stats.elo} R)`, inline: true })

  const message = await channel.send({ embeds: [embed], components: [chooseTeamRow] });

  const messageFilter = (i) => [user1, user2].includes(i.user.id);
  const buttonCollector = message.createMessageComponentCollector({
    filter: messageFilter,
    time: TIME_LIMIT,
  });
  
  buttonCollector.on('collect', async i => {
    await teamSelect(i);
    if (battle.readyUsers.length > 1) {
      message.edit({ embeds: [embed], components: [] });
      trueStartBattle(combatID);
    };
  });
  
  buttonCollector.on('end', () => {
    if (getBattle(combatID).inProgress) return;
    message.edit({
      content: 'Waited too long; aborting combat.',
      embeds: [],
      components: [],
    });
    endBattle(combatID);
  });
}

module.exports = {
  startBattle,
}