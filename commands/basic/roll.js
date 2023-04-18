const { SlashCommandBuilder } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();
const { rollCard } = require("../../cards/read-cards.js");
const { display } = require("../../cards/util.js");
const { 
  VERSION_NUMBER, 
  MS_MINUTE, 
  MS_HOUR, 
  ROLL_COOLDOWN, 
  COLLECTION_SIZE,
  CARD_DB_TEMPLATE,
} = require("../../util/constants.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll for new cards'),
	async execute(interaction) {
    const users = await db.get('users');
    if (!(interaction.user.id in users)) {
      await interaction.reply('Please register an account first.');
      return;
    }

    const user = users[interaction.user.id];
    if (user.version !== VERSION_NUMBER) {
      await interaction.reply('Please use the update command to update to the latest version of the game.');
      return;
    }
    
    const timeUntil = user.stats.lastRoll + ROLL_COOLDOWN - Date.now();
    if (timeUntil > 0) {
      const hoursUntil = Math.floor(timeUntil / MS_HOUR);
      const minutesUntil = Math.floor((timeUntil % MS_HOUR) / MS_MINUTE);
      await interaction.reply(`You are out of rolls. Next roll in ${hoursUntil} hours, ${minutesUntil} minutes.`);
      return;
    }

    if (user.collection.length === COLLECTION_SIZE) {
      await interaction.reply(`Your collection is already full.`);
      return;
    }

    const [id, card] = rollCard();
    user.collection.push(CARD_DB_TEMPLATE(id));
    user.stats.lastRoll = Date.now();
    await db.set('users', users);
    await interaction.reply({ embeds: [display(card)], });
	},
};