const { ItemBuilder, Events } = require('../imports.js');

const NAME = 'Magic Stone';
const MANA_GAIN = 25;

module.exports = {
  name: NAME,
  description: `When attacked, gain ${MANA_GAIN} mana`,
  cost: 3000,
  item: new ItemBuilder()
    .setName(NAME)
    .addListener({
      name: NAME,
      triggers: [Events.GotAttacked],
      duration: Infinity,
      doEffect: (params) => {
        const agent = params.agent;
        if (!agent.knockedOut()) {
          agent.magic = Math.min(agent.magic + MANA_GAIN, 100);
          agent.log(`${agent.name} gained ${MANA_GAIN} mana from ${NAME}!`);
        }
      },
    }),
};