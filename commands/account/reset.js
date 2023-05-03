const { SlashCommandBuilder } = require('discord.js');
const { getUser, resetUser, updateUser } = require('../../database.js');
const { askConfirmation, validateUser } = require('../../util/ui-logic.js');
const { getCombatID } = require('../../combat/battle-storage.js');

const data = new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset your account.');

const execute = async (interaction) => {
    const userId = interaction.user.id;
    const user = await getUser(userId);
    const success = await validateUser(user, interaction);
    if (!success) return;

    if (getCombatID(userId)) {
      await interaction.reply({
        content: 'Command failed. You are currently in a battle.',
        ephemeral: true,
      });
      return;
    }

    const confirmation = await askConfirmation(interaction, false);
    // when deleteReply is set to false, askConfirmation will create
    // a reply to the interaction which is why editReply is called below

    if (confirmation === null) {
      await interaction.editReply({
        content: 'Response timed out.',
        components: [],
        ephemeral: true,
      });
      return;
    }

    if (confirmation) {
      if (getCombatID(userId)) {
        await interaction.editReply({
          content: 'Command failed. You are currently in a battle.',
          ephemeral: true,
        });
        return null;
      }

      const oldIdSeed = user.idSeed;
      await resetUser(userId);
      await updateUser(userId, async u => {
        u.idSeed = oldIdSeed;
        return u;
      });

      await interaction.editReply({
        content: 'Account successfully reset.',
        components: [],
        ephemeral: true,
      });

    } else {
      await interaction.editReply({
        content: 'Action cancelled.',
        components: [],
        ephemeral: true,
      });
    }
};

module.exports = {
    data,
    execute,
};