const { Stats, ItemBuilder } = require('../imports.js');

const NAME = 'Chainmail';

module.exports = {
  name: NAME,
  description: 'Increases defense by 60% and reduces speed by 20%',
  cost: 5000,
  item: new ItemBuilder()
    .setName(NAME)
    .addModifier({
      stat: Stats.Defense,
      duration: Infinity,
      modify: (def, params) => def * 1.6,
    })
    .addModifier({
      stat: Stats.Speed,
      duration: Infinity,
      modify: (spd, params) => spd * 0.8,
    }),
};