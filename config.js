const config = require("./config.json");

config.columns = config.columns || [
  ["Symbol", "symbol"],
  ["Price", "price"],
  ["Change", "stats_delta_display"],
  ["Histogram", "stats_histogram"]
];

config.updateInterval = config.updateInterval || 300; // seconds
config.dataSource = config.dataSource || "crypto_compare";

if (config.fiatCurrencySymbol){
  config.fiatCurrencySymbol = config.fiatCurrencySymbol.toUpperCase();
}

if (config.currencySymbols){
  config.currencySymbols = config.currencySymbols.map(symbol => symbol.toUpperCase());
}

module.exports = config;
