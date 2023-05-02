const { EmbedBuilder } = require('discord.js');
const { RARITY_COLOR, TYPE_EMOJI } = require('../util/constants.js');
const { Rarities } = require('../util/enums.js');
const Card = require('./card.js');
const { getCard } = require("./read-cards.js");
const { getItem } = require("../items/read-items.js");

const path = require('node:path');

const RARITY_TO_EMOJI = {
  [`${Rarities.Common}`]: '🟩',
  [`${Rarities.Rare}`]: '🟦',
  [`${Rarities.Epic}`]: '🟪',
  [`${Rarities.Legendary}`]: '🟨',
};

const imageFolder = path.join(path.dirname(__dirname), 'images');
// console.error(imageFolder);
const getImagePath = (imageSrc) => path.join(imageFolder, imageSrc);

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
      { name: `Speed`, value: `${card.speed}`, inline: true },
      { name: `Magic`, value: `${card.magic}`, inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
    )
    .addFields(abilities)
}


module.exports = {
  display: display,
  fullDisplay: ({id, level, exp, item}, index, collectionSize) => {
    const card = getCard(id);
    return display(card, level)
      .addFields({ name: 'Item', value: item ? getItem(item).name : 'No Item' })
      .setFooter({ text: `Page ${index+1}/${collectionSize}` });
  },
  imageDisplay: ({id, level, exp, item}, index, collectionSize) => {
    const card = getCard(id);
    return [
      display(card, level)
        .addFields({ name: 'Item', value: item ? getItem(item).name : 'No Item' })
        .setImage(`attachment://${card.imageSrc}`)
        .setFooter({ text: `Page ${index+1}/${collectionSize}` }),
      getImagePath(card.imageSrc),
    ];
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