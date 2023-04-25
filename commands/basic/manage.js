const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { getUser, updateUser } = require("../../manage-user.js");
const { fullDisplay } = require("../../cards/ui.js");
const { getCard } = require("../../cards/read-cards.js");
const { VERSION_NUMBER, MS_MINUTE, PARTY_SIZE } = require("../../util/constants.js");
const { FULL_NAV_EMOJIS, handleNav, askConfirmation } = require("../../util/ui-logic.js");
const { retireCoins } = require("../../util/math-func.js");

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

    const cardID = interaction.options.getString('card_name').trim().toLowerCase();
    const subcollection = userData.collection.filter((card) => card.id === cardID);
    const party = userData.party;
    if (subcollection.length === 0) {
      await interaction.reply('Card not found in your collection (try checking your spelling).');
      return;
    }

    const retireButton = new ButtonBuilder()
      .setCustomId('retire')
      .setLabel('Retire')
      .setStyle(ButtonStyle.Primary);
    const addPartyButton = new ButtonBuilder()
      .setCustomId('addParty')
      .setLabel('Add to Party')
      .setStyle(ButtonStyle.Primary);
    const removePartyButton = new ButtonBuilder()
      .setCustomId('removeParty')
      .setLabel('Remove from Party')
      .setStyle(ButtonStyle.Primary);
    
    const notInPartyRow = new ActionRowBuilder()
      .addComponents(addPartyButton)
      .addComponents(retireButton);
    const inPartyRow = new ActionRowBuilder()
      .addComponents(removePartyButton)
      .addComponents(retireButton);
    const fullPartyRow = new ActionRowBuilder()
      .addComponents(retireButton);
    const getButtons = (cardIndex) => {
      if (party.includes(subcollection[cardIndex].fullID)) {
        return inPartyRow;
      }
      return (party.length >= PARTY_SIZE) ? fullPartyRow : notInPartyRow;
    }
    
    let cardIndex = 0;
    const maxCardIndex = subcollection.length - 1;
    const message = await interaction.reply({
      embeds: [fullDisplay(subcollection[cardIndex], cardIndex, subcollection.length)],
      components: [getButtons(cardIndex)],
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
        components: [getButtons(cardIndex)],
      });
    });

    // Create a message component interaction collector
    const messageFilter = (i) => ['retire', 'addParty', 'removeParty'].includes(i.customId) && i.user.id === interaction.user.id;
    const buttonCollector = message.createMessageComponentCollector({
      filter: messageFilter,
      time: TIME_LIMIT,
    });
    buttonCollector.on('collect', async i => {
      const card = subcollection[cardIndex];

    	switch (i.customId) {
        case 'retire':
          const confirmation = await askConfirmation(i);
          if (confirmation) {
            reactionCollector.stop();
            buttonCollector.stop();
            await updateUser(user, async (userData) => {
              const coinGain = retireCoins(getCard(card.id).rarity, card.level);
              const updatedCollection = userData.collection.filter((c) => (c.fullID !== card.fullID));
              if (updatedCollection.length === userData.collection.length) {
                await interaction.editReply({
                  content: `Oops! It appears that your collection is out of sync. Command aborted.`,
                  embeds: [],
                  components: [],
                });
                return null;
              }
              userData.party = userData.party.filter((c) => (c !== card.fullID));
              userData.collection = updatedCollection;
              userData.stats.coins += coinGain;
              await interaction.editReply({
                content: `You gained ${coinGain} coins!`,
                embeds: [],
                components: [],
              });
              return userData;
            });
          }
          break;

        case 'addParty':
          reactionCollector.stop();
          buttonCollector.stop();
          await updateUser(user, async (userData) => {
            if (
              userData.collection.every((c) => c.fullID !== card.fullID) || 
              userData.party.includes(card.fullID) || 
              userData.party.length >= PARTY_SIZE
            ) {
              await interaction.editReply({
                content: `Oops! It appears that your collection is out of sync. Command aborted.`,
                embeds: [],
                components: [],
              });
              return null;
            }
            userData.party.push(card.fullID);
            await interaction.editReply({
              content: `${getCard(card.id).name} (Level ${card.level}) has been successfully added to the party.`,
              embeds: [],
              components: [],
            });
            return userData;
          });
          break;

        case 'removeParty':
          reactionCollector.stop();
          buttonCollector.stop();
          await updateUser(user, async (userData) => {
            const updatedParty = userData.party.filter((c) => c !== card.fullID);
            if (updatedParty.length === userData.party.length) {
              await interaction.editReply({
                content: `Oops! It appears that your collection is out of sync. Command aborted.`,
                embeds: [],
                components: [],
              });
              return null;
            }
            userData.party = updatedParty;
            await interaction.editReply({
              content: `${getCard(card.id).name} (Level ${card.level}) has been removed from the party.`,
              embeds: [],
              components: [],
            });
            return userData;
          });
          break;
      }
    });
	},
};