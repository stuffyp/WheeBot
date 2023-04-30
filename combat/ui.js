const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const { getCombatID, getBattle, readyUser } = require('./battle-storage.js');
const { MS_MINUTE } = require('../util/constants.js');
const { askConfirmation } = require('../util/ui-logic.js');

const TIMEOUT = 5 * MS_MINUTE;

const teamSelect = async (interaction) => {
  const user = interaction.user.id;
  const battle = getBattle(getCombatID(user));
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

  const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
  let confirmation = null;
  try {
    confirmation = await message.awaitMessageComponent({ filter: filter, time: TIMEOUT });
  } catch (e) {
    console.error(e);
    await interaction.editReply({ content: 'Command timed out.', components: [], ephemeral: true });
    return false;
  }

  const values = confirmation.values.map((s) => parseInt(s));
  values.forEach((fullID) => {
    gm.setActiveUnit(user, fullID);
  });
  readyUser(user);
  confirmation.deferUpdate();
  interaction.editReply({
    content: 'Starting team chosen!',
    components: [],
    ephemeral: true,
  });
  return true;
}

const handleTurn = async (interaction, doForfeit) => {
  let confirmation;
  switch (interaction.customId) {
    case 'action':
      break;
    case 'endTurn':
      confirmation = await askConfirmation(interaction);
      if (confirmation) readyUser(interaction.user.id);
      break;
    case 'forfeit':
      confirmation = await askConfirmation(interaction);
      if (confirmation) doForfeit(interaction.user.id);
      break;
    default:
      break;
  }
}

module.exports = {
  teamSelect: teamSelect,
  handleTurn: handleTurn,
}