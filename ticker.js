const _     = require("lodash");
const GUI   = require("./gui");
const Stats = require("./stats");

module.exports = class CryptoTicker {
  constructor(config = {}) {
    this.config = config;
    this.client = client(config);
    this.stats  = new Stats(config);

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
      addStats(this.stats, _.values(data));

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
  let key, value;

  return columns.map((column) => {
    key = column[1];
    value = currencyData[key];

    if (_.isUndefined(value)) value = "N/A";
    return value;
  });
};

const client = (config) => {
  const lib = require(`./${config.dataSource}`);
  return new lib(config);
};

const addStats = (stats, currenciesList) => {
  const statsBySymbol = stats.update(currenciesList);

  currenciesList.forEach((currencyData) => {
    Object.assign(currencyData, statsBySymbol[currencyData.symbol]);
  });
};
