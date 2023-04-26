const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('echo')
  .setDescription('Echo a message.')
  .addStringOption(option =>
    option
      .setName('input')
      .setDescription('The input to echo')
      .setRequired(true))
  .addBooleanOption(option =>
    option
      .setName('ephemeral')
      .setDescription('If the message should be private'));

const execute = async (interaction) => {
  await interaction.reply({
    content: `Hi ${interaction.user.username}, ${interaction.options.getString('input')}.`,
    ephemeral: interaction.options.getBoolean('ephemeral')
  });
};

module.exports = {
  data,
  execute
};