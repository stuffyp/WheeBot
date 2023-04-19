const { SlashCommandBuilder } = require('discord.js');
const { getUser, updateUser } = require("../../manage-user.js");
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
    const user = interaction.user.id;
    const userData = await getUser(user);
    if (userData === null) {
      await interaction.reply('Please register an account first.');
      return;
    }
    if (userData.version !== VERSION_NUMBER) {
      await interaction.reply('Please use the update command to update to the latest version of the game.');
      return;
    }
    
    const timeUntil = userData.stats.lastRoll + ROLL_COOLDOWN - Date.now();
    if (timeUntil > 0) {
      const hoursUntil = Math.floor(timeUntil / MS_HOUR);
      const minutesUntil = Math.floor((timeUntil % MS_HOUR) / MS_MINUTE);
      await interaction.reply(`You are out of rolls. Next roll in ${hoursUntil} hours, ${minutesUntil} minutes.`);
      return;
    }

    if (userData.collection.length >= COLLECTION_SIZE) {
      await interaction.reply(`Your collection is already full.`);
      return;
    }

    const [id, card] = rollCard();
    await updateUser(user, async (userData) => {
      if (userData.collection.length >= COLLECTION_SIZE) {
        await interaction.reply(`Oops! An unexpected error occurred: Race Condition (PUSH).`);
        return null; // race condition occurred
      }
      userData.collection.push(CARD_DB_TEMPLATE(id));
      userData.stats.lastRoll = Date.now();
      return userData;
    });
    await interaction.reply({ embeds: [display(card)], });
	},
};