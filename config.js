const os = require("os");
const fs = require("fs");

let config = {};
const configFileName = ".currentsee";

if (fs.existsSync(`${os.homedir()}/${configFileName}`)) {
  config = JSON.parse(fs.readFileSync(`${os.homedir()}/${configFileName}`, 'utf8'));
}

config.maxHistory = config.maxHistory || 30;

config.fiatCurrencySymbol = (
  config.fiatCurrencySymbol || "USD"
).toUpperCase();

config.currencySymbols = (
  config.currencySymbols || ["BTC", "ETH", "LTC"]
).map(symbol => symbol.toUpperCase());

config.updateInterval = config.updateInterval || 30;

config.columns = config.columns || [
  ["Symbol", "symbol"],
  ["Price", "price"],
  ["Change", "stats_delta_display"],
  ["Histogram", "stats_histogram"]
];

config.updateInterval = config.updateInterval || 300; // seconds
config.dataSource = config.dataSource || "crypto_compare";

module.exports = config;
