const { SlashCommandBuilder } = require('discord.js');
const { VERSION_NUMBER, MS_MINUTE } = require("../../util/constants.js");
const { SortBy } = require("../../util/enums.js");
const { displaySlice, fullDisplay } = require("../../cards/util.js");
const { getUser, sortUser } = require("../../manage-user.js");

const TIME_LIMIT = 15 * MS_MINUTE;
const SLICE_SIZE = 10; // number of cards at a time

const NAVIGATION_EMOJIS = ['⏮️', '⬅️', '➡️', '⏭️'];
const FULL_NAVIGATION_EMOJIS = ['⏮️', '⏪', '⬅️', '➡️', '⏩', '⏭️'];

const executeView = async (interaction) => {
  const user = interaction.user.id;
  await sortUser(user, interaction.options.getString('sortby'));
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

  const maxSliceIndex = userData.collection.length - userData.collection.length % SLICE_SIZE;
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
    return user.id === interaction.user.id && NAVIGATION_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    switch (reaction.emoji.name) {
      case '⏮️':
        sliceIndex = 0;
        break;
      case '⬅️':
        sliceIndex -= SLICE_SIZE;
        if (sliceIndex < 0) {
          sliceIndex = maxSliceIndex;
        }
        break;
      case '➡️':
        sliceIndex += SLICE_SIZE;
        if (sliceIndex > maxSliceIndex) {
          sliceIndex = 0;
        }
        break;
      case '⏭️':
        sliceIndex = maxSliceIndex;
        break;
      default:
        console.error('An unexpected reaction was recorded: ' + reaction);
        return;
    }
    interaction.editReply(displaySlice(userData.collection, sliceIndex, SLICE_SIZE));
  });
}


const executeManage = async (interaction) => {
  const user = interaction.user.id;
  await sortUser(user, interaction.options.getString('sortby'));
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
    return user.id === interaction.user.id && FULL_NAVIGATION_EMOJIS.includes(reaction.emoji.name);
  };
  const collector = message.createReactionCollector({ filter, time: TIME_LIMIT });

  collector.on('collect', (reaction) => {
    switch (reaction.emoji.name) {
      case '⏮️':
        cardIndex = 0;
        break;
      case '⏪':
        cardIndex = Math.max(cardIndex - 10, 0);
        break;
      case '⬅️':
        cardIndex--;
        if (cardIndex < 0) {
          cardIndex = maxCardIndex;
        }
        break;
      case '➡️':
        cardIndex++;
        if (cardIndex > maxCardIndex) {
          cardIndex = 0;
        }
        break;
      case '⏩':
        cardIndex = Math.min(cardIndex + 10, maxCardIndex);
        break;
      case '⏭️':
        cardIndex = maxCardIndex;
        break;
      default:
        console.error('An unexpected reaction was recorded: ' + reaction);
        return;
    }
    interaction.editReply({
      embeds: [fullDisplay(userData.collection[cardIndex], cardIndex, userData.collection.length)],
    });
  });
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('collection')
    .setDescription('View your collection')
    .addSubcommand(subcommand =>
  		subcommand
  			.setName('view')
  			.setDescription('View your collection')
        .addStringOption(option =>
      		option.setName('sortby')
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
  			.setDescription('Manage your collection')
        .addStringOption(option =>
      		option.setName('sortby')
      			.setDescription('Method to sort by')
      			.setRequired(true)
      			.addChoices(
      				{ name: 'Rarity', value: SortBy.ID },
      				{ name: 'Rarity (reverse)', value: SortBy.ID_r },
      				{ name: 'Level', value: SortBy.Level },
              { name: 'Level (reverse)', value: SortBy.Level_r },
      			))),
	async execute(interaction) {
    if (interaction.options.getSubcommand() === 'view') {
      executeView(interaction);
    } else {
      executeManage(interaction);
    }
	},
};