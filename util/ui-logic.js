module.exports = {
  NAV_EMOJIS: ['⏮️', '⬅️', '➡️', '⏭️'],
  FULL_NAV_EMOJIS: ['⏮️', '⏪', '⬅️', '➡️', '⏩', '⏭️'],
  handleNav: (reaction, curIndex, maxIndex) => {
    switch (reaction.emoji.name) {
      case '⏮️':
        return 0;
      case '⏪':
        return Math.max(curIndex - 10, 0);
      case '⬅️':
        return curIndex === 0 ? maxIndex : curIndex - 1;
      case '➡️':
        return curIndex === maxIndex ? 0 : curIndex + 1;
      case '⏩':
        return Math.min(curIndex + 10, maxIndex);
      case '⏭️':
        return maxIndex;
      default:
        console.error('An unexpected reaction was recorded: ' + reaction);
        return null;
    }
  },
}