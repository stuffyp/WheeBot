const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { MS_MINUTE } = require("../../util/constants.js");
const { randInt, randRange } = require('../../util/random.js');
const { getUser, updateUser } = require("../../manage-user.js");

const Database = require("@replit/database");
const db = new Database();

const TIME_LIMIT = 15 * MS_MINUTE;

const eloUpdate = async (userData, correct) => {
  let currentElo = userData.stats.guessElo;
  let delta = 0;
  if (correct) {
    delta = Math.max(5, Math.floor(100 - currentElo / 20) + randRange(-5, 6));
    currentElo += delta;
  } else {
    delta = Math.max(5, Math.floor(currentElo / 20) + randRange(-5, 6));
    currentElo -= delta;
  }
  userData.stats.guessElo = currentElo;
  return {
    userData,
    delta
  };
}

const data = new SlashCommandBuilder()
  .setName('guess')
  .setDescription('Guess if the Pokemon name is real or AI generated.');

const execute = async (interaction) => {
  const user = interaction.user.id;
  const userData = await getUser(user);
  if (userData === null) {
    await interaction.reply('Please register an account first.');
    return;
  }

  const pokemon = await db.get('pokemon')
  const exists = randInt(2) ? 'real' : 'fake';
  const name = pokemon[exists][randInt(pokemon[exists].length)];

  const realButton = new ButtonBuilder()
    .setCustomId('real')
    .setLabel('Real!')
    .setStyle(ButtonStyle.Success);

  const fakeButton = new ButtonBuilder()
    .setCustomId('fake')
    .setLabel('Fake!')
    .setStyle(ButtonStyle.Danger);

  const cancelButton = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(realButton, fakeButton, cancelButton)

  const response = await interaction.reply({ content: `**${name}**`, components: [row] });


  const collectorFilter = (i) => ['real', 'fake', 'cancel'].includes(i.customId) && i.user.id === interaction.user.id;
  try {
    const choice = await response.awaitMessageComponent({ filter: collectorFilter, time: TIME_LIMIT });

    if (choice.customId === 'cancel') {
      await choice.update({ content: `Quiz canceled by user.`, components: [] });

    } else if (choice.customId === exists) {
      let delta = 0;
      let elo = 0;
      await updateUser(user, async (userData) => {
        const upd = await eloUpdate(userData, true);
        delta = upd.delta;
        elo = upd.userData.stats.guessElo;
        return upd.userData;
      })
      await choice.update({ content: `💖 Nice work! 💖 \n **${name}** is indeed a ${exists} Pokemon. \n You gained ${delta} ELO. Your new rating is ${elo}.`, components: [] });

    } else {
      let delta = 0;
      let elo = 0;
      await updateUser(user, async (userData) => {
        const upd = await eloUpdate(userData, false);
        delta = upd.delta;
        elo = upd.userData.stats.guessElo;
        return upd.userData;
      })
      await choice.update({ content: `😈 Fooled! 😈 \n **${name}** is actually a ${exists} Pokemon. \n You lost ${delta} ELO. Your new rating is ${elo}.`, components: [] });
    }

  } catch (e) {
    console.error(e);
    await response.editReply({ content: 'Quiz response not received within 15 minutes, cancelled.', components: [] })
  }
};

module.exports = {
  data,
  execute,
};