const { SlashCommandBuilder } = require('discord.js');
const { getUser, updateUser } = require("../../manage-user.js");
const { getCard, getID } = require("../../cards/read-cards.js");
const { display } = require("../../cards/ui.js");
const {
  VERSION_NUMBER,
  COLLECTION_SIZE,
  CARD_DB_TEMPLATE,
} = require("../../util/constants.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give-card')
    .setDescription('Give yourself a specific card')
    .addStringOption(option =>
      option
        .setName('card_name')
        .setDescription('The card you want.')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.user.id;
    const userData = await getUser(user);
    if (userData === null) {
      await interaction.reply('Please register an account first.')
      return;
    }
    if (userData.version !== VERSION_NUMBER) {
      await interaction.reply('Please use the update command to update to the latest version of the game.');
      return;
    }

    await updateUser(user, async (userData) => {
      if (userData.collection.length >= COLLECTION_SIZE) {
        await interaction.reply('Your collection is already full.');
        return null;
      }

      const cardId = interaction.options.getString('card_name');
      const card = getCard(cardId);

      if (!card) {
        await interaction.reply('Card does not exist (try checking your spelling).')
        return null;
      }

      let text = `You have been given a ${card.name}!`;

      await interaction.reply({ content: text, embeds: [display(card)], });
      userData.idSeed++;

      userData.collection.push(CARD_DB_TEMPLATE(cardId, userData.idSeed))

      return userData;
    });
  },
};