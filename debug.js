const { Rarities } = require('./util/enums.js');
const Database = require("@replit/database");
const db = new Database();
const { startBattle } = require('./combat/combat-setup.js');

startBattle('<idhere>', '<otheridhere>', 'a', 'b', 'c');