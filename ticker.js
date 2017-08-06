const CoinMarketCap = require("./coin_market_cap");
const GUI           = require("./gui");

module.exports = class CryptoTicker {
  constructor(config = {}) {
    this.config = config;
    this.client = new CoinMarketCap(config);
    this.gui    = new GUI(config);

    setInterval(this.update.bind(this), config.updateInterval * 1000);
    this.update();
  }

  update(rows){
    this.client.getTicker((data) => {
      const indexedBySymbol = {};

      data.forEach((currencyData) => {
        indexedBySymbol[currencyData.symbol] = currencyData;
      });

      const currencySymbols = this.config.currencySymbols ||
                              data.map(currency => currency.symbol);

      let currencyData;
      const rows = currencySymbols.map((symbol) => {
        currencyData = indexedBySymbol[symbol];
        return columnsForCurrency(this.config.columns, currencyData);
      });

      this.gui.update(rows);
    });
  }
};

/* private */

const columnsForCurrency = (columns, currencyData) => {
  let key;

  return columns.map((column) => {
    key = column[1];
    return currencyData[key];
  });
};
