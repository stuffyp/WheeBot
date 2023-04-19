const { SlashCommandBuilder } = require('discord.js');
const { VERSION_NUMBER } = require("../../util/constants.js");
const { hasUser, getUser, updateUser } = require("../../manage-user.js");

/*
v1.0 template:
  USER_TEMPLATE: {
    collection: [],
    stats: {
      lastRoll: 0,
    },
    version: VERSION_NUMBER,
  },

  CARD_DB_TEMPLATE: (id) => ({
    id: id,
    level: 1,
    exp: 0,
  }),
*/

const update = {
  '1.0': (userData) => {
    return userData;
  },
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Update account'),
	async execute(interaction) {
    const user = interaction.user.id;
    const userExists = await hasUser(user);
    if (!userExists) {
      await interaction.reply({
        content: 'You have not yet registered for an account.',
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();

    const userData = await getUser(user);
    if (!(userData.version in update)){
      await interaction.editReply({
        content: 'An unexpected error occurred.',
        ephemeral: true,
      });
      return;
    }
    await updateUser(user, update[userData.version]);
    await interaction.editReply({ content: `Successfully updated to version ${VERSION_NUMBER}!`, ephemeral: true });
	},
};