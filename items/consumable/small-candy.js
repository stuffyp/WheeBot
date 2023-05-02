const { ItemBuilder } = require('../imports.js');

const NAME = 'Small Candy';

const consume = (params) => {
  const self = params.self;
  const target = params.target;
<<<<<<< HEAD
  const originalHealth = target.health;
  if (target.knockedOut()) return `${NAME} could not be used as ${target.name} has been knocked out.`;
  target.health = Math.min(target.maxHealth, Math.ceil(target.health + 0.5 * target.maxHealth));
  params.self.consumeItem();
  return `${target.name} was healed for ${target.health - originalHealth} health!`;
};
=======
  target.doHeal(0.2 * target.maxHealth);
  self.consumeItem();
}
>>>>>>> 832beb3e515eca5faa4008548d7c6b2c0d2e80d4

module.exports = {
  name: NAME,
  description: 'Heals 20% of a target\'s health',
  cost: 100,
  item: new ItemBuilder().setName(NAME).setConsume(consume),
};