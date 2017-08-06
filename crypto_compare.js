const _                = require('lodash');
const Client           = require('node-rest-client').Client;
const client           = new Client();

const BASE_URL         = "https://min-api.cryptocompare.com";
const GET              = "get";
const SYMBOL           = "symbol";
const FROM_SYMBOL      = "FROMSYMBOL";
const PRICE            = "PRICE";
const CHANGE_24_HOUR   = "CHANGE24HOUR";
const PRICE_MULTI_FULL = "pricemultifull";
const DECIMALS         = 2;

const DEFAULT_HEADERS = {
  "Content-Type": "application/json"
};

const ENDPOINTS = {
  pricemultifull: "data/pricemultifull"
};

module.exports = class CoinMarketCap {
  constructor(options = {}) {
    this.currencySymbols    = options.currencySymbols;
    this.fiatCurrencySymbol = options.fiatCurrencySymbol;
  }

  getTicker(callback){
    get(
      PRICE_MULTI_FULL,
      {
        fsyms: this.currencySymbols.join(","),
        tsyms: [this.fiatCurrencySymbol].join(",")
      },
      allCurrencies => callback(this.normalizeCurrencies(allCurrencies))
    );
  }

  shouldIncludeCurrency(currencyData){
    return _.includes(this.currencySymbols, currencyData.FROMSYMBOL);
  }

  normalizeCurrencies(allCurrencies){
    return _.chain(allCurrencies["RAW"]).
             values().
             map(currencyData => currencyData[this.fiatCurrencySymbol]).
             filter(this.shouldIncludeCurrency.bind(this)).
             map(this.normalizeCurrency.bind(this)).
             keyBy(SYMBOL).
             valueOf();
  }

  normalizeCurrency(currencyData){
    return {
      id:                 currencyData[FROM_SYMBOL],
      price:              currencyData[PRICE].toString(),
      symbol:             currencyData[FROM_SYMBOL],
      percent_change_24h: round(currencyData[CHANGE_24_HOUR]).toString()
    };
  }
};

/* private */

const get = (...args) => {
  return request(GET, ...args);
};

const request = (method, endpointName, parameters, callback) => {
  return client[method](
    urlForEndpoint(endpointName),
    {
      parameters,
      headers: DEFAULT_HEADERS
    },
    callback
  );
};

const urlForEndpoint = (endpointName) => {
  return fullURL(
    ENDPOINTS[endpointName]
  );
};

const fullURL = (path) => {
  return [
    BASE_URL,
    path
  ].join("/");
};

const round = (value) => {
  return Number(Math.round(value+'e'+DECIMALS)+'e-'+DECIMALS);
}
