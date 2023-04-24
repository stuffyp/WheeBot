const { Stats } = require('../util/enums.js');

module.exports = class Modifier {
  static emptyModifier = new Modifier(Stats.None, () => { return; });
  
  stat;
  modify;
  constructor(stat, modify) {
    this.stat = stat;
    this.modify = modify;
  }
}