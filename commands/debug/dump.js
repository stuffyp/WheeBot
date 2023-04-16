const { SlashCommandBuilder } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dump')
		.setDescription('Dumps all database information'),
	async execute(interaction) {
    if (interaction.user.id === process.env.DEVELOPER) {
      const userdata = await db.get('users');
		  await interaction.reply({content: `\`\`\`${JSON.stringify(userdata)}\`\`\``, ephemeral: true});
    } else {
		  await interaction.reply("Sorry, you are not authorized to use this command.");
    }
	},
};