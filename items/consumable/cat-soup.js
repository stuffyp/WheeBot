const { ItemBuilder } = require('../imports.js');

const NAME = 'Cat Soup';

const consume = (params) => {
  const self = params.self;
  const target = params.target;
  target.doHeal(0.7 * target.maxHealth);
  self.consumeItem();
};

module.exports = {
  name: NAME,
  description: '(*Consumable*) Heals 70% of a target\'s health',
  cost: 200,
  item: new ItemBuilder().setName(NAME).setConsume(consume),
};