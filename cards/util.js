const { EmbedBuilder } = require('discord.js');
const { RARITY_COLOR } = require('../util/constants.js');
const Card = require('./card.js');
const { getCard } = require("./read-cards.js");

const display = (card, level=null) => {
  const abilities = Object.entries(card.abilities).map(([name, info]) => {
    return { name: name, value: info.description };
  });
  const title = level === null ? `${card.name}` : `${card.name} (Level ${level})`;
  return new EmbedBuilder()
    .setColor(RARITY_COLOR[card.rarity])
    .setTitle(`${title}`)
    .addFields(
    	{ name: `Health`, value: `${card.health}`, inline: true },
      { name: `Attack`, value: `${card.attack}`, inline: true },
      { name: `Defense`, value: `${card.defense}`, inline: true },
    )
    .addFields(abilities)
}

module.exports = {
  display: display,
  fullDisplay: ({id, level, exp}, index, collectionSize) => {
    const card = getCard(id);
    return display(card, level).setFooter({
      text: `Page ${index+1}/${collectionSize}`,
    });
  },
  displaySlice: (collection, index, sliceSize) => {
    const rawSlice = collection.slice(index, index + sliceSize);
    const outputLines = rawSlice.map(({id, level, exp}) => {
      const card = getCard(id);
      return `**${card.name}** (Level ${level})`;
    });
    const page = Math.ceil((index + 1) / sliceSize);
    const totalPages = Math.ceil(collection.length / sliceSize);
    outputLines.push(`\n*Page ${page}/${totalPages}*`);
    return outputLines.join('\n');
  },
}