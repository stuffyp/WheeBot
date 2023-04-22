const { SlashCommandBuilder } = require('discord.js');
const { VERSION_NUMBER, MS_MINUTE } = require("../../util/constants.js");
const { NAV_EMOJIS, FULL_NAV_EMOJIS, handleNav } = require("../../util/ui-logic.js");
const { SortBy } = require("../../util/enums.js");
const { displaySlice, fullDisplay } = require("../../cards/ui.js");
const { getUser, sortUser } = require("../../manage-user.js");

const TIME_LIMIT = 15 * MS_MINUTE;
const SLICE_SIZE = 10; // number of cards at a time

const executeView = async (interaction) => {
  const user = interaction.user.id;
  await sortUser(user, interaction.options.getString('sort_by'));
  const userData = await getUser(user);
  if (userData === null) {
    await interaction.reply('Please register an account first.');
    return;
  }
  
  if (userData.version !== VERSION_NUMBER) {
    await interaction.reply('Please use the update command to update to the latest version of the game.');
    return;
  }
  if (userData.collection.length === 0) {
    await interaction.reply('Your collection is empty.');
    return;
  }

  const maxSliceIndex = Math.ceil(userData.collection.length / SLICE_SIZE) - 1;
  let sliceIndex = 0;
  const message = await interaction.reply({
    content: displaySlice(userData.collection, sliceIndex, SLICE_SIZE),
    fetchReply: true,
  });
  message.react('⏮️')
    .then(() => message.react('⬅️'))
    .then(() => message.react('➡️'))
    .then(() => message.react('⏭️'))
    .catch(error => console.error('One of the emojis failed to react:', error));
  const filter = (reaction, user) => {
    return user.id === interaction.user.id && NAV_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    sliceIndex = handleNav(reaction, sliceIndex, maxSliceIndex);
    interaction.editReply(displaySlice(userData.collection, sliceIndex, SLICE_SIZE));
  });
}


const executeDetailed = async (interaction) => {
  const user = interaction.user.id;
  await sortUser(user, interaction.options.getString('sort_by'));
  const userData = await getUser(user);
  if (userData === null) {
    await interaction.reply('Please register an account first.');
    return;
  }

  if (userData.version !== VERSION_NUMBER) {
    await interaction.reply('Please use the update command to update to the latest version of the game.');
    return;
  }
  if (userData.collection.length === 0) {
    await interaction.reply('Your collection is empty.');
    return;
  }

  let cardIndex = 0;
  const maxCardIndex = userData.collection.length - 1;
  const message = await interaction.reply({
    embeds: [fullDisplay(userData.collection[cardIndex], cardIndex, userData.collection.length)],
    fetchReply: true,
  });
  message.react('⏮️')
    .then(() => message.react('⏪'))
    .then(() => message.react('⬅️'))
    .then(() => message.react('➡️'))
    .then(() => message.react('⏩'))
    .then(() => message.react('⏭️'))
    .catch(error => console.error('One of the emojis failed to react:', error));
  const filter = (reaction, user) => {
    return user.id === interaction.user.id && FULL_NAV_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    cardIndex = handleNav(reaction, cardIndex, maxCardIndex);
    interaction.editReply({
      embeds: [fullDisplay(userData.collection[cardIndex], cardIndex, userData.collection.length)],
    });
  });
}


const executeParty = async (interaction) => {
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
  if (userData.party.length === 0) {
    await interaction.reply('Your party is empty.');
    return;
  }

  const party = userData.party.map((fullID) => userData.collection.find((c) => c.fullID == fullID));
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
  const filter = (reaction, user) => {
    return user.id === interaction.user.id && NAV_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    cardIndex = handleNav(reaction, cardIndex, maxCardIndex);
    interaction.editReply({
      embeds: [fullDisplay(party[cardIndex], cardIndex, party.length)],
    });
  });
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('view')
    .setDescription('View your cards')
    .addSubcommand(subcommand =>
  		subcommand
  			.setName('party')
  			.setDescription('View your party'))
    .addSubcommand(subcommand =>
  		subcommand
  			.setName('collection')
  			.setDescription('View your collection')
        .addStringOption(option =>
      		option.setName('sort_by')
      			.setDescription('Method to sort by')
      			.setRequired(true)
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
      			.setRequired(true)
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
      default:
        console.error(`An unknown subcommand was registered: ${interaction.options.getSubcommand()}`);
    }
	},
};