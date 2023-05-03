const { SlashCommandBuilder } = require('discord.js');
const { getUser, updateUser } = require('../../database.js');
const { rollCard } = require('../../cards/read-cards.js');
const { display } = require('../../cards/ui.js');
const {
  ROLL_COOLDOWN,
  COLLECTION_SIZE,
} = require('../../util/constants.js');
const { validateUser } = require('../../util/ui-logic.js');

const data = new SlashCommandBuilder()
  .setName('roll')
  .setDescription('Roll for new cards');

const execute = async (interaction) => {
  const userId = interaction.user.id;
  const user = await getUser(userId);
  const success = await validateUser(user, interaction);
  if (!success) return;

  const timeUntil = user.stats.lastRoll + ROLL_COOLDOWN - Date.now();
  // const hoursUntil = Math.floor(timeUntil / MS_HOUR);
  // const minutesUntil = Math.floor((timeUntil % MS_HOUR) / MS_MINUTE);
  const useFreeRoll = (timeUntil > 0);

  const [id, card] = rollCard();
  await updateUser(userId, async (u) => {
    let text = null;
    if (useFreeRoll) {
      if (u.stats.freeRolls === 0) {
        await interaction.reply(`You are out of rolls. Next roll in ${hoursUntil} hours, ${minutesUntil} minutes.`);
        return null;
      }
      u.stats.freeRolls--;
      text = `Using free roll... you have ${u.stats.freeRolls} free rolls left.`;
    } else {
      u.stats.lastRoll = Date.now();
    }
    if (u.cardCollection.length >= COLLECTION_SIZE) {
      await interaction.reply('Your collection is already full.');
      // no update
      return null;
    }
    await interaction.reply({ content: text, embeds: [display(card)] });
    u.idSeed++;
    u.cardCollection.push({ id: id, fullID: u.idSeed });
    return u;
  });
};

module.exports = {
	data,
	execute,
};