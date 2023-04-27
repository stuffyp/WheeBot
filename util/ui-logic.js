const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { MS_SECOND, VERSION_NUMBER } = require('./constants.js');

const TIMEOUT = 30 * MS_SECOND;

module.exports = {
  NAV_EMOJIS: ['⏮️', '⬅️', '➡️', '⏭️'],
  FULL_NAV_EMOJIS: ['⏮️', '⏪', '⬅️', '➡️', '⏩', '⏭️'],
  handleNav: (reaction, curIndex, maxIndex) => {
    switch (reaction.emoji.name) {
      case '⏮️':
        return 0;
      case '⏪':
        return Math.max(curIndex - 10, 0);
      case '⬅️':
        return curIndex === 0 ? maxIndex : curIndex - 1;
      case '➡️':
        return curIndex === maxIndex ? 0 : curIndex + 1;
      case '⏩':
        return Math.min(curIndex + 10, maxIndex);
      case '⏭️':
        return maxIndex;
      default:
        console.error('An unexpected reaction was recorded: ' + reaction);
        return null;
    }
  },

  // if interaction is a button press, then use with deleteReply = true
  // if interaction is the original slash command, then use deleteReply = false
  // and remember to edit the reply to give the user some sort of confirmation
  // and to let discord know that you replied to the interaction
  askConfirmation: async (interaction, deleteReply=true, timeout=TIMEOUT) => {
    // returns a boolean if the user presses a button and null if the user ignores
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
      .addComponents(cancel, confirm);

    const message = await interaction.reply({
      content: `Are you sure you want to perform this action?`,
      components: [row],
      ephemeral: true,
    });

    let returnValue;
    try {
      const confirmation = await message.awaitMessageComponent({ time: timeout });
    
      if (confirmation.customId === 'confirm') {
        returnValue = true;
      } else if (confirmation.customId === 'cancel') {
        returnValue = false;
      }
    } catch (e) {
      returnValue = null;
    } finally {
      if (deleteReply) await interaction.deleteReply();
      return returnValue;
    }
  },

  validateUser: async (userData, interaction) => {
    if (userData === null) {
      await interaction.reply({
        content: 'Please register an account first.',
        ephemeral: true,
      });
      return false;
    }
    if (userData.version !== VERSION_NUMBER) {
      await interaction.reply({
        conent: 'Please use the update command to update to the latest version of the game.',
        ephemeral: true,
      });
      return false;
    }
    return true;
  },

  parseParty: (userData) => {
    return userData.party.map((fullID) => userData.collection.find((c) => c.fullID === fullID));
  }
}