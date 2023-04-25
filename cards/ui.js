const { EmbedBuilder } = require('discord.js');
const { RARITY_COLOR, TYPE_EMOJI } = require('../util/constants.js');
const { Rarities } = require('../util/enums.js');
const Card = require('./card.js');
const { getCard } = require("./read-cards.js");

const RARITY_TO_EMOJI = {
  [`${Rarities.Common}`]: '🟩',
  [`${Rarities.Rare}`]: '🟦',
  [`${Rarities.Epic}`]: '🟪',
  [`${Rarities.Legendary}`]: '🟨',
  [`${Rarities.Mystic}`]: '🟥',
};

const display = (card, level=null) => {
  const abilities = card.abilities.map((ability) => {
    return { name: `${TYPE_EMOJI[ability.type]} ${ability.name}`, value: ability.description };
  });
  const cardTypes = card.types.map((type) => TYPE_EMOJI[type]).join(' ');
  const title = card.name + (level === null ? `` : ` (Level ${level})`);
  return new EmbedBuilder()
    .setColor(RARITY_COLOR[card.rarity])
    .setTitle(title)
    .setDescription(card.description)
    .addFields({ name: 'Types', value: cardTypes })
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
    const rawSlice = collection.slice(index * sliceSize, index * sliceSize + sliceSize);
    const outputLines = rawSlice.map(({id, level, exp}) => {
      const card = getCard(id);
      return `${RARITY_TO_EMOJI[card.rarity]} **${card.name}** (Level ${level})`;
    });
    const totalPages = Math.ceil(collection.length / sliceSize);
    outputLines.push(`\n*Page ${index + 1}/${totalPages}*`);
    return outputLines.join('\n');
  },
}