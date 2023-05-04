const { ItemBuilder } = require('../imports.js');

const NAME = 'Snowball';

const consume = (params) => {
  const self = params.self;
  const target = params.target;
  target.doFreeze();
  self.consumeItem();
};

module.exports = {
  name: NAME,
  description: '(*Consumable*) Freeze target creature',
  cost: 700,
  item: new ItemBuilder().setName(NAME).setConsume(consume),
};