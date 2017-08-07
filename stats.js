const _ = require("lodash");
const colors = require('colors/safe');
const DECIMALS = 2;
const MAX_HISTORY = 10;
const intensityCharacters = {
  0.00: String.fromCharCode(9617),
  0.15: String.fromCharCode(9618),
  1.50: String.fromCharCode(9619)
};

const arrowCharacters = {
  neutral: " ",
  up:      String.fromCharCode(9650),
  down:    String.fromCharCode(9660)
};

module.exports = class Stats {
  constructor(options = {}){
    this.maxHistory = options.maxHistory || MAX_HISTORY;
    this.intensity = options.updateInterval / 1000;

    this.previous = {};
    this.history = {};
  }

  update(currenciesList){
    this.previous = this.current || {};

    let currentPrice, previousPrice, diff, delta;
    const stats = {};
    this.current = {};

    currenciesList.forEach((currency) => {
      currentPrice = parseFloat(currency.price);
      previousPrice = this.previous[currency.symbol];
      this.current[currency.symbol] = currentPrice;

      if (!_.isNumber(previousPrice)) return;

      diff = currentPrice - previousPrice;
      delta = diff / previousPrice;

      stats[currency.symbol] = {
        stats_delta:     delta,
        stats_delta_display: deltaToDisplay(delta),
        stats_arrow_character: arrowCharacter(delta),
        stats_intensity_character: intensityCharacter(delta, this.intensity)
      };

      const history = this.pushHistory(
        currency.symbol,
        stats[currency.symbol]
      );

      stats[currency.symbol].stats_history = history;
      stats[currency.symbol].stats_histogram = history.
                                         map(history => history.stats_intensity_character).
                                         join("");
    });

    return stats;
  }

  pushHistory(symbol, stats){
    const history = this.history[symbol] = this.history[symbol] || [];
    if (history.length > MAX_HISTORY) history.shift();

    history.push(stats);

    return history;
  }
};

const deltaToDisplay = (delta) => {
  const text = `${arrowCharacter(delta)} ${round(delta * 100)}%`;
  return colorizeNumber(delta, text);
};

const round = (value) => {
  return Number(Math.round(value+'e'+DECIMALS)+'e-'+DECIMALS);
};

const intensityCharacter = (delta, intensity) => {
  var char = intensityCharacters[0.00];
  var abs = Math.abs(delta / intensity);

  _.keys(intensityCharacters).forEach((intensityValue) => {
    if (abs > intensityValue) char = intensityCharacters[intensityValue];
  });

  return colorizeNumber(delta, char);
};

const arrowCharacter = (delta) => {
  if (delta == 0) return arrowCharacters.neutral;
  return delta > 0 ? arrowCharacters.up : arrowCharacters.down;
};

const colorizeNumber = (number, text) => {
  text = text || number;
  return number >= 0 ? colors.green(text) : colors.red(text);
};
