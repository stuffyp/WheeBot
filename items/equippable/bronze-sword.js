const { Stats, ItemBuilder } = require('../imports.js');

const NAME = "Bronze Sword";

module.exports = {
  name: NAME,
  description: "Increases attack by 40%",
  cost: 2500,
  item: new ItemBuilder()
    .setName(NAME)
    .addModifier({
      stat: Stats.Attack,
      duration: Infinity,
      modify: (atk, params) => atk * 1.4,
    }),
}