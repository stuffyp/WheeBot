const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { MS_MINUTE } = require("../../util/constants.js");
const { getUser, updateUser, syncCombat } = require("../../manage-user.js");
const { validateUser } = require("../../util/ui-logic.js");
const { startBattle } = require("../../combat/combat-handler.js");

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
  			.setDescription('Initiate a challenge'))

const executeStart = async (interaction) => {
  const user = interaction.user.id;
  const userData = await getUser(user);
  const success = await validateUser(userData, interaction);
  if (!success) return;
  if (userData.party.length === 0) {
    await i.reply({
      content: 'Your party is too small (use /manage to add cards to your party).',
      ephemeral: true,
    });
    return;
  }
  if (userData.combatID) {
    await i.reply({
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
  buttonCollector.on('collect', async (i) => {
    const otherUser = i.user.id;
    if (otherUser === user) {
      await i.reply({
        content: 'Please wait for someone else to accept your challenge.',
        ephemeral: true,
      });
      return;
    }
    const otherUserData = await getUser(otherUser);
    const otherSuccess = await validateUser(otherUserData, i);
    if (!otherSuccess) return;
    if (otherUserData.party.length === 0) {
      await i.reply({
        content: 'Your party is too small (use /manage to add cards to your party).',
        ephemeral: true,
      });
      return;
    }
    const syncSuccess = await syncCombat(user, otherUser);
    if (!syncSuccess) {
      await i.reply({
        content: 'Interaction failed. One of you two is already in a battle.',
        ephemeral: true,
      });
      return;
    }
    i.deferUpdate();
    await interaction.editReply({
      content: `${i.user.username} accepted ${interaction.user.username}'s challenge!`,
      components: [],
    });
    startBattle(user, otherUser);
  });
  
}

const execute = async (interaction) => {
  switch (interaction.options.getSubcommand()) {
    case 'start':
      executeStart(interaction);
      break;
    default:
      console.error(`An unknown subcommand was registered: ${interaction.options.getSubcommand()}`);
  }
}

module.exports = {
	data,
	execute,
};