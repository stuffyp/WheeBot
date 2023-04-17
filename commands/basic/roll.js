const { SlashCommandBuilder } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();
const { rollCard } = require("../../cards/read-cards.js");
const { display } = require("../../cards/util.js");
const { MS_MINUTE, MS_HOUR, ROLL_COOLDOWN } = require("../../util/constants.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll for new cards'),
	async execute(interaction) {
    // TODO: set some limitations on how much you can roll
    const users = await db.get('users');
    if (interaction.user.id in users) {
      const user = users[interaction.user.id];
      const timeUntil = user.stats.lastRoll + ROLL_COOLDOWN - Date.now();
      if (timeUntil < 0) {
        const [id, card] = rollCard();
        user.collection.push([id, 1]);
        user.stats.lastRoll = Date.now();
        await db.set('users', users);
        await interaction.reply(display(card));
      } else {
        const hoursUntil = Math.floor(timeUntil / MS_HOUR);
        const minutesUntil = Math.floor((timeUntil % MS_HOUR) / MS_MINUTE);
        await interaction.reply(`You are out of rolls. Next roll in ${hoursUntil} hours, ${minutesUntil} minutes.`);
      }
    } else {
      await interaction.reply('Please register before rolling.');
    }
	},
};