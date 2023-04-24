const { Stats, ItemBuilder } = require('../imports.js');

module.exports = {
  name: "Wooden Shield",
  description: "Increases defense by 20%",
  cost: 500,
  item: new ItemBuilder().setModifier(
    Stats.Defense,
    (def, params) => def * 1.2,
  ),
}