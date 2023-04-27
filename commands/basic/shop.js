const { SlashCommandBuilder } = require('discord.js');
const { 
  VERSION_NUMBER, 
  MS_MINUTE,
} = require("../../util/constants.js");
const { displayShop } = require("../../items/ui.js");
const { formatItemID, getItem } = require("../../items/read-items.js");
const { getUser, getShop, updateUser } = require("../../manage-user.js");
const { validateUser } = require("../../util/ui-logic.js");


const executeView = async (interaction) => {
  const shop = await getShop();
  await interaction.reply({
    embeds: [displayShop(shop.items)],
  });
}

const executeBuy = async (interaction) => {
  const user = interaction.user.id;
  const userData = await getUser(user);
  const success = await validateUser(userData, interaction);
  if (!success) return;

  const itemID = formatItemID(interaction.options.getString('item'));
  const item = getItem(itemID);
  const quantity = interaction.options.getInteger('quantity');

  const shop = await getShop();

  await updateUser(user, async (userData) => {
    if (!shop.items.includes(itemID)) {
      await interaction.reply('The item you wish to buy is not (or is no longer) in the shop.');
      return null;
    }
    const cost = item.cost * quantity;
    if (cost > userData.stats.coins) {
      await interaction.reply('You do not have enough coins to make this purchase.');
      return null;
    }
    userData.stats.coins -= cost;
    if (!(itemID in userData.items)) userData.items[itemID] = 0;
    userData.items[itemID] += quantity;
    const replyText = (quantity === 1) ? `Successfully bought ${item.name}.` : `Successfully bought ${quantity} copies of ${item.name}.`;
    await interaction.reply(replyText);
    return userData;
  });
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
    .setDescription('Access the shop')
    .addSubcommand(subcommand =>
  		subcommand
  			.setName('view')
  			.setDescription('View the shop'))
    .addSubcommand(subcommand =>
  		subcommand
  			.setName('buy')
  			.setDescription('Buy an item')
        .addStringOption(option =>
      		option.setName('item')
      			.setDescription('Item to purchase')
      			.setRequired(true))
        .addIntegerOption(option => 
          option.setName('quantity')
            .setDescription('Amount to purchase')
            .setMinValue(1)
            .setRequired(true))),
	async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case 'view':
        executeView(interaction);
        break;
      case 'buy':
        executeBuy(interaction);
        break;
      default:
        console.error(`An unknown subcommand was registered: ${interaction.options.getSubcommand()}`);
    }
	},
};