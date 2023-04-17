const { SlashCommandBuilder } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();
const { VERSION_NUMBER } = require("../../util/constants.js");

/*
v1.0 template: USER_TEMPLATE: {
    collection: [],
    stats: {
      lastRoll: 0,
    },
    version: VERSION_NUMBER,
  },
*/

const update = {
  '1.0': (user) => {
    return user;
  },
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Update account'),
	async execute(interaction) {
    const users = await db.get('users');
    if (!(interaction.user.id in users)) {
      await interaction.reply({
        content: 'You have not yet registered for an account.',
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();

    const user = users[interaction.user.id]
    if (!(user.version in update)){
      await interaction.editReply({
        content: 'An unexpected error occurred.',
        ephemeral: true,
      });
      return;
    }
    users[interaction.user.id] = update[user.version](user);
    await db.set('users', users);
    await interaction.editReply({ content: `Successfully updated to version ${VERSION_NUMBER}!`, ephemeral: true });
	},
};