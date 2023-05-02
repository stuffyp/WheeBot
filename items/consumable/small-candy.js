const { ItemBuilder } = require('../imports.js');

const NAME = 'Small Candy';

const consume = (params) => {
  const self = params.self;
  const target = params.target;
  target.doHeal(0.2 * target.maxHealth);
  self.consumeItem();
}

module.exports = {
  name: NAME,
  description: "Heals 20% of a target's health",
  cost: 100,
  item: new ItemBuilder().setName(NAME).setConsume(consume),
}