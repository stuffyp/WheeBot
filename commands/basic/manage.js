const {
  ActionRowBuilder,
  ButtonBuilder, ButtonStyle,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder, TextInputStyle,
} = require('discord.js');
const { getUser, updateUser } = require('../../database.js');
const { fullDisplay } = require('../../cards/ui.js');
const { formatCardID, getCard } = require('../../cards/read-cards.js');
const { formatItemID, getItem } = require('../../items/read-items.js');
const { VERSION_NUMBER, MS_MINUTE, PARTY_SIZE } = require('../../util/constants.js');
const { FULL_NAV_EMOJIS, handleNav, askConfirmation, validateUser } = require('../../util/ui-logic.js');
const { retireCoins } = require('../../util/math-func.js');
const { getCombatID } = require('../../combat/battle-storage.js');

const TIME_LIMIT = 15 * MS_MINUTE;
const MODAL_TIME_LIMIT = MS_MINUTE;
const NUM_AUTOCOMPLETE = 7;

const data = new SlashCommandBuilder()
  .setName('manage')
  .setDescription('Manage your cards')
  .addStringOption(option =>
    option.setName('card_name')
      .setDescription('Name of the card you want to access')
      .setRequired(true)
      .setAutocomplete(true));

const autocomplete = async (interaction) => {
  const userId = interaction.user.id;
  const user = await getUser(userId);
  if (user === null || user.version !== VERSION_NUMBER) {
    await interaction.respond([]);
    return;
  }
  const focusedValue = formatCardID(interaction.options.getFocused());
  const cardIds = [...new Set(user.cardCollection.map((card) => card.id))];
  const matches = cardIds
    .filter((id) => id.startsWith(focusedValue))
    .slice(0, NUM_AUTOCOMPLETE)
    .sort();
  await interaction.respond(
    matches.map((id) => ({ name: getCard(id).name, value: id })),
  );
};

const execute = async interaction => {
  const userId = interaction.user.id;
  const user = await getUser(userId);
  const success = await validateUser(user, interaction);
  if (!success) return;

  const cardID = formatCardID(interaction.options.getString('card_name'));
  const subcollection = user.cardCollection.filter((card) => card.id === cardID);
  const party = user.party;
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
  const equipButton = new ButtonBuilder()
    .setCustomId('equip')
    .setLabel('Equip Item')
    .setStyle(ButtonStyle.Primary);
  const unequipButton = new ButtonBuilder()
    .setCustomId('unequip')
    .setLabel('Unequip Item')
    .setStyle(ButtonStyle.Primary);

  const equipModal = new ModalBuilder()
    .setCustomId('modal')
    .setTitle('Equip Item');
  const textInput = new TextInputBuilder()
    .setCustomId('itemName')
    .setLabel('Item Name:')
    .setStyle(TextInputStyle.Short);
  const actionRow = new ActionRowBuilder().addComponents(textInput);
  equipModal.addComponents(actionRow);

  const getButtons = (cardIndex) => {
    const row = new ActionRowBuilder();
    const card = subcollection[cardIndex];
    if (card.item) {
      row.addComponents(unequipButton);
    } else {
      row.addComponents(equipButton);
    }
    if (party.includes(card.fullID)) {
      row.addComponents(removePartyButton);
    } else if (party.length < PARTY_SIZE) {
      row.addComponents(addPartyButton);
    }
    return row.addComponents(retireButton);
  };

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

  const reactFilter = (reaction, u) => {
    return u.id === interaction.user.id && FULL_NAV_EMOJIS.includes(reaction.emoji.name);
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
  const messageFilter = (i) => ['retire', 'addParty', 'removeParty', 'equip', 'unequip'].includes(i.customId) && i.user.id === interaction.user.id;
  const buttonCollector = message.createMessageComponentCollector({
    filter: messageFilter,
    time: TIME_LIMIT,
  });
  buttonCollector.on('collect', async i => {
    const card = subcollection[cardIndex];

    switch (i.customId) {
      case 'retire': {
        const confirmation = await askConfirmation(i);
        if (confirmation) {
          reactionCollector.stop();
          buttonCollector.stop();
          await updateUser(userId, async (u) => {
            if (getCombatID(userId)) {
              await interaction.editReply({
                content: 'Oops! It appears that you are currently in battle. Command aborted.',
                embeds: [],
                components: [],
              });
              return null;
            }
            const coinGain = retireCoins(getCard(card.id).rarity, card.level);
            const updatedCollection = u.cardCollection.filter((c) => (c.fullID !== card.fullID));
            if (updatedCollection.length === u.cardCollection.length) {
              await interaction.editReply({
                content: 'Oops! It appears that your collection is out of sync. Command aborted.',
                embeds: [],
                components: [],
              });
              return null;
            }
            u.party = u.party.filter(c => (c !== card.fullID));
            u.cardCollection = updatedCollection;
            u.stats.coins += coinGain;
            await interaction.editReply({
              content: `You gained ${coinGain} coins!`,
              embeds: [],
              components: [],
            });
            return u;
          });
        }
        break;
      }

      case 'addParty':
        reactionCollector.stop();
        buttonCollector.stop();
        await updateUser(userId, async (u) => {
          if (getCombatID(userId)) {
            await interaction.editReply({
              content: 'Oops! It appears that you are currently in battle. Command aborted.',
              embeds: [],
              components: [],
            });
            return null;
          }
          if (
            u.cardCollection.every((c) => c.fullID !== card.fullID) ||
            u.party.includes(card.fullID) ||
            u.party.length >= PARTY_SIZE
          ) {
            await interaction.editReply({
              content: 'Oops! It appears that your collection is out of sync. Command aborted.',
              embeds: [],
              components: [],
            });
            return null;
          }
          u.party.push(card.fullID);
          await interaction.editReply({
            content: `${getCard(card.id).name} (Level ${card.level}) has been successfully added to the party.`,
            embeds: [],
            components: [],
          });
          return u;
        });
        break;

      case 'removeParty':
        reactionCollector.stop();
        buttonCollector.stop();
        await updateUser(userId, async (u) => {
          if (getCombatID(userId)) {
            await interaction.editReply({
              content: 'Oops! It appears that you are currently in battle. Command aborted.',
              embeds: [],
              components: [],
            });
            return null;
          }
          const updatedParty = u.party.filter((c) => c !== card.fullID);
          if (updatedParty.length === u.party.length) {
            await interaction.editReply({
              content: 'Oops! It appears that your collection is out of sync. Command aborted.',
              embeds: [],
              components: [],
            });
            return null;
          }
          u.party = updatedParty;
          await interaction.editReply({
            content: `${getCard(card.id).name} (Level ${card.level}) has been removed from the party.`,
            embeds: [],
            components: [],
          });
          return u;
        });
        break;

      case 'equip': {
        await i.showModal(equipModal);
        const submitted = await i.awaitModalSubmit({
          filter: (ii) => ii.customId === 'modal',
          time: MODAL_TIME_LIMIT,
        }).catch(error => {
          console.error(error);
        });
        if (!submitted) break;
        reactionCollector.stop();
        buttonCollector.stop();
        submitted.deferUpdate();
        const itemName = submitted.fields.getTextInputValue('itemName');
        const itemID = formatItemID(itemName);

        await updateUser(userId, async (u) => {
          if (getCombatID(userId)) {
            await interaction.editReply({
              content: 'Oops! It appears that you are currently in battle. Command aborted.',
              embeds: [],
              components: [],
            });
            return null;
          }
          const originalCard = u.cardCollection.find((c) => c.fullID === card.fullID);
          const available = u.cardCollection.filter((c) => c.item === itemID).length < u.items.get(itemID);
          if (!originalCard || originalCard.item) {
            await interaction.editReply({
              content: 'Oops! It appears that your collection is out of sync. Command aborted.',
              embeds: [],
              components: [],
            });
            return null;
          }
          if (!available) {
            await interaction.editReply({
              content: 'The item you are looking for does not exist in your inventory (check your spelling).',
              embeds: [],
              components: [],
            });
            return null;
          }
          await interaction.editReply({
            content: `${getItem(itemID).name} has been equipped.`,
            // TODO
            embeds: [],
            components: [],
          });
          originalCard.item = itemID;
          return u;
        });
        break;
      }

      case 'unequip':
        reactionCollector.stop();
        buttonCollector.stop();
        await updateUser(userId, async (u) => {
          if (getCombatID(userId)) {
            await interaction.editReply({
              content: 'Oops! It appears that you are currently in battle. Command aborted.',
              embeds: [],
              components: [],
            });
            return null;
          }
          const originalCard = u.cardCollection.find((c) => c.fullID === card.fullID);
          if (!(originalCard && originalCard.item)) {
            await interaction.editReply({
              content: 'Oops! It appears that your collection is out of sync. Command aborted.',
              embeds: [],
              components: [],
            });
            return null;
          }
          await interaction.editReply({
            content: `${getItem(originalCard.item).name} has been unequipped.`,
            embeds: [],
            components: [],
          });
          originalCard.item = null;
          return u;
        });
        break;
    }
  });
};

module.exports = {
	data,
  autocomplete,
	execute,
};