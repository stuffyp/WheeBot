const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Replies to the user'),
	async execute(interaction) {
		await interaction.reply(`Hello, ${interaction.user.username}!`);
	},
};