const { Rarities } = require('./util/enums.js');
const Database = require("@replit/database");
const db = new Database();
const { startBattle } = require('./combat/combat-setup.js');
const { dump } = require('./combat/battle-storage.js');

db.get('_u_'+process.env.DEVELOPER).then((dev) => {
  console.log(dev.items);
  // dev.items['cactus armor'] = 10;
  // dev.items['quick boots'] = 10;
  // db.set('_u_'+process.env.DEVELOPER, dev).then(() => {
  //   console.log('done');
  // });
});