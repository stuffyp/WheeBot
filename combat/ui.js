const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const { getCombatID, getBattle } = require('./battle-storage.js');
const { MS_MINUTE } = require('../util/constants.js');

const TIMEOUT = 3 * MS_MINUTE;

const teamSelect = async (interaction) => {
  const user = interaction.user.id;
  const battle = getBattle(getCombatID(user));
  if (battle.readyUsers.includes(user)) {
    await interaction.reply({
      content: 'Oops! It seems you have already chosen a team.',
      ephemeral: true,
    });
    return false;
  }
  const gm = battle.GM;
  const party = gm.units[user];

  const selectOptions = party.map((u) => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(`${u.unit.name} (Level ${u.level})`)
      .setValue(String(u.fullID))
  });

  const select = new StringSelectMenuBuilder()
  	.setCustomId('select')
  	.addOptions(selectOptions)
    .setMinValues(1)
		.setMaxValues(Math.min(3, selectOptions.length));

  const row = new ActionRowBuilder()
		.addComponents(select)
  const message = await interaction.reply({
    content: 'Select your starting team!',
    components: [row],
    ephemeral: true,
  });

  const filter = i => i.user.id === interaction.user.id;
  try {
  	const confirmation = await message.awaitMessageComponent({ filter: filter, time: TIMEOUT });
    if (battle.readyUsers.includes(user)) {
      confirmation.deferUpdate();
      interaction.editReply({ 
        content: 'Oops! It looks like this command is out of sync. Aborting.', 
        components: [], 
        ephemeral: true 
      });
      return false;
    }
    const values = confirmation.values.map((s) => parseInt(s));
    values.forEach((fullID) => {
      gm.setActiveUnit(user, fullID);
    });
    battle.readyUsers.push(user);
    interaction.deleteReply();
    return true;
  } catch (e) {
    console.error(e);
  	await interaction.editReply({ content: 'Command timed out.', components: [], ephemeral: true });
  }
  return false;
}

module.exports = {
  teamSelect: teamSelect,
}