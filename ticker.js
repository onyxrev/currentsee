const _  = require("lodash");
const GUI = require("./gui");

module.exports = class CryptoTicker {
  constructor(config = {}) {
    this.config = config;
    this.client = client(config);

    this.gui = new GUI(
      Object.assign(
        config,
        {
          dataSource: this.refresh.bind(this)
        }
      )
    );

    setInterval(this.refresh.bind(this), config.updateInterval * 1000);
    this.refresh();
  }

  refresh(){
    this.client.getTicker((data) => {
      const rows = _.keys(data).map(
                     symbol => columnsForCurrency(
                       this.config.columns,
                       data[symbol]
                     )
                   );

      this.gui.refresh(rows);
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

const client = (config) => {
  const lib = require(`./${config.dataSource}`);
  return new lib(config);
}
