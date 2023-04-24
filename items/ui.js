const { EmbedBuilder } = require('discord.js');
const { getItem } = require("./read-items.js");

const display = (item) => {
  return new EmbedBuilder()
    .setTitle(item.name)
    .setDescription(item.description)
    .addFields({ name: 'Cost', value: `${item.cost}` })
}

module.exports = {
  display: display,
  displayShop: (ids) => {
    const items = ids.map(id => getItem(id));
    return new EmbedBuilder()
      .setTitle('Shop')
      .setDescription('💵 Buy items (refreshes daily).')
      .addFields(items.map(item => ({
        name: `${item.name} (\$${item.cost})`,
        value: item.description,
      })));
  }
}