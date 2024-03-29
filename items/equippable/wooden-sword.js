const { Stats, ItemBuilder } = require('../imports.js');

const NAME = 'Wooden Sword';

module.exports = {
  name: NAME,
  description: 'Increases attack by 20%',
  cost: 500,
  item: new ItemBuilder()
    .setName(NAME)
    .addModifier({
      stat: Stats.Attack,
      duration: Infinity,
      modify: (atk, params) => atk * 1.2,
    }),
};