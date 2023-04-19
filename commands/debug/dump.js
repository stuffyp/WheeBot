const { SlashCommandBuilder } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dump')
		.setDescription('Dumps all database information'),
	async execute(interaction) {
    if (interaction.user.id === process.env.DEVELOPER) {
      const userdata = {};
      const keys = await db.list();
      for (const key of keys) {
        const val = await db.get(key);
        userdata[key] = val;
      }
		  await interaction.reply({content: `\`\`\`${JSON.stringify(userdata)}\`\`\``, ephemeral: true});
    } else {
		  await interaction.reply("Sorry, you are not authorized to use this command.");
    }
	},
};