const { SlashCommandBuilder } = require('discord.js');
const { VERSION_NUMBER } = require('../../util/constants.js');
const { getUser, updateUser } = require('../../database.js');
// const { getCombatID } = require('../../combat/battle-storage.js');


/*
v1.0 template:
  USER_TEMPLATE: {
    collection: [],
    party: [],
    stats: {
      lastRoll: 0,
      coins: 0,
    },
    idSeed: 12345,
    version: VERSION_NUMBER,
  },

  CARD_DB_TEMPLATE: (id, fullID) => ({
    id: id,
    level: 1,
    exp: 0,
    fullID: fullID,
  }),
*/

const update = {
  '1.0': async (userData) => {
    return userData;
  },
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Update account'),
	async execute(interaction) {
    const user = interaction.user.id;
    const userData = await getUser(user);
    // if we revive this command need to refactor and switch to validateUser
    if (userData === null) {
      await interaction.reply({
        content: 'You have not yet registered for an account.',
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply({ ephemeral: true });

    if (!(userData.version in update)) {
      await interaction.editReply({
        content: 'An unexpected error occurred.',
        ephemeral: true,
      });
      return;
    }
    // this updateUser probably doesn't work in Mongo database code
    await updateUser(user, update[userData.version]);
    await interaction.editReply({ content: `Successfully updated to version ${VERSION_NUMBER}!`, ephemeral: true });
	},
};