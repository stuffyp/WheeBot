const { SlashCommandBuilder } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();
const { VERSION_NUMBER, MS_MINUTE } = require("../../util/constants.js");
const { displaySlice, fullDisplay } = require("../../cards/util.js");

const TIME_LIMIT = 15 * MS_MINUTE;
const SLICE_SIZE = 10; // number of cards at a time

const NAVIGATION_EMOJIS = ['⏮️', '⬅️', '➡️', '⏭️'];
const FULL_NAVIGATION_EMOJIS = ['⏮️', '⏪', '⬅️', '➡️', '⏩', '⏭️'];

const executeView = async (interaction) => {
  const users = await db.get('users');
  if (!(interaction.user.id in users)) {
    await interaction.reply('Please register an account first.');
    return;
  }

  const user = users[interaction.user.id];
  if (user.version !== VERSION_NUMBER) {
    await interaction.reply('Please use the update command to update to the latest version of the game.');
    return;
  }

  const maxSliceIndex = user.collection.length - user.collection.length % SLICE_SIZE;
  let sliceIndex = 0;
  const message = await interaction.reply({
    content: displaySlice(user.collection, sliceIndex, SLICE_SIZE),
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
    interaction.editReply(displaySlice(user.collection, sliceIndex, SLICE_SIZE));
  });
}


const executeManage = async (interaction) => {
  const users = await db.get('users');
  if (!(interaction.user.id in users)) {
    await interaction.reply('Please register an account first.');
    return;
  }

  const user = users[interaction.user.id];
  if (user.version !== VERSION_NUMBER) {
    await interaction.reply('Please use the update command to update to the latest version of the game.');
    return;
  }

  let cardIndex = 0;
  const maxCardIndex = user.collection.length - 1;
  const message = await interaction.reply({
    embeds: [fullDisplay(user.collection[cardIndex], cardIndex, user.collection.length)],
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
      embeds: [fullDisplay(user.collection[cardIndex], cardIndex, user.collection.length)],
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
  			.setDescription('View your collection'))
    .addSubcommand(subcommand =>
  		subcommand
  			.setName('detailed')
  			.setDescription('Manage your collection')),
	async execute(interaction) {
    if (interaction.options.getSubcommand() === 'view') {
      executeView(interaction);
    } else {
      executeManage(interaction);
    }
	},
};