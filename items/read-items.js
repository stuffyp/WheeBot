const fs = require('node:fs');
const path = require('node:path');
const { sampleRange } = require('../util/random.js');

const formatItemID = (name) => name.trim().toLowerCase();

const ITEMS = {};

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
    ITEMS[formatItemID(item.name)] = item;
  }
}


module.exports = {
  rollItems: (numItems) => {
    const sample = sampleRange(Object.keys(ITEMS), numItems);
    sample.sort();
    return sample;
  },
  getItem: (id) => ITEMS[formatItemID(id)],
}

// console.error(NAME_TO_ID);