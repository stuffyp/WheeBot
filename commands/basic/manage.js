const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { getUser, updateUser } = require("../../manage-user.js");
const { fullDisplay } = require("../../cards/ui.js");
const { getID } = require("../../cards/read-cards.js");
const { VERSION_NUMBER, MS_MINUTE } = require("../../util/constants.js");
const { FULL_NAV_EMOJIS, handleNav } = require("../../util/ui-logic.js");

const TIME_LIMIT = 15 * MS_MINUTE;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('manage')
		.setDescription('Manage your cards')
    .addStringOption(option =>
      option.setName('card_name')
        .setDescription('Name of the card you want to access')
        .setRequired(true)),
	async execute(interaction) {
    const user = interaction.user.id;
    const userData = await getUser(user);
    if (userData === null) {
      await interaction.reply('Please register an account first.');
      return;
    }
    if (userData.version !== VERSION_NUMBER) {
      await interaction.reply('Please use the update command to update to the latest version of the game.');
      return;
    }

    const cardID = getID(interaction.options.getString('card_name').trim());
    const subcollection = userData.collection.filter((card) => card.id === cardID);
    if (subcollection.length === 0) {
      await interaction.reply('Card not found in your collection (try checking your spelling).');
      return;
    }

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Retire')
      .setStyle(ButtonStyle.Danger);
    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);
    const confirmRow = new ActionRowBuilder()
      .addComponents(cancelButton, confirmButton);

    const retireButton = new ButtonBuilder()
      .setCustomId('retire')
      .setLabel('Retire')
      .setStyle(ButtonStyle.Primary);
    const mainRow = new ActionRowBuilder()
      .addComponents(retireButton);
    
    let cardIndex = 0;
    const maxCardIndex = subcollection.length - 1;
    const message = await interaction.reply({
      embeds: [fullDisplay(subcollection[cardIndex], cardIndex, subcollection.length)],
      components: [mainRow],
      fetchReply: true,
    });
    message.react('⏮️')
      .then(() => message.react('⏪'))
      .then(() => message.react('⬅️'))
      .then(() => message.react('➡️'))
      .then(() => message.react('⏩'))
      .then(() => message.react('⏭️'))
      .catch(error => console.error('One of the emojis failed to react:', error));
    
    const reactFilter = (reaction, user) => {
      return user.id === interaction.user.id && FULL_NAV_EMOJIS.includes(reaction.emoji.name);
    };
    const reactionCollector = message.createReactionCollector({ filter: reactFilter, time: TIME_LIMIT });
    reactionCollector.on('collect', (reaction) => {
      cardIndex = handleNav(reaction, cardIndex, maxCardIndex);
      interaction.editReply({
        embeds: [fullDisplay(subcollection[cardIndex], cardIndex, subcollection.length)],
      });
    });

    // Create a message component interaction collector
    const messageFilter = (i) => ['retire'].includes(i.customId) && i.user.id === interaction.user.id;
    const buttonCollector = message.createMessageComponentCollector({
      filter: messageFilter,
      time: TIME_LIMIT,
    });
    buttonCollector.on('collect', async i => {
    	switch (i.customId) {
        case 'retire':
          await i.reply(`TODO`);
          break;
      }
    });
	},
};