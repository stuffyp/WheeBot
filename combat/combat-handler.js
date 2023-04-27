const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../manage-user.js');
const { getBattles } = require('./battle-storage.js');
const { parseParty } = require('../util/ui-logic.js');
const { PARTY_SIZE } = require('../util/constants.js');
const { getCard } = require('../cards/read-cards.js');
const { getItem } = require('../items/read-items.js');
const GameMaster = require('../game-classes/game-master.js');

const endBattle = async (userId) => {
  activeBattles = getBattles();
  await updateUser(userId, async (userData) => {
    if (userData.combatID === null) return null;
    delete activeBattles[userData.combatID];
    userData.combatID = null;
    return userData;
  });
}

const startBattle = async (user1, user2, name1, name2, channel) => {
  const userData1 = await getUser(user1);
  const userData2 = await getUser(user2);
  const gm = new GameMaster()
    .loadUser(user1, name1)
    .loadUser(user2, name2)
  parseParty(userData1).reduce((cur, card) => cur.loadUnit(card, user1), gm);
  parseParty(userData2).reduce((cur, card) => cur.loadUnit(card, user2), gm);

  //TODO: delete
  const partyFields = []
  const numRows = Math.min(PARTY_SIZE, Math.max(party1.length, party2.length));
  for (let i = 0; i < numRows; i++ ) {
    const card1 = (i<party1.length) ? getCard(party1[i].id) : null;
    const itemID1 = card1 ? party1[i].item : null;
    const item1 = itemID1 ? getItem(itemID1).name : '\u200B';
    const name1 = card1 ? `${card1.name} (Level ${party1[i].level})` : '\u200B';
    const card2 = (i<party2.length) ? getCard(party2[i].id) : null;
    const itemID2 = card2 ? party2[i].item : null;
    const item2 = itemID2 ? getItem(itemID2).name : '\u200B';
    const name2 = card2 ? `${card2.name} (Level ${party2[i].level})` : '\u200B';
    partyFields.push({ name: name1, value: item1, inline: true });
    partyFields.push({ name: '\u200B', value: '\u200B', inline: true });
    partyFields.push({ name: name2, value: item2, inline: true });
  }
  const embed = new EmbedBuilder()
    .setTitle('⚠️⚠️⚠️\tBATTLE\t⚠️⚠️⚠️')
    .addFields({ name: name1, value: `(${userData1.stats.elo} R)`, inline: true })
    .addFields({ name: '\u200B', value: '\u200B', inline: true })
    .addFields({ name: name2, value: `(${userData2.stats.elo} R)`, inline: true })
    .addFields(partyFields)
  channel.send({
    embeds: [embed],
  });
  // pass
  endBattle(user1);
  endBattle(user2);
}

module.exports = {
  startBattle,
}