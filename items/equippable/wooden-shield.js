const { Stats, ItemBuilder } = require('../imports.js');

const NAME = "Wooden Shield";

module.exports = {
  name: NAME,
  description: "Increases defense by 20%",
  cost: 500,
  item: new ItemBuilder()
    .setName(NAME)
    .addModifier({
      stat: Stats.Defense,
      duration: Infinity,
      modify: (def, params) => def * 1.2,
    }),
}

console.error(module.exports.item);