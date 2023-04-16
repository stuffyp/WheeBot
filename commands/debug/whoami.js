const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whoami')
		.setDescription('Returns the user id'),
	async execute(interaction) {
		await interaction.reply({content: `Hello, ${interaction.user.id}!`, ephemeral: true});
	},
};