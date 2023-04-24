module.exports = {
  name: "Cat Soup",
  description: "Heals 50% of a target's health",
  cost: 200,
  execute: (target) => {
    target.health = Math.min(target.maxHealth, Math.ceil(target.health + 0.5 * target.maxHealth));
  },
}