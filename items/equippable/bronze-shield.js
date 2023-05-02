const { Stats, ItemBuilder } = require('../imports.js');

const NAME = 'Bronze Shield';

module.exports = {
  name: NAME,
  description: 'Increases defense by 40%',
  cost: 2500,
  item: new ItemBuilder()
    .setName(NAME)
    .addModifier({
      stat: Stats.Defense,
      duration: Infinity,
      modify: (def, params) => def * 1.4,
    }),
};