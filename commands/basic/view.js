const { SlashCommandBuilder } = require('discord.js');
const {
  MS_MINUTE,
  MS_HOUR,
  ROLL_COOLDOWN,
  PARTY_SIZE,
  COLLECTION_SIZE,
} = require('../../util/constants.js');
const { NAV_EMOJIS, FULL_NAV_EMOJIS, handleNav, validateUser, parseParty } = require('../../util/ui-logic.js');
const { SortBy } = require('../../util/enums.js');
const { displaySlice, fullDisplay, imageDisplay } = require('../../cards/ui.js');
const { displayItemSlice } = require('../../items/ui.js');
const { getUser, sortUser } = require('../../database.js');

const TIME_LIMIT = 15 * MS_MINUTE;
const SLICE_SIZE = 10; // number of cards at a time
const INVENTORY_SLICE_SIZE = 10;

const executeView = async (interaction) => {
  const userId = interaction.user.id;
  const userCheck = await getUser(userId);
  const success = await validateUser(userCheck, interaction);
  if (!success) return;
  await sortUser(userId, interaction.options.getString('sort_by') ?? SortBy.ID);
  const user = await getUser(userId);
  if (user.cardCollection.length === 0) {
    await interaction.reply('Your collection is empty.');
    return;
  }

  const maxSliceIndex = Math.ceil(user.cardCollection.length / SLICE_SIZE) - 1;
  let sliceIndex = 0;
  const message = await interaction.reply({
    content: displaySlice(user.cardCollection, sliceIndex, SLICE_SIZE),
    fetchReply: true,
  });
  message.react('⏮️')
    .then(() => message.react('⬅️'))
    .then(() => message.react('➡️'))
    .then(() => message.react('⏭️'))
    .catch(error => console.error('One of the emojis failed to react:', error));
  const filter = (reaction, u) => {
    return u.id === interaction.user.id && NAV_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    sliceIndex = handleNav(reaction, sliceIndex, maxSliceIndex);
    interaction.editReply(displaySlice(user.cardCollection, sliceIndex, SLICE_SIZE));
  });
};


const executeDetailed = async (interaction) => {
  const userId = interaction.user.id;
  const userCheck = await getUser(userId);
  const success = await validateUser(userCheck, interaction);
  if (!success) return;
  await sortUser(userId, interaction.options.getString('sort_by') ?? SortBy.ID);
  const user = await getUser(userId);
  if (user.cardCollection.length === 0) {
    await interaction.reply('Your collection is empty.');
    return;
  }

  let cardIndex = 0;
  const maxCardIndex = user.cardCollection.length - 1;
  const [embed, file] = imageDisplay(user.cardCollection[cardIndex], cardIndex, user.cardCollection.length);
  const message = await interaction.reply({
    embeds: [embed],
    files: [file],
    fetchReply: true,
  });
  message.react('⏮️')
    .then(() => message.react('⏪'))
    .then(() => message.react('⬅️'))
    .then(() => message.react('➡️'))
    .then(() => message.react('⏩'))
    .then(() => message.react('⏭️'))
    .catch(error => console.error('One of the emojis failed to react:', error));
  const filter = (reaction, u) => {
    return u.id === interaction.user.id && FULL_NAV_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    cardIndex = handleNav(reaction, cardIndex, maxCardIndex);
    const [emb, fi] = imageDisplay(user.cardCollection[cardIndex], cardIndex, user.cardCollection.length);
    interaction.editReply({
      embeds: [emb],
      files: [fi],
    });
  });
};


const executeParty = async (interaction) => {
  const userId = interaction.user.id;
  const user = await getUser(userId);
  const success = await validateUser(user, interaction);
  if (!success) return;
  if (user.party.length === 0) {
    await interaction.reply('Your party is empty.');
    return;
  }

  const party = parseParty(user);
  let cardIndex = 0;
  const maxCardIndex = party.length - 1;
  const message = await interaction.reply({
    embeds: [fullDisplay(party[cardIndex], cardIndex, party.length)],
    fetchReply: true,
  });
  message.react('⏮️')
    .then(() => message.react('⬅️'))
    .then(() => message.react('➡️'))
    .then(() => message.react('⏭️'))
    .catch(error => console.error('One of the emojis failed to react:', error));
  const filter = (reaction, u) => {
    return u.id === interaction.user.id && NAV_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    cardIndex = handleNav(reaction, cardIndex, maxCardIndex);
    interaction.editReply({
      embeds: [fullDisplay(party[cardIndex], cardIndex, party.length)],
    });
  });
};


const executeStats = async (interaction) => {
  const userId = interaction.user.id;
  const user = await getUser(userId);
  const success = await validateUser(user, interaction);
  if (!success) return;

  const timeUntil = user.stats.lastRoll + ROLL_COOLDOWN - Date.now();
  const hoursUntil = Math.floor(timeUntil / MS_HOUR);
  const minutesUntil = Math.floor((timeUntil % MS_HOUR) / MS_MINUTE);

  const freeRollText = `🎲 Free Rolls: ${user.stats.freeRolls}`;
  const nextRollText = `🎲 Next Roll: ${(timeUntil > 0) ? `${hoursUntil} hours, ${minutesUntil} minutes` : 'Available'}`;
  const coinsText = `🪙 Coins: ${user.stats.coins}`;
  const uncertainty = user.stats.glicko.rd > 50 ? '?' : `±${Math.round(user.stats.glicko.rd * 2)}`;
  const eloText = `📈 Rating: ${Math.round(user.stats.glicko.elo)} (${uncertainty})`;
  const partySizeText = `👥 Party Size: ${user.party.length}/${PARTY_SIZE}`;
  const collectionSizeText = `👥 Collection Size: ${user.cardCollection.length}/${COLLECTION_SIZE}`;

  await interaction.reply({
    content: [
      freeRollText,
      nextRollText,
      coinsText,
      eloText,
      partySizeText,
      collectionSizeText,
    ].join('\n'),
//    ephemeral: true,
  });
};

const executeInventory = async (interaction) => {
  const userId = interaction.user.id;
  const user = await getUser(userId);
  const success = await validateUser(user, interaction);
  if (!success) return;
  const processedItems = Array.from(user.items.entries()).map(([id, quantity]) => (
    [id, quantity - user.cardCollection.filter((c) => c.item === id).length]
  // eslint-disable-next-line no-unused-vars
  )).filter(([id, quantity]) => quantity > 0);
  if (processedItems.length === 0) {
    await interaction.reply('Your inventory is empty.');
    return;
  }

  const maxSliceIndex = Math.ceil(processedItems.length / INVENTORY_SLICE_SIZE) - 1;
  let sliceIndex = 0;
  const message = await interaction.reply({
    embeds: [displayItemSlice(processedItems, sliceIndex, SLICE_SIZE)],
    fetchReply: true,
  });
  message.react('⏮️')
    .then(() => message.react('⬅️'))
    .then(() => message.react('➡️'))
    .then(() => message.react('⏭️'))
    .catch(error => console.error('One of the emojis failed to react:', error));
  const filter = (reaction, u) => {
    return u.id === interaction.user.id && NAV_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    sliceIndex = handleNav(reaction, sliceIndex, maxSliceIndex);
    interaction.editReply({ embeds: [displayItemSlice(processedItems, sliceIndex, SLICE_SIZE)] });
  });
};


module.exports = {
  data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('View your cards')
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('View your stats'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('party')
        .setDescription('View your party'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('inventory')
        .setDescription('View your inventory'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('collection')
        .setDescription('View your collection')
        .addStringOption(option =>
          option.setName('sort_by')
            .setDescription('Method to sort by')
            .addChoices(
              { name: 'Rarity', value: SortBy.ID },
              { name: 'Rarity (reverse)', value: SortBy.ID_r },
              { name: 'Level', value: SortBy.Level },
              { name: 'Level (reverse)', value: SortBy.Level_r },
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('detailed')
        .setDescription('View your collection in detail')
        .addStringOption(option =>
          option.setName('sort_by')
            .setDescription('Method to sort by')
            .addChoices(
              { name: 'Rarity', value: SortBy.ID },
              { name: 'Rarity (reverse)', value: SortBy.ID_r },
              { name: 'Level', value: SortBy.Level },
              { name: 'Level (reverse)', value: SortBy.Level_r },
            ))),
  async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case 'collection':
        executeView(interaction);
        break;
      case 'detailed':
        executeDetailed(interaction);
        break;
      case 'party':
        executeParty(interaction);
        break;
      case 'stats':
        executeStats(interaction);
        break;
      case 'inventory':
        executeInventory(interaction);
        break;
      default:
        console.error(`An unknown subcommand was registered: ${interaction.options.getSubcommand()}`);
    }
  },
};