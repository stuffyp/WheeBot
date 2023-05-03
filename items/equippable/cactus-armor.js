const { ItemBuilder, Events } = require('../imports.js');

const NAME = 'Cactus Armor';

module.exports = {
  name: NAME,
  description: 'Reflects 40% of damage back to attacker',
  cost: 4000,
  item: new ItemBuilder()
    .setName(NAME)
    .addListener({
      name: NAME,
      triggers: [Events.GotAttacked],
      duration: Infinity,
      doEffect: (params) => {
        if (!params.agent.knockedOut()) {
          const reflectDamage = Math.ceil(0.4 * params.damage);
          params.agent.doDamage(reflectDamage, 1, NAME);
        }
      },
    }),
};