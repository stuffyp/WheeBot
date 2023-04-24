const fs = require('node:fs');
const path = require('node:path');
const { sampleRange } = require('../util/random.js');

const ITEMS = [];
const NAME_TO_ID = {};

const consumables = path.join(__dirname, 'consumable');
const equippables = path.join(__dirname, 'equippable');
const folders = [consumables, equippables];

for (const folder of folders) {
  const templateFiles = fs.readdirSync(folder).filter(file => file.endsWith('.js'));
  for (const file of templateFiles) {
    const filePath = path.join(folder, file);
    const item = require(filePath);
    if (!(
        'name'        in item &&
        'description' in item && 
        'cost'        in item
    )) {
      console.log(`[WARNING] The item at ${filePath} is missing properties.`);
      continue;
    }
    ITEMS.push(item);
    NAME_TO_ID[item.name.toLowerCase()] = ITEMS.length - 1;
  }
}


module.exports = {
  rollItems: (numItems) => {
    const sample = sampleRange(ITEMS.length, numItems);
    sample.sort();
    return sample;
  },
  getItem: (id) => ITEMS[id],
  getID: (name) => NAME_TO_ID[name.toLowerCase()],
}

// console.error(NAME_TO_ID);