const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { getCombatID, getBattle, readyUser } = require('./battle-storage.js');
const { MS_MINUTE, TYPE_EMOJI } = require('../util/constants.js');
const { Stats, Targets } = require('../util/enums.js');
const { askConfirmation } = require('../util/ui-logic.js');
const { tackle } = require('../cards/common-abilities.js');
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
      .setValue(String(u.fullID));
  });

  const select = new StringSelectMenuBuilder()
    .setCustomId('select')
    .addOptions(selectOptions)
    .setMinValues(1)
		.setMaxValues(Math.min(3, selectOptions.length));

  const row = new ActionRowBuilder()
		.addComponents(select);
  const message = await interaction.reply({
    content: 'Select your starting team!',
    components: [row],
    ephemeral: true,
    fetchReply: true,
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
  if (gm.activeUnits[user].length) {
    await interaction.editReply({ content: 'Oops! You are out of sync. Aborting command.', components: [], ephemeral: true });
    return false;
  }

  const values = confirmation.values.map((s) => parseInt(s));
  values.forEach((fullID) => {
    gm.setActiveUnit(user, fullID);
  });
  readyUser(user);
  confirmation.deferUpdate();
  await interaction.editReply({
    content: 'Starting team chosen!',
    components: [],
    ephemeral: true,
  });
  return true;
};


const moveSelect = async (interaction, turn) => {
  const user = interaction.user.id;
  const battle = getBattle(getCombatID(user));
  const gm = battle.GM;
  const activeUnits = gm.activeUnits[user];
  const subs = gm.units[user];
  const otherUser = gm.users.find((u) => u.id !== user).id;

  let selectOptions = activeUnits.map((u) => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(`${u.unit.name}`)
      .setValue(String(u.fullID));
  });
  let select = new StringSelectMenuBuilder()
    .setCustomId('agentSelect')
    .addOptions(selectOptions);
  let row = new ActionRowBuilder()
    .addComponents(select);
  let message = await interaction.reply({
    content: 'Select a creature you control.',
    components: [row],
    ephemeral: true,
    fetchReply: true,
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
    if (!getCombatID(user) || turn !== gm.turn) {
      await interaction.editReply({
        content: 'Oops! You are out of sync. Aborting command.',
        components: [],
        ephemeral: true,
      });
      return false;
    }
    confirmation.deferUpdate();
    return true;
  };

  const checkAbort = async () => {
    if (battle.readyUsers.includes(user)) {
      await interaction.editReply({
        content: 'Oops! You have ended your turn. Aborting command.',
        components: [],
        ephemeral: true,
      });
      return true;
    }
    return false;
  };

  success = await waitSelect('agentSelect');
  if (!success) return;
  const agent = activeUnits.find((u) => u.fullID === parseInt(confirmation.values[0]));

  selectOptions = agent.unit.abilities.filter((a) => {
    return a.target !== Targets.Sub || subs.length;
  }).map((a) => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(`${TYPE_EMOJI[a.type]} ${a.name} (${a.cost ?? 0})`)
      .setValue(a.name)
      .setDescription(a.shortDescription);
  });
  select = new StringSelectMenuBuilder()
    .setCustomId('abilitySelect')
    .addOptions(selectOptions)
    .addOptions(new StringSelectMenuOptionBuilder()
      .setLabel('Tackle')
      .setValue('Tackle'),
    );
  if (subs.length && !agent.summoned) {
    select.addOptions(new StringSelectMenuOptionBuilder()
      .setLabel('Substitute (10)')
      .setValue('Substitute'),
    );
  }
  if (agent.unit.item && agent.unit.item.consume) {
    select.addOptions(new StringSelectMenuOptionBuilder()
      .setLabel(agent.unit.item.name)
      .setValue('Item'),
    );
  }
  row = new ActionRowBuilder()
    .addComponents(select);
  message = await interaction.editReply({
    content: 'Select a move.',
    components: [row],
    ephemeral: true,
    fetchReply: true,
  });

  success = await waitSelect('abilitySelect');
  if (!success) return;

  let ability;
  let targetType;
  if (confirmation.values[0] === 'Substitute') {
    targetType = Targets.Sub;
    ability = {
      name: 'Substitute',
      priority: 1,
      cost: 10,
      execute: (params) => { params.sub(); },
    };
  } else if (confirmation.values[0] === 'Tackle') {
    targetType = Targets.Field;
    ability = tackle;
  } else if (confirmation.values[0] === 'Item') {
    targetType = Targets.Field;
    ability = {
      name: agent.unit.item.name,
      priority: Infinity,
      execute: (params) => {
        agent.unit.item.consume(params);
      },
    };
  } else {
    ability = agent.unit.abilities.find((a) => a.name === confirmation.values[0]);
    targetType = ability.target;
  }

  if (targetType === Targets.Field) {
    selectOptions = gm.activeUnits[otherUser].map((u) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(u.unit.name)
        .setValue('o' + String(u.fullID));
    });
    selectOptions.push(...activeUnits.map((u) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(u.unit.name)
        .setValue('u' + String(u.fullID));
    }));
  } else if (targetType === Targets.Sub) {
    selectOptions = subs.map((u) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(u.unit.name)
        .setValue('u' + String(u.fullID));
    });
  } else { // None
    const abort = await checkAbort();
    if (abort) return;
    await interaction.editReply({
      content: `**${agent.unit.name}** will use **${ability.name}**.`,
      components: [],
      ephemeral: true,
    });
    gm.queueCommand(new Command()
      .setAgent(agent)
      .setTargetType(targetType)
      .setExecute(ability.execute)
      .setPriority(ability.priority)
      .setName(ability.name)
      .setSpeed(agent.unit.getStat(Stats.Speed, { self: agent }))
      .setCost(ability.cost ?? 0),
    );
    return;
  }

  select = new StringSelectMenuBuilder()
    .setCustomId('targetSelect')
    .addOptions(selectOptions);
  row = new ActionRowBuilder()
    .addComponents(select);
  message = await interaction.editReply({
    content: 'Select a target.',
    components: [row],
    ephemeral: true,
    fetchReply: true,
  });

  success = await waitSelect('targetSelect');
  if (!success) return;
  const abort = await checkAbort();
  if (abort) return;

  let formation;
  if (targetType === Targets.Sub) {
    formation = subs;
  } else {
    formation = confirmation.values[0][0] === 'u' ? activeUnits : gm.activeUnits[otherUser];
  }
  const target = formation.find((u) => u.fullID === parseInt(confirmation.values[0].slice(1, Infinity)));
  await interaction.editReply({
    content: `**${agent.unit.name}** will target **${target.unit.name}** with **${ability.name}**.`,
    components: [],
    ephemeral: true,
  });
  gm.queueCommand(new Command()
    .setAgent(agent)
    .setTarget(target)
    .setTargetType(targetType)
    .setExecute(ability.execute)
    .setPriority(ability.priority)
    .setName(ability.name)
    .setSpeed(agent.unit.getStat(Stats.Speed, { self: agent }))
    .setCost(ability.cost ?? 0),
  );
};

const handleTurn = async (interaction, turn, doForfeit) => {
  switch (interaction.customId) {
    case 'action':
      await moveSelect(interaction, turn);
      break;
    case 'endTurn': {
      const endConfirmation = await askConfirmation(interaction);
      if (endConfirmation) readyUser(interaction.user.id);
      break;
    }
    case 'forfeit': {
      const forfeitConfirmation = await askConfirmation(interaction);
      if (forfeitConfirmation) doForfeit(interaction.user.id);
      break;
    }
    default:
      break;
  }
};

const displayExpUpdates = (fullUsers, unitUpdates) => {
  return fullUsers.map((user) => {
    return new EmbedBuilder()
      .setTitle(user.name)
      .addFields(unitUpdates[user.id].map((u) => {
        const [name, level, levelUp, expGain] = u;
        const levelUpEmoji = levelUp ? ' ⬆️ ' : '';
        return {
          name: `${name} (Level ${level}${levelUpEmoji})`,
          value: `(+${expGain} EXP)`,
          inline: true,
        };
      }));
  });
};

module.exports = {
  teamSelect: teamSelect,
  handleTurn: handleTurn,
  displayExpUpdates,
};