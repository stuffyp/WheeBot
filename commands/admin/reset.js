const { SlashCommandBuilder } = require('discord.js');
const { USER_TEMPLATE } = require("../../util/constants.js");
const { askConfirmation } = require("../../util/ui-logic.js");
const { getUser, updateUser } = require("../../manage-user.js");
const { getCombatID } = require("../../combat/battle-storage.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset account'),
	async execute(interaction) {
    const user = interaction.user.id;
    const userData = await getUser(user);
    if (userData === null) {
      await interaction.reply({
        content: 'You have not yet registered for an account.',
        ephemeral: true,
      });
      return;
    }
    if (getCombatID(user)) {
      await interaction.reply({
        content: 'You are currently in a battle.',
        ephemeral: true,
      });
      return;
    }

    const confirmation = await askConfirmation(interaction, deleteReply=false);
    /*
    when deleteReply is set to false, askConfirmation will create a reply to the interaction
    which is why editReply is called below
    */

    if (confirmation === null) {
      await interaction.editReply({
        content: 'Response timed out.',
        components: [],
        ephemeral: true,
      });
      return;
    }
    
    if (confirmation) {
      await updateUser(user, async (userData) => {
        if (getCombatID(user)) {
          await interaction.editReply({
            content: 'Command failed. You are currently in a battle.',
            ephemeral: true,
          });
          return null;
        }
        oldIdSeed = userData.idSeed;
        userData = USER_TEMPLATE;
        userData.idSeed = oldIdSeed;
        await interaction.editReply({ 
          content: `Account successfully reset.`,
          components: [],
          ephemeral: true,
        });
        return userData;
      });
    } else {
      await interaction.editReply({ 
        content: `Action cancelled.`,
        components: [],
        ephemeral: true,
      });
    }
    
    
	},
};