const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { MS_MINUTE } = require('../../util/constants.js');
const { getUser, syncCombat } = require('../../database.js');
const { validateUser } = require('../../util/ui-logic.js');
const { startBattle } = require('../../combat/combat-setup.js');
const { getCombatID, refreshBattles } = require('../../combat/battle-storage.js');

const TIME_LIMIT = 15 * MS_MINUTE;

const acceptButton = new ButtonBuilder()
  .setCustomId('accept')
  .setLabel('Accept Challenge')
  .setStyle(ButtonStyle.Primary);
const acceptActionRow = new ActionRowBuilder().addComponents(acceptButton);

const data = new SlashCommandBuilder()
	.setName('battle')
	.setDescription('Initiate combat.')
	.addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Initiate a challenge'));

const executeStart = async (interaction) => {
  const userId = interaction.user.id;
  const user = await getUser(userId);
  const success = await validateUser(user, interaction);
  if (!success) return;
  if (user.party.length === 0) {
    await interaction.reply({
      content: 'Your party is too small (use /manage to add cards to your party).',
      ephemeral: true,
    });
    return;
  }
  refreshBattles();
  if (getCombatID(userId)) {
    await interaction.reply({
      content: 'You are already in a battle.',
      ephemeral: true,
    });
    return;
  }

  const message = await interaction.reply({
    content: `${interaction.user.username} issued a challenge!`,
    components: [acceptActionRow],
  });

  const messageFilter = (i) => i.customId === 'accept';
  const buttonCollector = message.createMessageComponentCollector({
    filter: messageFilter,
    time: TIME_LIMIT,
  });
  let challengeAccepted = false;
  buttonCollector.on('collect', async (i) => {
    const otherUserId = i.user.id;
    if (otherUserId === userId) {
      await i.reply({
        content: 'Please wait for someone else to accept your challenge.',
        ephemeral: true,
      });
      return;
    }
    const otherUser = await getUser(otherUserId);
    const otherSuccess = await validateUser(otherUser, i);
    if (!otherSuccess) return;
    if (otherUser.party.length === 0) {
      await i.reply({
        content: 'Your party is too small (use /manage to add cards to your party).',
        ephemeral: true,
      });
      return;
    }
    const syncSuccess = await syncCombat(userId, otherUserId);
    if (syncSuccess === 0) {
      await i.reply({
        content: 'Interaction failed. One of you two is already in a battle.',
        ephemeral: true,
      });
      return;
    }
    if (syncSuccess === -1) {
      await i.reply({
        content: 'Interaction failed. One of you two is missing a party.',
        ephemeral: true,
      });
      return;
    }
    i.deferUpdate();
    await interaction.editReply({
      content: `${i.user.username} accepted ${interaction.user.username}'s challenge!`,
      components: [],
    });
    challengeAccepted = true;
    startBattle(userId, otherUserId, interaction.user.username, i.user.username, interaction.channel);
  });

  buttonCollector.on('end', () => {
    if (challengeAccepted) return;
    interaction.editReply({
      content: 'Challenge timed out.',
      components: [],
    });
  });
};

const execute = async (interaction) => {
  switch (interaction.options.getSubcommand()) {
    case 'start':
      executeStart(interaction);
      break;
    default:
      console.error(`An unknown subcommand was registered: ${interaction.options.getSubcommand()}`);
  }
};

module.exports = {
	data,
	execute,
};