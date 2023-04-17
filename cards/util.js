const { EmbedBuilder } = require('discord.js');
const { RARITY_COLOR } = require('../util/constants.js');
const Card = require('./card.js');

module.exports = {
  display: (card) => {
    const abilities = Object.entries(card.abilities).map(([name, info]) => {
      return { name: name, value: info.description };
    });
    return new EmbedBuilder()
      .setColor(RARITY_COLOR[card.rarity])
      .setTitle(`${card.name}`)
      .addFields(
    		{ name: `Health`, value: `${card.health}`, inline: true },
        { name: `Attack`, value: `${card.attack}`, inline: true },
        { name: `Defense`, value: `${card.defense}`, inline: true },
    	)
      .addFields(abilities)
  }
}