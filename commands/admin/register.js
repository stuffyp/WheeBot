const { SlashCommandBuilder } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();
const { USER_TEMPLATE } = require("../../util/constants.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register an account for games'),
	async execute(interaction) {
    const users = await db.get('users');
    if (interaction.user.id in users) {
      await interaction.reply({content: 'It seems like you are already registered.', ephemeral: true});
      return;
    }
    users[interaction.user.id] = USER_TEMPLATE;
    await db.set('users', users);
    await interaction.reply({ content: `Welcome, ${interaction.user.tag}!`, ephemeral: true });
	},
};