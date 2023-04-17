const { EmbedBuilder } = require('discord.js');
const Card = require('./card.js');

module.exports = {
  display: (card) => {
    return new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`${card.name}`)
      .addFields(
    		{ name: `Health`, value: `${card.health}` },
        { name: `Attack`, value: `${card.attack}` },
        { name: `Abilities`, value: `${Object.keys(card.abilities).join(', ')}` },
    	)
  }
}