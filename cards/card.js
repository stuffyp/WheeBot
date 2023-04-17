module.exports = class Card {
  constructor(name, rarity, health, attack, defense, speed, magic, types, abilities){
    this.name = name;
    this.rarity = rarity;
    this.health = health;
    this.attack = attack;
    this.defense = defense;
    this.speed = speed;
    this.magic = magic;
    this.types = types;
    this.abilities = abilities;
  }
}