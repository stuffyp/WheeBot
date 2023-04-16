const { SlashCommandBuilder } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();
const { rollCard } = require("../../cards/read-cards.js");
const { display } = require("../../cards/util.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll for new cards'),
	async execute(interaction) {
    // TODO: set some limitations on how much you can roll
    const users = await db.get('users');
    if (interaction.user.id in users) {
      const user = users[interaction.user.id];
      const [id, card] = rollCard();
      user.collection.push([id, 1]);
      await db.set('users', users);
      await interaction.reply(display(card));
    } else {
      await interaction.reply('Please register before rolling.');
    }
	},
};