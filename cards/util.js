const { EmbedBuilder } = require('discord.js');
const { RARITY_COLOR } = require('../util/constants.js');
const Card = require('./card.js');

module.exports = {
  display: (card) => {
    return new EmbedBuilder()
      .setColor(RARITY_COLOR[card.rarity])
      .setTitle(`${card.name}`)
      .addFields(
    		{ name: `Health`, value: `${card.health}` },
        { name: `Attack`, value: `${card.attack}` },
        { name: `Abilities`, value: `${Object.keys(card.abilities).join(', ')}` },
    	)
  }
}