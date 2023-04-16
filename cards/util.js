const Card = require('./card.js');

module.exports = {
  display: (card) => {
    return text = `**NAME:** ${card.name}\n
**HEALTH:** ${card.health}\n
**ATTACK:** ${card.attack}\n
**ABILITIES:** ${Object.keys(card.abilities).join(', ')}`;
  }
}