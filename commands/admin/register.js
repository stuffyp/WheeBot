const { SlashCommandBuilder } = require('discord.js');
const { USER_TEMPLATE } = require("../../util/constants.js");
const { hasUser, setUser, makeUser } = require("../../manage-user.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register an account for games'),
	async execute(interaction) {
    const user = interaction.user.id;
    const userExists = await hasUser(user);
    if (userExists) {
      await interaction.reply({content: 'It seems like you are already registered.', ephemeral: true});
      return;
    }
    makeUser(user);
    await setUser(user, USER_TEMPLATE);
    await interaction.reply({ content: `Welcome, ${interaction.user.username}!`, ephemeral: true });
	},
};