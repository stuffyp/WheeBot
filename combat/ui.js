const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const { getCombatID, getBattle, readyUser } = require('./battle-storage.js');
const { MS_MINUTE } = require('../util/constants.js');
const { Stats } = require('../util/enums.js');
const { askConfirmation } = require('../util/ui-logic.js');
const Command = require('../game-classes/command.js');

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

  if (!getCombatID(user)) {
    await interaction.editReply({ content: 'Oops! You are out of sync. Aborting command.', components: [], ephemeral: true });
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

const moveSelect = async (interaction) => {
  const user = interaction.user.id;
  const battle = getBattle(getCombatID(user));
  const gm = battle.GM;
  const activeUnits = gm.activeUnits[user];

  let selectOptions = activeUnits.map((u) => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(`${u.unit.name}`)
      .setValue(String(u.fullID))
  });
  let select = new StringSelectMenuBuilder()
    .setCustomId('agentSelect')
    .addOptions(selectOptions)
  let row = new ActionRowBuilder()
    .addComponents(select)
  let message = await interaction.reply({
    content: 'Select a creature you control.',
    components: [row],
    ephemeral: true,
  });
  let confirmation = null;
  let success = false;
  
  const waitSelect = async (customId) => {
    const filter = i => i.customId === customId && i.user.id === interaction.user.id;
    try {
      confirmation = await message.awaitMessageComponent({ filter: filter, time: TIMEOUT });
    } catch (e) {
      console.error(e);
      await interaction.editReply({ content: 'Command timed out.', components: [], ephemeral: true });
      return false;
    }
    if (!getCombatID(user)) {
      await interaction.editReply({ 
        content: 'Oops! You are out of sync. Aborting command.', 
        components: [], 
        ephemeral: true 
      });
      return false;
    }
    confirmation.deferUpdate();
    return true;
  }

  success = await waitSelect('agentSelect');
  if (!success) return;
  const agent = activeUnits.find((u) => u.fullID === parseInt(confirmation.values[0]));

  selectOptions = agent.unit.abilities.map((a) => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(a.name)
      .setValue(a.name)
  });
  select = new StringSelectMenuBuilder()
    .setCustomId('abilitySelect')
    .addOptions(selectOptions)
  row = new ActionRowBuilder()
    .addComponents(select)
  message = await interaction.editReply({
    content: 'Select a move.',
    components: [row],
    ephemeral: true,
  });

  success = await waitSelect('abilitySelect');
  if (!success) return;
  const ability = agent.unit.abilities.find((a) => a.name === confirmation.values[0]);

  const otherUser = gm.users.find((u) => u.id !== user).id;
  selectOptions = gm.activeUnits[otherUser].map((u) => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(u.unit.name)
      .setValue('o'+String(u.fullID))
  });
  const moreSelectOptions = activeUnits.map((u) => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(`${u.unit.name} (friendly)`)
      .setValue('u'+String(u.fullID))
  });
  select = new StringSelectMenuBuilder()
    .setCustomId('targetSelect')
    .addOptions(selectOptions)
    .addOptions(moreSelectOptions)
  row = new ActionRowBuilder()
    .addComponents(select)
  message = await interaction.editReply({
    content: 'Select a target.',
    components: [row],
    ephemeral: true,
  });

  success = await waitSelect('targetSelect');
  if (!success) return;
  const formation = confirmation.values[0][0] === 'u' ? activeUnits : gm.activeUnits[otherUser];
  const target = formation.find((u) => u.fullID === parseInt(confirmation.values[0].slice(1, Infinity)));
  if (battle.readyUsers.includes(user)) {
    interaction.editReply({
      content: `Oops! You have ended your turn. Aborting command.`,
      components: [],
      ephemeral: true,
    });
    return;
  }
  interaction.editReply({
    content: `**${agent.unit.name}** will target **${target.unit.name}** with **${ability.name}**.`,
    components: [],
    ephemeral: true,
  });
  gm.queueCommand(new Command()
    .setAgent(agent)
    .setTarget(target)
    .setExecute(ability.execute)
    .setPriority(ability.priority)
    .setName(ability.name)
    .setSpeed(agent.unit.getStat(Stats.Speed, { self: agent }))
  );
}

const handleTurn = async (interaction, doForfeit) => {
  switch (interaction.customId) {
    case 'action':
      await moveSelect(interaction);
      break;
    case 'endTurn':
      const endConfirmation = await askConfirmation(interaction);
      if (endConfirmation) readyUser(interaction.user.id);
      break;
    case 'forfeit':
      const forfeitConfirmation = await askConfirmation(interaction);
      if (forfeitConfirmation) doForfeit(interaction.user.id);
      break;
    default:
      break;
  }
}

module.exports = {
  teamSelect: teamSelect,
  handleTurn: handleTurn,
}