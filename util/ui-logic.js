const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { MS_SECOND, VERSION_NUMBER } = require('./constants.js');

const NAV_EMOJIS = ['⏮️', '⬅️', '➡️', '⏭️'];
const FULL_NAV_EMOJIS = ['⏮️', '⏪', '⬅️', '➡️', '⏩', '⏭️'];
const JUMP_NAV_AMOUNT = 5;

const TIMEOUT = 30 * MS_SECOND;

const handleNav = (reaction, curIndex, maxIndex) => {
  switch (reaction.emoji.name) {
      case '⏮️':
          return 0;
      case '⏪':
          return Math.max(curIndex - JUMP_NAV_AMOUNT, 0);
      case '⬅️':
          return curIndex === 0 ? maxIndex : curIndex - 1;
      case '➡️':
          return curIndex === maxIndex ? 0 : curIndex + 1;
      case '⏩':
          return Math.min(curIndex + JUMP_NAV_AMOUNT, maxIndex);
      case '⏭️':
          return maxIndex;
      default:
          console.error(`An unexpected reaction was recorded: ${reaction}`);
          return null;
  }
};

// if interaction is a button press, use with deleteReply = true
// if interaction is the original slash command, use with deleteReply = false
// and remember to edit the reply to give the user some sort of confirmation
// and to let Discord know that you replied to the interaction
const askConfirmation = async (interaction, deleteReply = true, timeout = TIMEOUT) => {
  // returns a boolean if the user presses a button and null if the user ignores
  const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Danger);

  const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(confirm, cancel);

  const message = await interaction.reply({
      content: 'Are you sure you want to perform this action?',
      components: [row],
      ephemeral: true,
      fetchReply: true,
  });

  try {
      const collectorFilter = i => (
          i.user.id === interaction.user.id
          && ['confirm', 'cancel'].includes(i.customId)
      );
      const confirmation = await message.awaitMessageComponent({
          filter: collectorFilter,
          time: timeout,
      });

      if (confirmation.customId === 'confirm') {
          return true;
      } else if (confirmation.customId === 'cancel') {
          return false;
      }

  } catch (err) {
      console.error(`Error while waiting for confirmation: ${err}`);
      return null;
  } finally {
      if (deleteReply) await interaction.deleteReply();
  }
};

const validateUser = async (user, interaction) => {
  if (user === null) {
      await interaction.reply({
          content: 'It seems like you are not registered. Please use `/register` to register an account.',
          ephemeral: true,
      });
      return false;
  }
  if (user.version !== VERSION_NUMBER) {
    await interaction.reply({
      conent: 'Please use the `/update` command to update to the latest version of the game.',
      ephemeral: true,
    });
    return false;
  }
  return true;
};

const parseParty = user => {
  return user.party.map(fullID =>
    user.cardCollection.find((c) => c.fullID === fullID),
  );
};

module.exports = {
  NAV_EMOJIS,
  FULL_NAV_EMOJIS,
  handleNav,
  askConfirmation,
  validateUser,
  parseParty,
};