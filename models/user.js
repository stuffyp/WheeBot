const mongoose = require('mongoose');
const { randInt } = require('../util/random.js');

const UserSchema = new mongoose.Schema({
    userId: String,
    cardCollection: [{
        id: String,
        fullID: Number,
        level: { type: Number, default: 1 },
        exp: { type: Number, default: 0 },
        item: { type: String, default: null },
    }],
    party: [Number],
    items: {
        type: Map,
        of: Number,
    },
    stats: {
        lastRoll: { type: Number, default: 0 },
        freeRolls: { type: Number, default: 5 },
        coins: { type: Number, default: 0 },
        glicko: {
            elo: { type: Number, default: 1500 },
            rd: { type: Number, default: 300 },
            lastUpdated: { type: Number, default: 0 },
        },
    },
    idSeed: { type: Number, default: randInt(999_999_999) },
    version: { type: String, default: '1.0' },
});

module.exports = mongoose.model('user', UserSchema);