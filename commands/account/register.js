const { SlashCommandBuilder } = require('discord.js');
const { getUser, makeUser } = require('../../database.js');

const data = new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register an account.');

const execute = async (interaction) => {
    const userId = interaction.user.id;
    const user = await getUser(userId);
    if (user) {
        await interaction.reply({ content: 'It seems like you are already registered.', ephemeral: true });
        return;
    }
    await makeUser(userId);
    await interaction.reply({ content: `Welcome, ${interaction.user.username}!`, ephemeral: true });
};

module.exports = {
    data,
    execute,
};