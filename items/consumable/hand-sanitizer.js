const { ItemBuilder } = require('../imports.js');

const NAME = 'Hand Sanitizer';

const consume = (params) => {
  const self = params.self;
  const target = params.target;
  target.listeners = [];
  target.modifiers = [];
  target.status = null;
  target.log(`${target.name} was cleansed of all effects and conditions!`);
  self.consumeItem();
};

module.exports = {
  name: NAME,
  description: '(*Consumable*) Remove all effects and conditions from target',
  cost: 1000,
  item: new ItemBuilder().setName(NAME).setConsume(consume),
};