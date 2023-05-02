const { Stats, ItemBuilder } = require('../imports.js');

const NAME = "Quick Boots";

module.exports = {
  name: NAME,
  description: "Increases speed and defense by 20%",
  cost: 1500,
  item: new ItemBuilder()
    .setName(NAME)
    .addModifier({
      stat: Stats.Defense,
      duration: Infinity,
      modify: (def, params) => def * 1.2,
    })
    .addModifier({
      stat: Stats.Speed,
      duration: Infinity,
      modify: (spd, params) => spd * 1.2,
    }),
}