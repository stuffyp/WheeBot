const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
    lastUpdated: { type: Number, default: 0 },
    items: [String],
});

module.exports = mongoose.model('shop', ShopSchema);