module.exports = {
  name: "Small Candy",
  description: "Heals 20% of a target's health",
  cost: 100,
  execute: (target) => {
    target.health = Math.min(target.maxHealth, Math.ceil(target.health + 0.2 * target.maxHealth));
  },
}