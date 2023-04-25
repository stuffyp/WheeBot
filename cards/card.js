module.exports = class Card {
  name;
  description;
  imageSrc;
  rarity;
  health;
  attack;
  defense;
  speed;
  magic;
  types;
  abilities;
  constructor(name, description, imageSrc, rarity, health, attack, defense, speed, magic, types, abilities){
    this.name = name;
    this.description = description;
    this.imageSrc = imageSrc;
    this.rarity = rarity;
    this.health = health;
    this.attack = attack;
    this.defense = defense;
    this.speed = speed;
    this.magic = magic;
    this.types = types;
    this.abilities = abilities; // array of abilities
  }
}