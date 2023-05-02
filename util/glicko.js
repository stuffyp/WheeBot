const { STARTING_GLICKO, MS_DAY } = require('./constants.js');

const MAX_RD = 300;
const MIN_RD = 30;

const C = 20;
const Q = Math.log(10) / 400;
const SQRT3 = Math.sqrt(3);

const calcRD = (glicko) => {
  const daysInactive = Math.floor((Date.now() - glicko.lastUpdated) / MS_DAY);
  return Math.min(Math.hypot(glicko.rd, C * Math.sqrt(daysInactive)), MAX_RD);
}
const calcG = (rd) => {
  return 1 / Math.hypot(1, SQRT3 * Q * rd / Math.PI);
}
const expected = (g, diff) => {
  const ex = g * diff / -400;
  return 1 / (1 + Math.pow(10, ex));
}
// 1/d^2
const dSquaredInv = (g, expected) => {
  return (Q * g)**2 * expected * (1 - expected);
}
const denom = (dsInv, rd) => (dsInv + rd ** -2);

module.exports = {
  // modifies glicko objects
  updateGlicko: (winner, loser) => {
    const rd_w = calcRD(winner);
    const rd_l = calcRD(loser);
    const g_w = calcG(rd_w);
    const g_l = calcG(rd_l);

    const expected_w = expected(g_l, winner.elo - loser.elo);
    const expected_l = expected(g_w, loser.elo - winner.elo);
    const dsInv_w = dSquaredInv(g_l, expected_w);
    const dsInv_l = dSquaredInv(g_w, expected_l);
    const denom_w = denom(dsInv_w, rd_w);
    const denom_l = denom(dsInv_l, rd_l);

    winner.elo += Q * g_l * (1 - expected_w) / denom_w;
    loser.elo += Q * g_w * (0 - expected_l) / denom_l;
    winner.rd = Math.max(MIN_RD, Math.sqrt(1 / denom_w));
    loser.rd = Math.max(MIN_RD, Math.sqrt(1 / denom_l));
    
    winner.lastUpdated = Date.now();
    loser.lastUpdated = Date.now();
  },
}