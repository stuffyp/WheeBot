const { SlashCommandBuilder } = require('discord.js');
// const {
//   VERSION_NUMBER,
//   MS_MINUTE,
// } = require('../../util/constants.js');
const { displayShop } = require('../../items/ui.js');
const { formatItemID, getItem } = require('../../items/read-items.js');
const { getUser, getShop, updateUser } = require('../../database.js');
const { validateUser } = require('../../util/ui-logic.js');


const executeView = async (interaction) => {
  const shop = await getShop();
  await interaction.reply({
    embeds: [displayShop(shop.items)],
  });
};

const executeBuy = async (interaction) => {
  const userId = interaction.user.id;
  const user = await getUser(userId);
  const success = await validateUser(user, interaction);
  if (!success) return;

  const itemID = formatItemID(interaction.options.getString('item'));
  const item = getItem(itemID);
  const quantity = interaction.options.getInteger('quantity');

  const shop = await getShop();

  await updateUser(userId, async (u) => {
    if (!shop.items.includes(itemID)) {
      await interaction.reply('The item you wish to buy is not (or is no longer) in the shop.');
      return null;
    }
    const cost = item.cost * quantity;
    if (cost > u.stats.coins) {
      await interaction.reply('You do not have enough coins to make this purchase.');
      return null;
    }
    u.stats.coins -= cost;
    if (!(u.items.has(itemID))) u.items.set(itemID, 0);
    u.items.set(itemID, u.items.get(itemID) + quantity);
    const replyText = (quantity === 1) ? `Successfully bought ${item.name}.` : `Successfully bought ${quantity} copies of ${item.name}.`;
    await interaction.reply(replyText);
    return u;
  });
};

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