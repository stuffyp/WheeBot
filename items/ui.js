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
  displayItemSlice: (itemData, index, sliceSize) => {
    const rawSlice = itemData.slice(index * sliceSize, index * sliceSize + sliceSize);
    const outputFields = rawSlice.map(([id, quantity]) => {
      const item = getItem(id);
      return { name: `${item.name} (x${quantity})`, value: item.description };
    });
    const totalPages = Math.ceil(itemData.length / sliceSize);
    return new EmbedBuilder()
      .setTitle('Inventory')
      .addFields(outputFields)
      .setFooter({ text: `Page ${index + 1}/${totalPages}` })
  },
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