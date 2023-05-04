const { ItemBuilder } = require('../imports.js');

const NAME = 'Energy Drink';

const consume = (params) => {
  const self = params.self;
  const target = params.target;
  target.magic = 100;
  target.log(`${target.name} was restored to full mana!`);
  self.consumeItem();
};

module.exports = {
  name: NAME,
  description: '(*Consumable*) Target returns to full mana',
  cost: 1000,
  item: new ItemBuilder().setName(NAME).setConsume(consume),
};