const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { MS_SECOND, USER_TEMPLATE } = require("../../util/constants.js");
const { hasUser, getUser, setUser } = require("../../manage-user.js");

const TIMEOUT = 30 * MS_SECOND;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset account'),
	async execute(interaction) {
    const user = interaction.user.id;
    const userExists = await hasUser(user);
    if (userExists) {
      const confirm = new ButtonBuilder()
  			.setCustomId('confirm')
  			.setLabel('Confirm Reset')
  			.setStyle(ButtonStyle.Danger);
  
  		const cancel = new ButtonBuilder()
  			.setCustomId('cancel')
  			.setLabel('Cancel')
  			.setStyle(ButtonStyle.Secondary);
  
  		const row = new ActionRowBuilder()
  			.addComponents(cancel, confirm);
  
  		const response = await interaction.reply({
  			content: `Are you sure you want to reset your account?`,
  			components: [row],
  		});

      try {
      	const confirmation = await response.awaitMessageComponent({ time: TIMEOUT });
      
      	if (confirmation.customId === 'confirm') {
      		await setUser(user, USER_TEMPLATE);
      		await confirmation.update({ content: `Account successfully reset.`, components: [] });
      	} else if (confirmation.customId === 'cancel') {
      		await confirmation.update({ content: 'Action cancelled.', components: [] });
      	}
      } catch (e) {
      	await interaction.editReply({
          content: 'Response timed out.',
          components: [],
        });
      }
    } else {
      await interaction.reply({
        content: 'You have not yet registered for an account.',
        ephemeral: true,
      });
    }
	},
};