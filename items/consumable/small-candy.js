const { ItemBuilder, Listener, Events } = require('../imports.js');

const NAME = 'Small Candy';

const consume = (params) => {
  const self = params.self;
  const target = params.target;
  target.listeners.push(new Listener({
    triggers: [Events.TurnEnd],
    name: 'Small Candy',
    duration: Infinity,
    doEffect: (params) => {
      if (!params.self.knockedOut()) {
        params.self.doHeal(0.2 * params.self.maxHealth, 'Small Candy');
      }
    }
  }));
  self.consumeItem();
};

module.exports = {
  name: NAME,
  description: '(*Consumable*) Target recovers 20% of their health at the end of each turn',
  cost: 300,
  item: new ItemBuilder().setName(NAME).setConsume(consume),
};